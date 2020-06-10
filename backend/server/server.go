package server

import (
	"log"
	"net/http"

	"github.com/yeonghoey/euisu/backend/anki"
)

// A Server defines parameters for running the backend server.
type Server struct {
	Addr string
	Anki *anki.Anki
}

// Run runs a HTTP Server using DefaultServeMux.
func (s *Server) Run() {
	s.registerHandlers()
	log.Fatal(http.ListenAndServe(s.Addr, nil))
}

func (s *Server) registerHandlers() {
	http.Handle("/anki/", newAnkiHandler(s.Anki))
}
