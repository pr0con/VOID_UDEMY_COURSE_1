package procon_wspty

import (
	"io"
	"os"
	"fmt"
	"os/exec"
	"net/http"
	"encoding/base64"
	
	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

/*** Pty ***/
type wsPty struct {
	Cmd *exec.Cmd // pty builds on os.exec
	Pty *os.File  // a pty is simply an os.File
}


func (wp *wsPty) Start(x_ int, y_ int) {
	var err error
	
	var Winsize pty.Winsize;
	Winsize.Cols = uint16(130);
	Winsize.Rows = uint16(30);
	
	x := uint16(x_)
	y := uint16(y_)


	Winsize.X = x;
	Winsize.Y = y;	
	
	wp.Cmd = exec.Command("pm2", "dashboard")
	wp.Pty, err = pty.StartWithSize(wp.Cmd, &Winsize)
	if err != nil {
		fmt.Println("Failed to start command: %s\n", err)
	}
}

func (wp *wsPty) Stop() {
	wp.Pty.Close()
	wp.Cmd.Wait()
}

type socketDataWinsize struct {
	Type   string   `json:"type"`
	Width  int 		`json:"width"`
	Height int 		`json:"height"`
}
/****/

func HandleWsPty(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("upgrade:", err)
		return
	}		
	mws := socketDataWinsize{}
		
	err = c.ReadJSON(&mws)
	if err != nil {
		fmt.Println("Error reading json.", err)
	}
	fmt.Printf("Got Winsize: %#v\n", mws)
	

	wp := wsPty{}
	// TODO: check for errors, return 500 on fail
	//
	wp.Start(mws.Width, mws.Height)	

			
	//Go Routine To handle PTY In >-->  Out2 Ws
	go func() {
		buf := make([]byte, 128)
		// TODO: more graceful exit on socket close / process exit
		for {
			n, err := wp.Pty.Read(buf)
			if err != nil {
				fmt.Println("Failed to read from pty master: %s", err)
				wp.Stop();
				return
			}

			out := make([]byte, base64.StdEncoding.EncodedLen(n))
			base64.StdEncoding.Encode(out, buf[0:n])
			

			err = c.WriteMessage(websocket.TextMessage, out)

			if err != nil {
				fmt.Println("Failed to send %d bytes on websocket: %s", n, err)
				wp.Stop();
				return
			}
		}
	}()
		
		
	//main for loop handling websocket in data Ws In >--> Out2 Pty
	for {
		mt, payload, err := c.ReadMessage()
		if err != nil {
			if err != io.EOF {
				fmt.Printf("conn.ReadMessage failed: %s\n", err)
				return
			}
		}	
		switch mt {
			case websocket.BinaryMessage:
				fmt.Printf("Ignoring binary message: %q\n", payload)
			case websocket.TextMessage:
				buf := make([]byte, base64.StdEncoding.DecodedLen(len(payload)))
				_, err := base64.StdEncoding.Decode(buf, payload)
				if err != nil {
					fmt.Printf("base64 decoding of payload failed: %s\n", err)
				}
				
			//wp.Pty.Write(buf)
			default:
				fmt.Printf("Invalid message type %d\n", mt)
				return
		}				
	}
	
}