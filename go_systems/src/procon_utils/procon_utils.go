package procon_utils

import (
	"fmt"
	"encoding/json"	
	b64 "encoding/base64"
	
	"golang.org/x/crypto/bcrypt"
	"github.com/gorilla/websocket"
	
	"procon_data"
)

func B64DecodeTryUser(test_user_json_str string) ([]byte,[]byte,error) {
	var tu procon_data.TryUser
	err := json.Unmarshal([]byte(test_user_json_str), &tu)
	if err != nil { fmt.Println(err); return nil,nil, err } else {
		//fmt.Println(tu)
		tu_u_sDec, _ := b64.StdEncoding.DecodeString(string(tu.User));
		tu_p_sDec, _ := b64.StdEncoding.DecodeString(string(tu.Password));
		//fmt.Println("TU: ",string(tu_u_sDec));
		//fmt.Println("TP: ",string(tu_p_sDec));
		
		return tu_u_sDec, tu_p_sDec, nil
	}
}

//used in procon_mongo.MongoTryUser
func ValidateUserPassword( tryPass []byte, byteHash []byte) (bool, error) {
	err := bcrypt.CompareHashAndPassword(byteHash, tryPass)
	if err != nil { return false,err } else {  return true,nil }
}

func GenerateUserPassword( pwdstr string ) (string) {
	hp, err := bcrypt.GenerateFromPassword([]byte(pwdstr), 0)
	if err != nil {
		fmt.Println("Generate BCrypt Error: %s", err)
	}
	return string(hp)
}

func SendMsg(j string, t string, d string, c *websocket.Conn) {
	m := procon_data.Msg{j, t, d};
	if err := c.WriteJSON(m); err != nil {
		fmt.Println(err)
	}

	//mm, _ := json.Marshal(m);
	//fmt.Println(string(mm));
}
