package hew

import (
	"fmt"
	"io/ioutil"
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
		cmdPath, err = exec.LookPath("hew")
		if err != nil {
			return nil, fmt.Errorf("Failed to locate hew command: %w", err)
		}
	} else {
		cmdPath = hewCmdPath
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
func (hew *Hew) Run(ytURL string) ([]byte, error) {
	var cmd *exec.Cmd
	cmd = exec.Command(hew.cmdPath, "--yt", ytURL)

	stderr, err := cmd.StderrPipe()
	defer stderr.Close()
	if err != nil {
		return nil, fmt.Errorf("Failed to pipe hew's stderr: %w", err)
	}

	err = cmd.Start()
	if err != nil {
		return nil, fmt.Errorf("Failed to start hew: %w", err)
	}

	// Hew will download the target video, which may take long, or may fail.
	// Wait for a short period of time so that this give an instant feedback
	// when it failed.
	time.Sleep(2 * time.Second)

	stderrContents, _ := ioutil.ReadAll(stderr)
	return stderrContents, nil
}
