package cmdtest

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/fern-api/fern-go/internal/cmd"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	configFilename    = "config.json"
	fixturesDirectory = "fixtures"
	outputDirectory   = "temp"
)

// TestFixtures runs the given generator function, and asserts that
// the generated code is equivalent to its fixtures.
func TestFixtures(
	t *testing.T,
	commandName string,
	testdataPath string,
	usage string,
	run cmd.GeneratorFunc,
) {
	wd, err := os.Getwd()
	require.NoError(t, err)

	entries, err := os.ReadDir(testdataPath)
	require.NoError(t, err)

	var directories []string
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		directories = append(directories, filepath.Join(testdataPath, entry.Name()))
	}

	for _, directory := range directories {
		require.NoError(t, os.Chdir(directory))
		require.NoError(t, runCommand(commandName, configFilename, usage, run))

		// Clean up all the generated files after we're done.
		defer os.RemoveAll(filepath.Join(wd, directory, outputDirectory))

		var fixtures []string
		require.NoError(
			t,
			filepath.WalkDir(
				fixturesDirectory,
				func(path string, d fs.DirEntry, err error) error {
					if err != nil {
						require.NoError(t, err)
					}
					if !d.IsDir() {
						fixtures = append(fixtures, path)
					}
					return nil
				},
			),
		)

		for _, fixtureFilename := range fixtures {
			generatedBytes, err := os.ReadFile(strings.Replace(fixtureFilename, fixturesDirectory, outputDirectory, 1))
			require.NoError(t, err)

			fixtureBytes, err := os.ReadFile(fixtureFilename)
			require.NoError(t, err)

			assert.Equal(t, fixtureBytes, generatedBytes)
		}
		require.NoError(t, os.Chdir(wd))
	}
}

// runCommand acts just like cmd.Run, but sets the os.Args to the expected parameters.
func runCommand(commandName string, configFilename string, usage string, fn cmd.GeneratorFunc) error {
	os.Args = []string{commandName, configFilename}
	cmd.Run(usage, fn)
	return nil
}
