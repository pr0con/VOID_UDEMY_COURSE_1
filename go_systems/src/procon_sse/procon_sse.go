//https://golangme.com/blog/how-to-use-redis-with-golang/ redigo option
//https://gist.github.com/artisonian/3836281 <-- sse example
//https://www.youtube.com/watch?v=yyREnTgRTQ0 <-- websocket chat ex.
//https://github.com/go-redis/redis/blob/master/iterator.go
//https://stored.tips/example-sse-server-in-golang
//https://www.alexedwards.net/blog/working-with-redis <-- good material
//https://github.com/r3labs/sse  nice...
//https://github.com/go-redis/redis/blob/master/example_test.go
package procon_sse

import (
	"fmt"
	"flag"
	"time"
	"net/http"
	"strconv" //for debugging deletes
	"encoding/json"
	
	"github.com/go-redis/redis"
	
	"procon_data"
	"procon_config"
)
var sse_addr = flag.String("sse_addr", "0.0.0.0:1300", "sse http service address")


var redis_client *redis.Client
func sseHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	pong, err := redis_client.Ping().Result()
	if err != nil { fmt.Println("Redis Connected: ",pong, err)	}
	
	payload := map[string]interface{} {
		"ssemsg": "Hello From SSE Server",
		"ripc" : pong,
	}
	
	jp,err := json.Marshal(payload);
	if err == nil { fmt.Fprintf(w, "data: %s\n\n", jp) } else {
		fmt.Println(err);
	}
	
	jsu, err := json.Marshal(procon_data.Su);
	if err == nil { fmt.Fprintf(w, "data: %s\n\n", jsu) } else {
		fmt.Println(err);
	}
}

/*  AND USE HSET HGET NEXT .... v2 soon
create a slice of strings with the keys. Call the function using variadic syntax:
var keys []string
keys = append(keys, "foo")
keys = append(keys, "bar")
sc := client.MGet(keys...)

The same approach works with Redigo, but use a slice of interface instead of a slice of strings:
var keys []interface{}
keys = append(keys, "foo")
keys = append(keys, "bar")
r, err := conn.Do("MGET", keys...)
*/

//add go func to periodically send all clients as large json array...
func ConfigureSystemHeartbeat() { 
	redis_client = redis.NewClient(&redis.Options{
		Addr:     "127.0.0.1:6379",
		Password: procon_config.RedisRP,
		DB:       0, 
	});

	//Note Delete redis key but does not remove from interal data...
	go func(su *procon_data.SseUpdate) {
		var lid = true;	 //Last Iteration Done...	
		for range time.Tick(time.Second * 5) {
			if  lid == true {
				lid = false;
				iter := redis_client.Scan(0, "sseMsg-*", 0).Iterator()
				for iter.Next() {
				    val, err := redis_client.Get(iter.Val()).Result()
				    if err == nil { 
					    var sue = make(map[string]interface{})
					    sue["id"] = iter.Val()
					    sue["msg"] = val
					    su.Data = append(su.Data, sue)
					    n, err := redis_client.Del(iter.Val()).Result()
						if err != nil { fmt.Println(err) } else {  if(n > 0) {fmt.Println(strconv.FormatInt(n,10)+" key(s) removed ")} }
				    } else if err != nil { fmt.Println("error if redis scan loop values") }
				}
				if err := iter.Err(); err != nil {
				    fmt.Println("Redis Scan Error");
				}
				//jsonStr, _ := json.Marshal(su)
				//if (len(su.Data) > 0) { /*fmt.Println(string(jsonStr)) DEBUG DATA*/ }
				lid = true;
			}
		}
	}(procon_data.Su)
	
	//not part of the sse stuff because were sending to websockets
	go func() {
		var lid = true;	 //Last Iteration Done...	
		for range time.Tick(time.Second * 5) {
			if lid == true {
				lid = false;
				kva := make([]map[string]string,  0, 0)
				
				iter := redis_client.Scan(0, "ws-*", 0).Iterator()
				for iter.Next() {
				    val, err := redis_client.Get(iter.Val()).Result()
				    if err == nil { 
					    kv := make(map[string]string);
					    kv["key"] = iter.Val()
					    kv["val"] = val
					    kva = append(kva, kv)
				    } else if err != nil { fmt.Println("error if redis scan loop values") }
				}
				if err := iter.Err(); err != nil {
				    fmt.Println("Redis Scan Error");
				}
				jsonStr, _ := json.Marshal(kva)
				if (len(kva) > 0) { /*fmt.Println(string(jsonStr)) DEBUG DATA*/ }				
				
				//send to all websockets connected 
				procon_data.Ps.PublishAll(string(jsonStr))			
				
				lid = true;
			}
		}
	}()
}
 
func StartSSE() {
	http.HandleFunc("/sse", sseHandler)
	fmt.Println(http.ListenAndServeTLS(*sse_addr,"/etc/letsencrypt/live/void.pr0con.com/fullchain.pem","/etc/letsencrypt/live/void.pr0con.com/privkey.pem" ,nil))
} 


/***** Redis Access Functions *****/
func RedisSet(k string, v string) {
	err := redis_client.Set(k, v, 0).Err()
	if err != nil { fmt.Println(err) }
}
func RedisDel(k string) {
	_, err := redis_client.Del(k).Result()
	if err != nil { fmt.Println(err) }
}

var ssemc = 1;
func RedisAddSseMsg(v string) {
	RedisSet("sseMsg-"+strconv.Itoa(ssemc),v)
	ssemc++;
	if(ssemc == 101) { ssemc = 1; } 
}
