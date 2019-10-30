package procon_mysql

import (
	"fmt"
	"database/sql"
	"encoding/json"
	
	"github.com/gorilla/websocket"
	_ "github.com/go-sql-driver/mysql"
	
	"procon_config"
	"procon_utils"
)


var DBCon *sql.DB

func init() {
	var err error
	DBCon, err = sql.Open("mysql", "root:"+procon_config.MysqlPass+"@tcp(127.0.0.1:3306)/")
	err = DBCon.Ping();
	if err != nil {
	    fmt.Println(err);
	}
	DBCon.SetMaxOpenConns(20)		
}



type GetMysqlDbsTask struct {
	ws *websocket.Conn
}

func NewGetMysqlDbsTask(ws *websocket.Conn)  *GetMysqlDbsTask {
	return	&GetMysqlDbsTask{ws}
}

func (rmdst *GetMysqlDbsTask) Perform() {
	var dbnames []string;
	rows, err := DBCon.Query("SHOW DATABASES;")
	if err != nil {
		fmt.Println(err);
	}else {
		var dbs string
		for rows.Next() {
		    rows.Scan(&dbs)
		    dbnames = append(dbnames, dbs)
		    fmt.Println(dbs)		    
		}
	}
	jdbnames, _ := json.Marshal(dbnames)
	fmt.Println(string(jdbnames))
	
	procon_utils.SendMsg("vAr","mysql-dbs-list", string(jdbnames), rmdst.ws);
}