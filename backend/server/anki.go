package server

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var ankiHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if r.Header.Get("Content-Type") != "application/json" {
		w.WriteHeader(http.StatusUnsupportedMediaType)
		return
	}

	var body map[string]interface{}
	dec := json.NewDecoder(r.Body)
	err := dec.Decode(&body)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Println(body)

	// 2. Make an HTTP request to the target.
	// 3. Calculate SHA1 hash for the content
	// 4. Format the hash as a string, to use it as filename
	// 5. Save the content of the request as ANKI_MEDIA/<hash>.<ext>
	// 6. Play the file on the local system
	// 7. Return the filename as JSON response
})
