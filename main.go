package main

import (
	"git.sr.ht/~adnano/go-gemini"
	"fmt"
	"context"
	"io"
	"log"
)

func main() {
	client := &gemini.Client{}
	ctx := context.Background()
	resp, err := client.Get(ctx, "gemini://geminiprotocol.net/")
	if err != nil {
		fmt.Println(err)
		return
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
  fmt.Println(string(body))

}
