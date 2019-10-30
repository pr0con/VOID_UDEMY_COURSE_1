package main

import (
	"fmt"
	
	"procon_fs"
	"procon_config"
	"procon_genkeys"			
)

func main() {
	//Will need a public key to validate
	//openssl rsa -in mykey.pem -pubout > mykey.pub
	
	pk, err := procon_genkeys.PrivateKeyToEncryptedPEM(1028, "SOMEHARDPASSWORD");
	if err != nil {
		fmt.Println(err);
	}
	
	f,ok,err := procon_fs.CreateFile(procon_config.KeyCertPath,"mykey.pem");
	if !ok { fmt.Println( err) } else { procon_fs.WriteFile(f, pk) }
}

