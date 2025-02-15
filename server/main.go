package main

import (
	"git.sr.ht/~adnano/go-gemini"
	"fmt"
	"context"
	"io"
	"log"
	"net/http"
	"encoding/json"
	//"os"
	//"errors"
)

func getBody(url string) string {
	client := &gemini.Client{}
	ctx := context.Background()
	resp, err := client.Get(ctx, url)
	if err != nil {
		fmt.Println(err)
		return ""
	}
	defer resp.Body.Close()

	fmt.Println(resp.Status) // This will print the status code of the response
	fmt.Println(resp.Meta) // This will print the status code of the response

  // Read the body
  body, err := io.ReadAll(resp.Body)
  if err != nil {
      log.Fatal(err)
  }

  // Use the body contents (it's a []byte)
  return string(body)
  //fmt.Println(string(body))
}

// root endpoint
func getRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("got / request\n")
	io.WriteString(w, "This is my website!\n")
}

func getUrlAPI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
		case "POST":
			fmt.Println("POST request received")
			decoder := json.NewDecoder(r.Body)
			var data map[string]interface{}
			err := decoder.Decode(&data)
			if err != nil {
				log.Fatal(err)
			}
			url := data["url"].(string)
			fmt.Println("URL: ", url)
			resp := getBody(url)
			io.WriteString(w, resp)
		default:
			io.WriteString(w, "Only POST method is allowed")
	}
}

func main() {
	http.HandleFunc("/", getRoot)
	http.HandleFunc("/geturl", getUrlAPI)

	// Add error handling for ListenAndServe
	if err := http.ListenAndServe(":3333", nil); err != nil {
		log.Fatal(err)
	}

	//resp := getBody("gemini://geminiprotocol.net/")
	//fmt.Println(resp)
}
