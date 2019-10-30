package procon_config

import (
	"fmt"
	"crypto/rsa"

	jwtgo "github.com/dgrijalva/jwt-go"

	"procon_fs"
	//"procon_jwt"
)

var (
	PubKeyFile	*rsa.PublicKey
	PrivKeyFile *rsa.PrivateKey	
)

//these can also be set...

const (

	PKPWD = "SOMEHARDPASSWORD"

	KeyCertPath = "/var/www/keycertz/"
	PrivKeyPath = "/var/www/keycertz/mykey.pem"
	PubKeyPath  = "/var/www/keycertz/mykey.pub"	

	//dont forget to escape characters like @ w/ %40

	MongoHost = "127.0.0.1"
	MongoUser = "mongod"
	MongoPassword = "SOMEHARDPASSWORD"
	MongoDb = "admin"


	RedisRP = "V3aJqM5pKl/NX7VpJ8mBr35vzcyfQHn8Rd5xlXucJRcwIVSMs1EBoGCgQJuUBW03ZKyraewi42ZnKQJ"
	MysqlPass = "SOMEHARDPASSWORD"	
)


func init() {
	f,ok,err := procon_fs.ReadFile(PubKeyPath)

	if (!ok || err != nil) { fmt.Println(err) } else {
		//PubKeyFile, err = procon_jwt.ParseRSAPublicKeyFromPEM(f)
		PubKeyFile, err = jwtgo.ParseRSAPublicKeyFromPEM(f)
		if err != nil { fmt.Println(err) }	
	}

	f,ok,err = procon_fs.ReadFile(PrivKeyPath)	
	
	if (!ok || err != nil) { fmt.Println(err) } else {
		//PrivKeyFile, err = procon_jwt.ParseRSAPrivateKeyFromPEMWithPassword(f, PKPWD)
		PrivKeyFile, err = jwtgo.ParseRSAPrivateKeyFromPEMWithPassword(f, PKPWD)
		if err != nil { fmt.Println(err) }
	}	
}
