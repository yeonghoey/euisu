package server

import (
	"io"
	"net/http"
)

func newEchoHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, "Euisu is working")
	})
}
