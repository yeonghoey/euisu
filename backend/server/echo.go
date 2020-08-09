package server

import (
	"fmt"
	"io"
	"net/http"
	"time"
)

func newEchoHandler() http.Handler {
	startedAt := time.Now()
	message := fmt.Sprintf("Euisu started at %v", startedAt)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		io.WriteString(w, message)
	})
}
