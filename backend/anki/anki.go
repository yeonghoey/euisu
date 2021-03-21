package anki

import (
	"context"
	"crypto/sha1"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"

	texttospeech "cloud.google.com/go/texttospeech/apiv1"
	texttospeechpb "google.golang.org/genproto/googleapis/cloud/texttospeech/v1"
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

// Download get the content of target URL and save it as <ankiMedia>/<sha1hash>.<ext>.
// This returns only the basename of the file, <sha1hash>.<ext>.
func (anki *Anki) Download(target string) (string, error) {
	content, ext, err := getContent(target)
	if err != nil {
		return "", err
	}
	return anki.saveAndListen(content, ext)
}

func getContent(target string) (content []byte, ext string, err error) {
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
	content, err = ioutil.ReadAll(resp.Body)
	return
}

// TTS generates an audio file from test using Google Cloud Text-to-Speech API.
func (anki *Anki) TTS(text string) (string, error) {
	ctx := context.Background()

	client, err := texttospeech.NewClient(ctx)
	if err != nil {
		return "", err
	}

	req := texttospeechpb.SynthesizeSpeechRequest{
		Input: &texttospeechpb.SynthesisInput{
			InputSource: &texttospeechpb.SynthesisInput_Text{Text: text},
		},
		Voice: &texttospeechpb.VoiceSelectionParams{
			LanguageCode: "en-US",
			Name:         "en-US-Wavenet-D",
		},
		AudioConfig: &texttospeechpb.AudioConfig{
			AudioEncoding: texttospeechpb.AudioEncoding_MP3,
		},
	}
	resp, err := client.SynthesizeSpeech(ctx, &req)
	if err != nil {
		return "", err
	}
	return anki.saveAndListen(resp.AudioContent, ".mp3")
}

func (anki *Anki) saveAndListen(content []byte, ext string) (string, error) {
	hash := calcHash(content)
	basename := fmt.Sprintf("%s%s", hash, ext)
	filename := filepath.Join(anki.ankiMedia, basename)
	if err := saveAs(filename, content); err != nil {
		return "", err
	}
	listen(filename)
	return basename, nil
}

func calcHash(content []byte) string {
	return fmt.Sprintf("%x", sha1.Sum(content))
}

func saveAs(filename string, content []byte) error {
	return ioutil.WriteFile(filename, content, 0644)
}

func listen(filename string) {
	var cmd *exec.Cmd
	os := runtime.GOOS
	switch os {
	case "darwin":
		cmd = exec.Command("afplay", filename)
	case "windows":
		cmd = exec.Command("ffplay", "-autoexit", "-nodisp", "-loglevel", "error", filename)
	default:
		log.Fatalf("Unsupported OS: %s", os)
	}
	cmd.Start()
}
