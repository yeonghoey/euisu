package image

import (
	"io/ioutil"
	"net/http"
	"testing"
)

const testJPG = "testdata/test.jpg"

func TestEnsurePNG(t *testing.T) {
	jpg, err := ioutil.ReadFile(testJPG)
	if err != nil {
		t.Error(err)
	}

	png, err := EnsurePNG(jpg)
	if err != nil {
		t.Error(err)
	}

	contentType := http.DetectContentType(png)
	if contentType != "image/png" {
		t.Errorf("want %s; got %s", "image/png", contentType)
	}
}
