package server

import (
	"log"
	"net/http"

	"github.com/rs/cors"
	"github.com/yeonghoey/euisu/backend/anki"
	"github.com/yeonghoey/euisu/backend/hew"
)

// A Server defines parameters for running the backend server.
type Server struct {
	Addr string
	Anki *anki.Anki
	Hew  *hew.Hew
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
	mux.Handle("/", newEchoHandler())
	mux.Handle("/anki", newAnkiHandler(s.Anki))
	mux.Handle("/youtube/", http.StripPrefix("/youtube", newYouTubeHandler()))
	mux.Handle("/hew/", http.StripPrefix("/hew", newHewHandler(s.Hew)))
	return mux
}
