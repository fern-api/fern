package goexec

import (
	"os/exec"
)

// RunTidy runs the 'go mod tidy' command from the given path.
func RunTidy(path string) error {
	cmd := exec.Command("go", "mod", "tidy")
	cmd.Dir = path
	return cmd.Run()
}
