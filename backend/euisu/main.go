package main

import (
	"flag"
	"log"

	"github.com/yeonghoey/euisu/backend/anki"
	"github.com/yeonghoey/euisu/backend/hew"
	"github.com/yeonghoey/euisu/backend/server"
)

func main() {
	flag.Parse()
	anki, err := anki.NewAnki(ankiMedia)
	if err != nil {
		log.Fatalf("Failed to initialize Anki with %q", ankiMedia)
	}

	hew, err := hew.NewHew(hewCmdPath)
	if !noHew && err != nil {
		log.Fatalf("Failed to locate hew command: %v", err)
	}

	s := &server.Server{
		Addr: servAddr,
		Anki: anki,
		Hew:  hew,
	}
	s.Run()
}
