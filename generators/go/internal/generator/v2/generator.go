package v2

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/fern-api/fern-go/internal/coordinator"
	generatorexec "github.com/fern-api/generator-exec-go"
)

// v2BinPath is the path to the go-v2 binary included in the SDK
// generator docker image.
const v2BinPath = "/bin/go-v2"

// Generator represents a shim used to go-v2 SDK generator.
type Generator struct {
	coordinator *coordinator.Client
}

// New returns a new *Generator.
func New(coordinator *coordinator.Client) *Generator {
	return &Generator{
		coordinator: coordinator,
	}
}

// Run runs the go-v2 SDK generator.
func (g *Generator) Run() error {
	if len(os.Args) < 2 {
		return errors.New("internal error; failed to resolve configuration file path")
	}

	if _, err := os.Stat(v2BinPath); os.IsNotExist(err) {
		return fmt.Errorf("go-v2 binary not found at %s", v2BinPath)
	}

	configFilepath := os.Args[1]
	if _, err := os.Stat(configFilepath); os.IsNotExist(err) {
		return fmt.Errorf("configuration file not found at %s", configFilepath)
	}

	g.coordinator.Log(
		generatorexec.LogLevelDebug,
		"Running go-v2 SDK generator...",
	)

	stdout := bytes.NewBuffer(nil)
	stderr := bytes.NewBuffer(nil)
	cmd := exec.Command("node", "--enable-source-maps", v2BinPath, configFilepath)

	// write to process stdout as well to capture all logs
	cmd.Stdout = io.MultiWriter(stdout, os.Stdout)
	cmd.Stderr = io.MultiWriter(stderr, os.Stderr)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to run go-v2 generator: %s", stderr.String())
	}

	return g.coordinator.Log(
		generatorexec.LogLevelDebug,
		"Successfully ran go-v2 generator",
	)
}
