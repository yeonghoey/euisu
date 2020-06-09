package anki

import (
	"crypto/sha1"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
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

// Save saves the body of target URL as "<ankiMedia>/<sha1hash>.<ext>""
func (anki *Anki) Save(target string) (string, error) {
	body, ext, err := getBody(target)
	if err != nil {
		return "", err
	}

	hash := calcHash(body)
	filename := fmt.Sprintf("%s.%s", hash, ext)
	filepath := filepath.Join(anki.ankiMedia, filename)
	if err := saveBodyAs(body, filepath); err != nil {
		return "", err
	}
	return filepath, nil
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

func saveBodyAs(body []byte, path string) error {
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("Failed to create %q: %w", path, err)
	}
	defer f.Close()
	n, err := f.Write(body)
	if err != nil {
		return fmt.Errorf("Failed to write the body as %q, written %d: %w", path, n, err)
	}
	err = f.Sync()
	if err != nil {
		return fmt.Errorf("Sync of %q failed: %w", path, err)
	}
	return nil
}
