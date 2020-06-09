package server

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAnki(t *testing.T) {
	ts := httptest.NewServer(ankiHandler)
	defer ts.Close()

	t.Run("/anki doesn't accept GET", func(t *testing.T) {
		resp, err := http.Get(ts.URL)
		if err != nil {
			t.Error(err)
		}
		if resp.StatusCode != http.StatusMethodNotAllowed {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusMethodNotAllowed)
		}
	})

	t.Run("/anki only accepts application/json", func(t *testing.T) {
		resp, err := http.Post(ts.URL, "text/plain", nil)
		if err != nil {
			t.Error(err)
		}
		if resp.StatusCode != http.StatusUnsupportedMediaType {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusUnsupportedMediaType)
		}
	})

	t.Run("/anki expects a valid JSON Body", func(t *testing.T) {
		body := strings.NewReader("{This is an invalid JSON body")
		resp, err := http.Post(ts.URL, "application/json", body)
		if err != nil {
			t.Error(err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusBadRequest)
		}
	})

	t.Run("/anki", func(t *testing.T) {
		body := strings.NewReader(`{"test": "hi"}`)
		resp, err := http.Post(ts.URL, "application/json", body)
		if err != nil {
			t.Error(err)
		}
		if resp.StatusCode != http.StatusBadRequest {
			t.Errorf("got %d; want %d", resp.StatusCode, http.StatusBadRequest)
		}
	})
}
