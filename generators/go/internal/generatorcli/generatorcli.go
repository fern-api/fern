package generatorcli

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"

	"github.com/fern-api/fern-go/internal/coordinator"
	generatorexec "github.com/fern-api/generator-exec-go"
)

// module represents the name of the NPM package.
const npmPackage = "@fern-api/generator-cli"

// Client represents the generator-cli command, installing it as needed.
type Client struct {
	coordinator *coordinator.Client
}

// ClientOption adapts the behavior of the Client.
type ClientOption func(*clientOptions)

// WithSkipInstall skips the automatic installation, which is useful when the host
// already has the generator-cli command installed.
func WithSkipInstall() ClientOption {
	return func(opts *clientOptions) {
		opts.skipInstall = true
	}
}

// New returns a new *GeneratorCLI.
func New(coordinator *coordinator.Client, opts ...ClientOption) (*Client, error) {
	options := new(clientOptions)
	for _, opt := range opts {
		opt(options)
	}
	cli := &Client{
		coordinator: coordinator,
	}
	if options.skipInstall {
		return cli, nil
	}
	if err := cli.install(); err != nil {
		return nil, err
	}
	return cli, nil
}

// GenerateReadmeOption adapts the behavior of the GenerateReadme method.
type GenerateReadmeOption func(*generateReadmeOptions)

// WithOriginalReadme sets the original README.md filepath, which is used to
// preserve the original content in the generated README.md
func WithOriginalReadme(originalReadmeFilepath string) GenerateReadmeOption {
	return func(opts *generateReadmeOptions) {
		opts.originalReadmeFilepath = originalReadmeFilepath
	}
}

func (c *Client) GenerateReadme(opts ...GenerateReadmeOption) error {
	// TODO: Implement me!
	return nil
}

// install installs the generator-cli command.
func (c *Client) install() error {
	c.coordinator.Log(
		generatorexec.LogLevelDebug,
		"Installing generator-cli...",
	)

	stderr := bytes.NewBuffer(nil)
	install := exec.Command("npm", "install", "-g", npmPackage)
	install.Stderr = stderr
	if err := install.Run(); err != nil {
		return errors.New(stderr.String())
	}

	stdout := bytes.NewBuffer(nil)
	cli := exec.Command("generator-cli", "--version")
	cli.Stdout = stdout
	cli.Stderr = stderr
	if err := cli.Run(); err != nil {
		return errors.New(stderr.String())
	}

	c.coordinator.Log(
		generatorexec.LogLevelDebug,
		fmt.Sprintf("Successfully installed generator-cli version %q", stdout.String()),
	)
	return nil
}

type clientOptions struct {
	skipInstall bool
}

type generateReadmeOptions struct {
	originalReadmeFilepath string
}
