package anki

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"
)

const testMP3 = "testdata/test.mp3"

func TestNewAnkiFailsIfNotExist(t *testing.T) {
	path := "/path/not/exist"
	_, err := NewAnki(path)
	if err == nil {
		t.Errorf("NewAnki should fail when %q doesn't exist", path)
	}
}

func TestNewAnkiFailsIfNotDir(t *testing.T) {
	f, err := ioutil.TempFile("", "")
	if err != nil {
		t.Error(err)
	}
	defer f.Close()

	path := f.Name()
	_, err = NewAnki(path)
	if err == nil {
		t.Errorf("NewAnki should fail when %q is not a directory", path)
	}
}

func TestAnkiDonwload(t *testing.T) {
	ts := newTestMP3Server(t)
	defer ts.Close()

	ankiMedia, err := ioutil.TempDir("", "")
	log.Println(ankiMedia)
	if err != nil {
		t.Error(err)
	}
	anki, err := NewAnki(ankiMedia)
	if err != nil {
		t.Error(err)
	}

	basename, err := anki.Download(ts.URL)
	if err != nil {
		t.Error(err)
	}

	orig, err := ioutil.ReadFile(testMP3)
	if err != nil {
		t.Error(err)
	}

	filename := filepath.Join(ankiMedia, basename)
	copy, err := ioutil.ReadFile(filename)
	if err != nil {
		t.Error(err)
	}

	origHash := calcHash(orig)
	copyHash := calcHash(copy)
	if origHash != copyHash {
		t.Errorf("The hashes of the original file(%q) and downloaded file(%q) don't match", origHash, copyHash)
	}
}

func TestAnkiTTS(t *testing.T) {
	ankiMedia, err := ioutil.TempDir("", "")
	log.Println(ankiMedia)
	if err != nil {
		t.Error(err)
	}
	anki, err := NewAnki(ankiMedia)
	if err != nil {
		t.Error(err)
	}

	basename, err := anki.TTS("test")
	if err != nil {
		t.Error(err)
	}

	filename := filepath.Join(ankiMedia, basename)
	saved, err := ioutil.ReadFile(filename)
	if err != nil {
		t.Error(err)
	}
	hash := calcHash(saved)

	// Text: "test", Voice: "en-US-Wavenet-D"
	const testHash = "6f7bb3da0ee15908bd73a8c11fdc57d80a071437"
	if hash != testHash {
		t.Errorf("The saved audio hash(%q) doesn't match the precalculated audio hash(%q)", hash, testHash)
	}
}

func newTestMP3Server(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "audio/mpeg")
		mp3, err := ioutil.ReadFile(testMP3)
		if err != nil {
			t.Error(err)
		}
		if _, err := w.Write(mp3); err != nil {
			t.Error(err)
		}
	}))
}
