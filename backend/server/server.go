package server

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"github.com/yeonghoey/euisu/backend/anki"
)

// A Server defines parameters for running the backend server.
type Server struct {
	Addr string
	Anki *anki.Anki
}

// Run runs a HTTP Server using DefaultServeMux.
func (s *Server) Run() {
	mux := s.buildMux()
	// Allow all
	handler := cors.Default().Handler(mux)
	log.Fatal(http.ListenAndServe(s.Addr, handler))
}

func (s *Server) buildMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.Handle("/anki", newAnkiHandler(s.Anki))
	return mux
}
