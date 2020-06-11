package anki

import (
	"crypto/sha1"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// Anki is for handling Anki related features.
type Anki struct {
	ankiMedia string
}

// NewAnki validates parameters and creates a new Anki.
func NewAnki(ankiMedia string) (*Anki, error) {
	fi, err := os.Stat(ankiMedia)
	if os.IsNotExist(err) {
		return nil, fmt.Errorf("%v doesn't exist: %w", ankiMedia, err)
	}
	if !fi.IsDir() {
		return nil, fmt.Errorf("%v is not a directory", ankiMedia)
	}
	anki := &Anki{
		ankiMedia: ankiMedia,
	}
	return anki, nil
}

// Save saves the body of target URL as <ankiMedia>/<sha1hash>.<ext>.
// This returns only the basename of the file, <sha1hash>.<ext>.
func (anki *Anki) Save(target string) (string, error) {
	body, ext, err := getBody(target)
	if err != nil {
		return "", err
	}
	hash := calcHash(body)
	basename := fmt.Sprintf("%s%s", hash, ext)
	filename := filepath.Join(anki.ankiMedia, basename)
	if err := saveBodyAs(filename, body); err != nil {
		return "", err
	}
	listen(filename)
	return basename, nil
}

func getBody(target string) (body []byte, ext string, err error) {
	resp, err := http.Get(target)
	if err != nil {
		err = fmt.Errorf("GET %v failed: %w", target, err)
		return
	}
	defer resp.Body.Close()

	contentType := resp.Header.Get("Content-Type")
	switch contentType {
	case "audio/mpeg", "audio/mp3":
		ext = ".mp3"
	default:
		err = fmt.Errorf("Unsupported Content-Type %q", contentType)
	}
	body, err = ioutil.ReadAll(resp.Body)
	return
}

func calcHash(body []byte) string {
	return fmt.Sprintf("%x", sha1.Sum(body))
}

func saveBodyAs(filename string, body []byte) error {
	return ioutil.WriteFile(filename, body, 0644)
}

func listen(filename string) {
	var cmd *exec.Cmd
	os := runtime.GOOS
	switch os {
	case "darwin":
		cmd = exec.Command("afplay", filename)
	default:
		log.Fatalf("Unsupported OS: %s", os)
	}
	cmd.Run()
}
