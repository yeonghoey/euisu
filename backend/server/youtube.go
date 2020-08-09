package server

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func newYouTubeHandler() http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/thumbnail", newYouTubeThumbnailHandler())
	return mux
}

func newYouTubeThumbnailHandler() http.Handler {
	director := func(req *http.Request) {
		videoID := req.URL.Query().Get("v")
		thumbnailURL := fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", videoID)
		target, err := url.Parse(thumbnailURL)
		if err != nil {
			return
		}
		req.Host = target.Host
		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		req.URL.Path = target.Path
		req.URL.RawQuery = ""
	}
	return &httputil.ReverseProxy{Director: director}
}
