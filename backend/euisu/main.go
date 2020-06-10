package main

import (
	"flag"
	"log"

	"github.com/yeonghoey/euisu/backend/anki"
	"github.com/yeonghoey/euisu/backend/server"
)

func main() {
	flag.Parse()
	anki, err := anki.NewAnki(ankiMedia)
	if err != nil {
		log.Fatalf("Failed to initialize Anki with %q", ankiMedia)
	}
	s := &server.Server{
		Addr: servAddr,
		Anki: anki,
	}
	s.Run()
}
