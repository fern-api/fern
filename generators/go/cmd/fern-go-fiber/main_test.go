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
	cmdtest.TestFixtures(t, commandName, testdataPath, usage, run)
}
