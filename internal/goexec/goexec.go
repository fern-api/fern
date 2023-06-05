package goexec

import (
	"bytes"
	"fmt"
	"os/exec"
)

// RunTidy runs the 'go mod tidy' command from the given path.
func RunTidy(path string) error {
	cmd := exec.Command("go", "mod", "tidy")
	stdout := bytes.NewBuffer(nil)
	stderr := bytes.NewBuffer(nil)
	cmd.Dir = path
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	fmt.Println("About to run tidy")
	defer func() {
		fmt.Println("stdout", stdout.String())
		fmt.Println("stderr", stderr.String())
	}()
	return cmd.Run()
}
