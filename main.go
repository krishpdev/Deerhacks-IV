package main

import (
	"git.sr.ht/~adnano/go-gemini"
	"fmt"
	"context"
)

func main() {
	client := &gemini.Client{}
	ctx := context.Background()
	resp, err := client.Get(ctx, "gemini://geminiprotocol.net/")
	if err != nil {
		// handle error
		fmt.Println(err)
	}
  fmt.Println(resp.Status)
  fmt.Println(resp.Meta)
  fmt.Println(resp.Body)
	defer resp.Body.Close()
}
