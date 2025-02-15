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

func parseBodyJson(body string) []map[string]interface{} {
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
				contentsplit := strings.Split(strings.TrimSpace(lines[i][2:]), "\t")
				if len(contentsplit) > 0 {
					jsonLine["link"] = contentsplit[0]
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

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Authorization")
}

func getRoot(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	fmt.Printf("got / request\n")
	io.WriteString(w, "This is my website!\n")
}

func getUrlAPI(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	
	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	
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
		parsed := parseBodyJson(resp)
		
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
	http.HandleFunc("/", getRoot)
	http.HandleFunc("/geturl", getUrlAPI)

	fmt.Println("Server starting on port 3333...")
	if err := http.ListenAndServe(":3333", nil); err != nil {
		log.Fatal(err)
	}
}