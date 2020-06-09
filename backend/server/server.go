package server

import (
	"log"
	"net/http"
)

// Run runs a HTTP Server using DefaultServeMux.
func Run() {
	registerHandlers()
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func registerHandlers() {
	http.Handle("/anki/", ankiHandler)
}
