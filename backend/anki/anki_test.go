package anki

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
)

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

func TestAnkiSave(t *testing.T) {
	const testMP3 = "testdata/test.mp3"

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "audio/mpeg")
		mp3, err := ioutil.ReadFile(testMP3)
		if err != nil {
			t.Error(err)
		}
		if _, err := w.Write(mp3); err != nil {
			t.Error(err)
		}
	}))
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

	path, err := anki.Save(ts.URL)
	if err != nil {
		t.Error(err)
	}

	orig, err := ioutil.ReadFile(testMP3)
	if err != nil {
		t.Error(err)
	}
	copy, err := ioutil.ReadFile(path)
	if err != nil {
		t.Error(err)
	}

	origHash := calcHash(orig)
	copyHash := calcHash(copy)
	if origHash != copyHash {
		t.Errorf("The hashes of the original file(%q) and downloaded file(%q) don't match", origHash, copyHash)
	}
}
