package main

import (
	"flag"
	"fmt"
)

func main() {
	flag.Parse()
	fmt.Printf("ServAddr: %q\n", servAddr)
	fmt.Printf("AnkiMedia: %q\n", ankiMedia)
}
