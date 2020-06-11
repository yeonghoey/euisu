package server

import (
	"encoding/json"
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

		var body map[string]interface{}
		dec := json.NewDecoder(r.Body)
		err := dec.Decode(&body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		target, ok := body["target"].(string)
		if !ok {
			http.Error(w, "\"target\" is required", http.StatusBadRequest)
			return
		}
		basename, err := anki.Download(target)
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
