package main

import(
	"fmt"
	
	"procon_utils"	
)

func main() {
	p := procon_utils.GenerateUserPassword("SOMEHARDPASSWORD");	
	fmt.Println(p);
}