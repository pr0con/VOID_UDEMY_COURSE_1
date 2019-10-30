package main

import(
	"fmt"
	"log"
	"flag"
	"sync"
	"net/http"
	"io/ioutil"
	"encoding/json"
	
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	
	"procon_jwt"
	"procon_sse"
	"procon_data"
	"procon_utils"
	"procon_mysql"
	"procon_wspty"
	"procon_mongo"
	"procon_config"
	"procon_asyncq"
	"procon_filesystem"	
)

var addr = flag.String("addr", "0.0.0.0:1200", "http service address")
var upgrader = websocket.Upgrader{}

type msg struct {
	Jwt string `json:"jwt"`
	Type string `json:"type"`
	Data string	`json:"data"`
}

func sendMsg(j string, t string, d string, c *websocket.Conn) {
	m := msg{j, t, d};
	if err := c.WriteJSON(m); err != nil {
		fmt.Println(err)
	}

	//mm, _ := json.Marshal(m);
	//fmt.Println(string(mm));
}


func handleAPI(w http.ResponseWriter, r *http.Request) {
		
	swp := r.Header.Get("Sec-Websocket-Protocol");
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	
	rh := http.Header{}
	if swp == "master" { rh.Set("Sec-Websocket-Protocol", "master"); }
			
	c, err := upgrader.Upgrade(w, r, rh)
	if err != nil {
		fmt.Print("WTF @HandleAPI Ws Upgrade Error> ", err)
		return
	}
	
	id, err := uuid.NewRandom() 
	if err != nil { fmt.Println(err) }
	
	var nc procon_data.Client		
	
	if(swp == "master") {		
		//Could convert to task later...
		w.Header().Set("Sec-Websocket-Protocol", "master")
		
		nc = procon_data.Client{ 
			Id: "ws"+id.String(),
			Conn: c,
		}	
		procon_data.Ps.AddClient(nc)
		procon_sse.RedisSet("ws-"+id.String(),"null")
		
		//X-tra special addition...
		//not used yet..
		//modified gorilla websocket source
		//c.Uuid = "ws-"+id.String()
		
		procon_sse.RedisAddSseMsg("A Master Websocket Connection detected...");
	}	
	
	Loop:
		for {
			in := msg{}
			
			err := c.ReadJSON(&in)
			if err != nil {
				//fmt.Println("Error reading json.", err)
				c.Close()
				
				//remove redis key
				if(swp == "master") {
					procon_sse.RedisDel("ws-"+id.String())
					procon_data.Ps.RemoveClient(nc) 
					procon_sse.RedisAddSseMsg("A Master Websocket Diconnected.") 
				}				
				break Loop
			}
			
			switch(in.Type) {	
				case "get-jwt-token":
					fmt.Println(in.Data); 
					
					usr, pwd, err := procon_utils.B64DecodeTryUser(in.Data);
					if err != nil { fmt.Println(err);  } else {  fmt.Println(string(usr), string(pwd))  }
					
					upv, auser, err := procon_mongo.MongoTryUser(usr,pwd)
					
					if err != nil { fmt.Println(err); sendMsg("noop", "invalid-credentials","noop", c); } else { 
						if upv == true { fmt.Println("A user has logged in."); }
						auser.Password = "F00"
						jauser,err := json.Marshal(auser); if err != nil { fmt.Println("error marshaling AUser.") } else {
							jwt, err := procon_jwt.GenerateJWT(procon_config.PrivKeyFile);
							
							if err != nil { fmt.Println(err);  } else  { sendMsg(jwt, "jwt-token", string(jauser), c);  }								
						}
					}										
					break;				
				case "verify-jwt-token": fallthrough
				case "validate-stored-jwt-token":
					valid, err := procon_jwt.ValidateJWT(procon_config.PubKeyFile,in.Jwt)	
					if err != nil { fmt.Println(err); sendMsg("^vAr^", "jwt-token-invalid",err.Error(), c) } else if (err == nil && valid ) {	
					    if in.Type == "verify-jwt-token" { sendMsg("^vAr^", "jwt-token-valid","noop", c) }
					    if in.Type == "validate-stored-jwt-token" {  sendMsg("^vAr^", "stored-jwt-token-valid","noop", c) }
					}		
					break;
				case "rapid-test-user-avail":
					tobj := procon_mongo.NewRapidTestUserAvailTask(in.Data, c);
					procon_asyncq.TaskQueue <- tobj					
					break;
				case "create-user":
					tobj := procon_mongo.NewCreateUserTask(in.Data, c);
					procon_asyncq.TaskQueue <- tobj
					break;
				
				//FileSystem	
				case "get-fs-path":
					tobj :=  procon_filesystem.NewGetFileSystemTask(in.Data, c);
					procon_asyncq.TaskQueue <- tobj
					break;
				case "return-fs-path-data":
					data, err := ioutil.ReadFile(in.Data);
					if err != nil { fmt.Println(err); } else {
						sendMsg("vAr","rtn-file-data", string(data), c);
					}
					break;
					
					
				//Operations...	
				case "get-mysql-databases":
					tobj := procon_mysql.NewGetMysqlDbsTask(c);
					procon_asyncq.TaskQueue <- tobj					
					break;				
					
																						
				default:
					break;
			}
		}
}
			
	

func handleUI(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	component := params["component"]
	subcomponent := params["subcomponent"]

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json");
	fmt.Println(component);

	var wg sync.WaitGroup	
	wg.Add(1)
	
	tobj :=  procon_mongo.NewGetDocumentsTask("UI",component,subcomponent, w, &wg); //notice the pointer to the wait group
	procon_asyncq.TaskQueue <- tobj
		
	wg.Wait();
	fmt.Println("Wait Group Finished Success...");
}


func main() {
	procon_asyncq.StartTaskDispatcher(9)
	go procon_sse.ConfigureSystemHeartbeat()
	go procon_sse.StartSSE()	
	
	flag.Parse()
	log.SetFlags(0)	
	
	r := mux.NewRouter()
	
	//Websocket API
    r.HandleFunc("/api", handleAPI)
	r.HandleFunc("/pty", procon_wspty.HandleWsPty)
	
	//Rest API
	r.HandleFunc("/rest/api/ui/{component}/{subcomponent}", handleUI)
	
	http.ListenAndServeTLS(*addr,"/etc/letsencrypt/live/void.pr0con.com/cert.pem", "/etc/letsencrypt/live/void.pr0con.com/privkey.pem" , r)		
}