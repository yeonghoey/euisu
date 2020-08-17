package server

import (
	"fmt"
	"net/http"

	"github.com/yeonghoey/euisu/backend/hew"
)

func newHewHandler(hew *hew.Hew) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ytURL := r.URL.Query().Get("yturl")
		if ytURL == "" {
			http.Error(w, "yturl not specified", http.StatusBadRequest)
			return
		}

		output, err := hew.Run(ytURL)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to run hew: %v", err), http.StatusInternalServerError)
			return
		}
		w.Write(output)
		fmt.Println(ytURL)
	})
}
