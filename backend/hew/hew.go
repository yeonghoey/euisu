package hew

import (
	"fmt"
	"os"
	"os/exec"
	"time"
)

// Hew is for executuing hew directly from chrome_extension.
type Hew struct {
	cmdPath string
}

// NewHew validates parameters and creates a new Hew.
func NewHew(hewCmdPath string) (*Hew, error) {
	var cmdPath string
	var err error

	if hewCmdPath != "" {
		cmdPath = hewCmdPath
	} else {
		cmdPath, err = exec.LookPath("hew")
		if err != nil {
			return nil, fmt.Errorf("Failed to locate hew command: %w", err)
		}
	}

	// Double check wheter targetPath exists
	_, err = os.Stat(cmdPath)
	if os.IsNotExist(err) {
		return nil, fmt.Errorf("%v doesn't exist: %w", hewCmdPath, err)
	}

	hew := &Hew{
		cmdPath: cmdPath,
	}
	return hew, nil
}

// Run runs hew with specified ytURL
func (hew *Hew) Run(ytURL, bookmarks string) ([]byte, error) {
	var cmd *exec.Cmd
	if bookmarks == "" {
		cmd = exec.Command(hew.cmdPath, "--yt", ytURL)
	} else {
		cmd = exec.Command(hew.cmdPath, "--yt", ytURL, "--bookmarks", bookmarks)
	}

	stderr, err := cmd.StderrPipe()
	defer stderr.Close()
	if err != nil {
		return nil, fmt.Errorf("Failed to pipe hew's stderr: %w", err)
	}

	err = cmd.Start()
	if err != nil {
		return nil, fmt.Errorf("Failed to start hew: %w", err)
	}

	stderrContents := make(chan []byte)
	go func() {
		buf := make([]byte, 4096)
		n, _ := stderr.Read(buf)
		if n > 0 {
			stderrContents <- buf[:n]
		}
		close(stderrContents)
	}()

	// Hew will download the target video, which may take long, or may fail.
	// Wait for a few seconds so that this give an instant feedback
	// when it failed. By the way, this is okay because even though
	// the request is being hung, the actual desire work, running Hew,
	// won't be stuck.
	select {
	case x := <-stderrContents:
		return x, nil
	case <-time.After(10 * time.Second):
		return []byte{}, nil
	}
}
