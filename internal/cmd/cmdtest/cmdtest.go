package cmdtest

import (
	"os"
	"testing"

	"github.com/fern-api/fern-go/internal/cmd"
)

// Run acts just like cmd.Run, but sets the os.Args to the expected parameters.
func Run(
	t *testing.T,
	name string,
	configFilename string,
	usage string,
	fn cmd.GeneratorFunc,
) error {
	os.Args = []string{name, configFilename}
	cmd.Run(usage, fn)
	return nil
}
