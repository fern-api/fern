package goexec

import (
	"bytes"
	"errors"
	"os/exec"
)

// RunTidy runs the 'go mod tidy' command from the given path.
func RunTidy(path string) error {
	cmd := exec.Command("go", "mod", "tidy")
	stderr := bytes.NewBuffer(nil)
	cmd.Stderr = stderr
	cmd.Dir = path
	if err := cmd.Run(); err != nil {
		return errors.New(stderr.String())
	}
	return nil
}
