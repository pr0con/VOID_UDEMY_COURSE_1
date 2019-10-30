package procon_filesystem


import (
    "os"
    "fmt"
    "time"
    "path/filepath"
    _ "encoding/json"
    
    "github.com/gorilla/websocket"
)
//Reciever Functions Act on New Struct Passed or Created from Constructor Methods...


// FileInfo is a struct created from os.FileInfo interface for serialization.
type FileInfo struct {
	Name    string      `json:"name"`
	Size    int64       `json:"size"`
	Mode    os.FileMode `json:"mode"`
	ModTime time.Time   `json:"mod_time"`
	IsDir   bool        `json:"is_dir"`
}

//Helper function to create a local FileInfo struct from os.FileInfo interface.
func fileInfoFromInterface(v os.FileInfo) *FileInfo {
	return &FileInfo{v.Name(), v.Size(), v.Mode(), v.ModTime(), v.IsDir()}
}

// Node represents a node in a directory tree.
type Node struct {
	FullPath string    `json:"path"`
	Info     *FileInfo `json:"info"`
	Children []*Node   `json:"children"`
	Parent   *Node     `json:"-"`
}

// Create directory hierarchy.
/* Usage
		root, err := procon_filesystem.NewTree("/var/www/")
		if err != nil {
			log.Print("dtree:", err)
		}
		mroot,_ := json.MarshalIndent(root,"", "\t")
		fmt.Println(string(mroot));
		
		if err = c.WriteJSON(root); err != nil {
			fmt.Println(err)
		}		
*/
func NewTree(root string) (result *Node, err error) {
	absRoot, err := filepath.Abs(root)
	if err != nil {
		return
	}
	parents := make(map[string]*Node)
	walkFunc := func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		parents[path] = &Node{
			FullPath: path,
			Info:     fileInfoFromInterface(info),
			Children: make([]*Node, 0),
		}
		return nil
	}
	if err = filepath.Walk(absRoot, walkFunc); err != nil {
		return
	}
	
	for path, node := range parents {
		parentPath := filepath.Dir(path)
		parent, exists := parents[parentPath]
		if !exists { // If a parent does not exist, this is the root.
			result = node
		} else {
			node.Parent = parent
			parent.Children = append(parent.Children, node)
		}
	}
	
	return
}

type GetFileSystemTask struct {
	path string
	ws *websocket.Conn
} 

func NewGetFileSystemTask(path string, ws *websocket.Conn) *GetFileSystemTask {
	return &GetFileSystemTask{path, ws}
}

func (t *GetFileSystemTask) Perform() {
	root, err := NewTree(t.path)
	if err != nil {
		fmt.Print("dtree:", err)
	}
	//internal usage debugging..
	//mroot,_ := json.MarshalIndent(root,"", "\t")
	//fmt.Println(string(mroot));
	
	if err = t.ws.WriteJSON(root); err != nil {
		fmt.Println(err)
	}	
}