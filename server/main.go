package main

import (
	"context"
	"encoding/json"
	"fmt"
	"git.sr.ht/~adnano/go-gemini"
	"io"
	"log"
	"net/http"
	"strings"
	"github.com/rs/cors"
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

	fmt.Println(resp.Status)
	fmt.Println(resp.Meta)

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}

	return string(body)
}

func parseBodyJson(url string, body string) []map[string]interface{} {
	fmt.Println(body)
	var results []map[string]interface{}
	lines := strings.Split(body, "\n")
	fmt.Printf("%d lines\n", len(lines))

	for i := 0; i < len(lines); i++ {
		if i >= len(lines) {
			break
		}
		fmt.Println(i)
		// Initialize a new map for each line
		jsonLine := make(map[string]interface{})

		// Handle code blocks (needs at least 3 characters)
		if len(lines[i]) >= 3 && lines[i][:3] == "```" {
			messagesegment := ""
			i++
			for i < len(lines) {
				if len(lines[i]) >= 3 && lines[i][:3] == "```" {
					break
				}
				messagesegment += lines[i] + "\n"
				i++
			}
			jsonLine["objecttype"] = "codeblock"
			jsonLine["content"] = messagesegment
			results = append(results, jsonLine)
			continue
		}

		// Handle header level 3
		if len(lines[i]) >= 3 && lines[i][:3] == "###" {
			jsonLine["objecttype"] = "header3"
			jsonLine["content"] = lines[i][3:]
			results = append(results, jsonLine)
			continue
		}

		// Handle header level 2 and links
		if len(lines[i]) >= 2 {
			if lines[i][:2] == "##" {
				jsonLine["objecttype"] = "header2"
				jsonLine["content"] = lines[i][2:]
				results = append(results, jsonLine)
				continue
			} else if lines[i][:2] == "=>" {
				jsonLine["objecttype"] = "link"
				contentsplit := strings.Fields(lines[i][2:])
				fmt.Printf("length is: %d\n", len(contentsplit))
				if len(contentsplit) > 0 {
					fmt.Printf("link is: %q\n", contentsplit[0])
					// check if root link or not root link
					if len(contentsplit[0]) >= 9{
						if strings.HasPrefix(contentsplit[0], "gemini://") || strings.HasPrefix(contentsplit[0], "http://") || strings.HasPrefix(contentsplit[0], "https://"){
						jsonLine["link"] = contentsplit[0]
						} else{
							jsonLine["link"] = url + contentsplit[0]
						}
					} else{
						jsonLine["link"] = url + contentsplit[0]
					}
					fmt.Printf("%q\n", jsonLine["link"])

					if len(contentsplit) > 1 {
						jsonLine["content"] = strings.Join(contentsplit[1:], " ")
					}
					results = append(results, jsonLine)
				}
				continue
			}
		}

		// Handle header 1, unordered lists, citations, and paragraphs
		if len(lines[i]) >= 1 {
			if lines[i][0] == '#' {
				jsonLine["objecttype"] = "header1"
				jsonLine["content"] = lines[i][1:]
			} else if lines[i][0] == '*' {
				jsonLine["objecttype"] = "ul"
				jsonLine["content"] = lines[i][1:]
			} else if lines[i][0] == '>' {
				jsonLine["objecttype"] = "citation"
				jsonLine["content"] = lines[i][1:]
			} else if len(strings.TrimSpace(lines[i])) > 0 {
				jsonLine["objecttype"] = "paragraph"
				jsonLine["content"] = lines[i]
			}
			if len(jsonLine) > 0 {
				results = append(results, jsonLine)
			}
		}
	}

	return results
}

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
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		url, ok := data["url"].(string)
		if !ok {
			http.Error(w, "URL not provided or invalid", http.StatusBadRequest)
			return
		}
		fmt.Println("URL: ", url)
		resp := getBody(url)
		parsed := parseBodyJson(url, resp)
		
		// Convert parsed results to JSON
		jsonResponse, err := json.Marshal(parsed)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Write(jsonResponse)
	default:
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", getRoot)
    mux.HandleFunc("/geturl", getUrlAPI)

    // Create a CORS middleware
    c := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:8888"}, // Add your frontend origin
        AllowedMethods: []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type"},
    })

    // Wrap the server with CORS middleware
    handler := c.Handler(mux)

    fmt.Println("Server starting on port 3333...")
    if err := http.ListenAndServe(":3333", handler); err != nil {
        log.Fatal(err)
    }
}