package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/yeonghoey/euisu/backend/anki"
)

func newAnkiHandler(anki *anki.Anki) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "", http.StatusMethodNotAllowed)
			return
		}

		if r.Header.Get("Content-Type") != "application/json" {
			http.Error(w, "", http.StatusUnsupportedMediaType)
			return
		}

		typ, target, err := parseRequestBody(r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var basename string
		switch typ {
		case "download":
			basename, err = anki.Download(target)
		case "tts":
			basename, err = anki.TTS(target)
		default:
			error := fmt.Sprintf("type should be \"download\" or \"tts\"; got %q", typ)
			http.Error(w, error, http.StatusBadRequest)
			return
		}
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		resp, err := json.Marshal(map[string]interface{}{
			"basename": basename,
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if _, err := w.Write(resp); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
}

func parseRequestBody(body io.Reader) (typ, target string, err error) {
	dec := json.NewDecoder(body)

	var data map[string]interface{}
	err = dec.Decode(&data)
	if err != nil {
		return
	}

	var ok bool
	typ, ok = data["type"].(string)
	if !ok {
		err = fmt.Errorf("\"type\" is required")
		return
	}
	target, ok = data["target"].(string)
	if !ok {
		err = fmt.Errorf("\"target\" is required")
		return
	}
	return
}
