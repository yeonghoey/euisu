package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/yeonghoey/euisu/backend/hew"
)

func newHewHandler(hew *hew.Hew) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/yt", newHewYTHandler(hew))
	mux.Handle("/src", newHewSrcHandler(hew))
	return mux
}

func newHewYTHandler(hew *hew.Hew) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("Content-Type") != "application/json" {
			http.Error(w, "", http.StatusUnsupportedMediaType)
			return
		}

		ytURL, bookmarks, err := parseHewYTRequestBody(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		output, err := hew.Run(ytURL, bookmarks)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to run hew: %v", err), http.StatusInternalServerError)
			return
		}
		w.Write(output)
	})
}

func parseHewYTRequestBody(body io.Reader) (ytURL, bookmarks string, err error) {
	dec := json.NewDecoder(body)

	var data map[string]interface{}
	err = dec.Decode(&data)
	if err != nil {
		return
	}

	var ok bool
	ytURL, ok = data["ytURL"].(string)
	if !ok {
		err = fmt.Errorf("\"ytURL\" is required")
		return
	}
	bookmarksRaw, ok := data["bookmarks"].([]interface{})
	if ok {
		bookmarksStr := make([]string, len(bookmarksRaw))
		for i, sec := range bookmarksRaw {
			// Use Only decimals
			bookmarksStr[i] = fmt.Sprintf("%.f", sec)
		}
		bookmarks = strings.Join(bookmarksStr, ",")
	}
	return
}

func newHewSrcHandler(hew *hew.Hew) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("Content-Type") != "application/json" {
			http.Error(w, "", http.StatusUnsupportedMediaType)
			return
		}

		filename, srcURL, err := parseHewSrcRequestBody(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		output, err := hew.RunSrc(filename, srcURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to run hew: %v", err), http.StatusInternalServerError)
			return
		}
		w.Write(output)
	})
}

func parseHewSrcRequestBody(body io.Reader) (filename, srcURL string, err error) {
	dec := json.NewDecoder(body)

	var data map[string]interface{}
	err = dec.Decode(&data)
	if err != nil {
		return
	}

	var ok bool
	filename, ok = data["filename"].(string)
	if !ok {
		err = fmt.Errorf("\"filename\" is required")
		return
	}
	srcURL, ok = data["srcURL"].(string)
	if !ok {
		err = fmt.Errorf("\"srcURL\" is required")
		return
	}

	return
}
