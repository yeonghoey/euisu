package hew

import (
	"fmt"
	"os"
	"os/exec"
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

	// Just let the handler hang until Hew finishes.
	return cmd.CombinedOutput()
}
