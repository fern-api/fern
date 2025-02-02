package main

import (
	"testing"

	"github.com/fern-api/fern-go/internal/cmd/cmdtest"
)

const (
	commandName       = "fern-go-fiber"
	configFilename    = "config.json"
	testdataPath      = "../../internal/testdata/fiber"
	fixturesDirectory = "fixtures"
)

func TestFixtures(t *testing.T) {
  t.Skip("These tests require running in a Docker container with /bin/go-v2 installed")
	cmdtest.TestFixtures(t, commandName, testdataPath, usage, run)
}
