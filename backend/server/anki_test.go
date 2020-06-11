package server

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/yeonghoey/euisu/backend/anki"
)

const testMP3 = "testdata/test.mp3"
const hashMP3 = "a1f0f279a3ca5e4a0748fc7c138983800f3ef67d.mp3"

func TestAnki(t *testing.T) {
	targetServer := newTestMP3Server(t)
	defer targetServer.Close()
	ankiServer := httptest.NewServer(newStubAnkiHandler(t))
	defer ankiServer.Close()

	reqBody, err := json.Marshal(map[string]interface{}{
		"type":   "download",
		"target": targetServer.URL,
	})
	if err != nil {
		t.Error(err)
	}
	resp, err := http.Post(ankiServer.URL, "application/json", bytes.NewReader(reqBody))
	if err != nil {
		t.Error(err)
	}
	defer resp.Body.Close()
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		t.Error(err)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(respBody, &data); err != nil {
		t.Error(err)
	}
	basename := data["basename"]
	if basename != hashMP3 {
		t.Errorf("want %s; got %s", hashMP3, basename)
	}
}

func TestAnkiErrors(t *testing.T) {
	ts := httptest.NewServer(newStubAnkiHandler(t))
	defer ts.Close()

	t.Run("anki doesn't accept GET", func(t *testing.T) {
		resp, err := http.Get(ts.URL)
		if err != nil {
			t.Error(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusMethodNotAllowed {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusMethodNotAllowed)
		}
	})

	t.Run("anki only accepts application/json", func(t *testing.T) {
		resp, err := http.Post(ts.URL, "text/plain", nil)
		if err != nil {
			t.Error(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusUnsupportedMediaType {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusUnsupportedMediaType)
		}
	})

	t.Run("anki expects a valid JSON Body", func(t *testing.T) {
		body := strings.NewReader("{This is an invalid JSON body")
		resp, err := http.Post(ts.URL, "application/json", body)
		if err != nil {
			t.Error(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusBadRequest)
		}
	})

	t.Run("anki expects a valid JSON Body with \"target\" field", func(t *testing.T) {
		body := strings.NewReader(`{"no-target": "x"}`)
		resp, err := http.Post(ts.URL, "application/json", body)
		if err != nil {
			t.Error(err)
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusBadRequest)
		}
	})
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

func newStubAnkiHandler(t *testing.T) http.Handler {
	ankiMedia, err := ioutil.TempDir("", "")
	if err != nil {
		t.Error(err)
	}
	anki, err := anki.NewAnki(ankiMedia)
	if err != nil {
		t.Error(err)
	}
	return newAnkiHandler(anki)
}
