package server

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestYouTubeThumbnail(t *testing.T) {
	ts := httptest.NewServer(newYouTubeThumbnailHandler())
	defer ts.Close()

	const videoID = "wzUDhyMXrSM" // NOTE: YouTube video for testing.
	url := fmt.Sprintf("%s/?v=%s", ts.URL, videoID)
	resp, err := http.Get(url)
	if err != nil {
		t.Error(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("got %d; want %d", resp.StatusCode, http.StatusOK)
	}
}
