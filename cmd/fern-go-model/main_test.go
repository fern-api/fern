package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	configFilename    = "config.json"
	testdataPath      = "../../internal/testdata"
	fixturesDirectory = "fixtures"
	outputDirectory   = "temp"
)

// TestRun generates code for the Fern definition(s) found in the
// given directory, and asserts that its equivalent to its fixtures.
func TestRun(t *testing.T) {
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
		require.NoError(t, run(configFilename))

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
