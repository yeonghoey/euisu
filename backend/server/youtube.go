package server

import (
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/yeonghoey/euisu/backend/image"
)

func newYouTubeHandler() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/thumbnail", newYouTubeThumbnailHandler())
	return mux
}

func newYouTubeThumbnailHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		videoID := r.URL.Query().Get("v")
		target := fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", videoID)
		resp, err := http.Get(target)
		if err != nil {
			err = fmt.Errorf("GET %v failed: %w", target, err)
			return
		}
		defer resp.Body.Close()

		jpgBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		pngBytes, err := image.EnsurePNG(jpgBytes)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "image/png")
		if _, err := w.Write(pngBytes); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	})
}
