package main

import (
	"testing"

	"github.com/fern-api/fern-go/internal/cmd/cmdtest"
)

const (
	commandName       = "fern-go-sdk"
	configFilename    = "config.json"
	testdataPath      = "../../internal/testdata/sdk"
	fixturesDirectory = "fixtures"
	outputDirectory   = "temp"
)

func TestFixtures(t *testing.T) {
	t.Skip("Client fixtures are in-development")
	cmdtest.TestFixtures(t, commandName, testdataPath, usage, run)
}
