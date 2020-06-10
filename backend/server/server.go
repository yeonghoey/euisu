package server

import (
	"log"
	"net/http"

	"github.com/yeonghoey/euisu/backend/anki"
)

// A Server defines parameters for running the backend server.
type Server struct {
	anki *anki.Anki
}

// Run runs a HTTP Server using DefaultServeMux.
func (s *Server) Run() {
	s.registerHandlers()
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func (s *Server) registerHandlers() {
	http.Handle("/anki/", newAnkiHandler(s.anki))
}
