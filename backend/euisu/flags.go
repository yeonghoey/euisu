package main

import (
	"flag"
	"os"
)

var servAddr string
var ankiMedia string

func init() {
	flag.StringVar(
		&servAddr,
		"servaddr",
		":8732",
		`Addr for http.Server`,
	)

	flag.StringVar(
		&ankiMedia,
		"ankimedia",
		os.Getenv("ANKI_MEDIA"),
		`Path to Anki Media folder`,
	)
}
