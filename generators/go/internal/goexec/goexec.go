package goexec

import (
	"bytes"
	"fmt"
	"os/exec"
)

// RunTidy runs the 'go mod tidy' command from the given path.
// For local generation with new major versions (e.g., v2, v3), go mod tidy may fail
// because the versioned module path doesn't exist in the remote repository yet.
// This is expected and we log a warning but don't return an error - the module will work once pushed.
func RunTidy(path string) error {
	cmd := exec.Command("go", "mod", "tidy")
	stderr := bytes.NewBuffer(nil)
	cmd.Stderr = stderr
	cmd.Dir = path
	if err := cmd.Run(); err != nil {
		// Log the error for debugging but don't fail the generation
		// This is commonly caused by versioned module paths (e.g., /v3) not existing remotely yet
		fmt.Printf("Warning: go mod tidy failed (this is expected for new major versions during local generation): %s\n", stderr.String())
		return nil
	}
	return nil
}
