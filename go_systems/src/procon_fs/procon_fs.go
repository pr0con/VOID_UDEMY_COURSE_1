package procon_fs

import (
	"io"
	"os"
	"fmt"
	"io/ioutil"
)

func CreateFile(p string, fn string) (string,bool,error) { //string ok err
	// detect if file exists
	var _, err = os.Stat(p+fn)

	// create file if not exists
	if os.IsNotExist(err) {
		var file, err = os.Create(p+fn)
		if err != nil { return "",false, err }
		defer file.Close()
	}
	return p+fn,true,nil
}

func ReadFile(fp string) ([]byte,bool,error) {
	// re-open file
	var file, err = os.OpenFile(fp, os.O_RDWR, 0644)
	if err != nil  { return []byte(""),false,err }
	defer file.Close()

	// read file, line by line
	var data = make([]byte, 1024)
	for {
		_, err = file.Read(data)
		
		// break if finally arrived at end of file
		if err == io.EOF {
			break
		}
		
		// break if error occured
		if err != nil && err != io.EOF {
			break
		}
	}
	
	fmt.Println("==> done reading from file")
	return data,true,nil
}


func WriteFile(fp string, data []byte) {
	// open file using READ & WRITE permission
	//fmt.Println(data);
	
	var file, err = os.OpenFile(fp, os.O_RDWR, 0644)
	if err != nil { return }
	defer file.Close()

	//clear then set cursor at pos 0
	file.Truncate(0)
	file.Seek(0,0)

	// write some text line-by-line to file
	err = ioutil.WriteFile(file.Name(), data, 0664)
	if err != nil { return }

	// save changes
	err = file.Sync()
	if err != nil { return }

	fmt.Println("==> done writing to file")
}

func DeleteFile(p string) {
	// delete file
	var err = os.Remove(p)
	if err != nil { return }

	fmt.Println("==> done deleting file")
}