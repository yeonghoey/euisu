package image

import (
	"bytes"
	"fmt"
	"image/jpeg"
	"image/png"
	"net/http"
)

// EnsurePNG makes sure the image data to be encoded in PNG.
func EnsurePNG(imgBytes []byte) ([]byte, error) {
	contentType := http.DetectContentType(imgBytes)

	switch contentType {
	case "image/png":
	case "image/jpeg":
		img, err := jpeg.Decode(bytes.NewReader(imgBytes))
		if err != nil {
			return nil, fmt.Errorf("unable to decode jpeg: %w", err)
		}

		buf := new(bytes.Buffer)
		if err := png.Encode(buf, img); err != nil {
			return nil, fmt.Errorf("unable to encode png: %w", err)
		}

		return buf.Bytes(), nil
	}

	return nil, fmt.Errorf("unable to convert %#v to png", contentType)
}
