package main

import (
	"encoding/json"
	"testing"

	"github.com/fern-api/fern-go/internal/cmd/cmdtest"
	packages "github.com/fern-api/fern-go/internal/testdata/sdk/packages/fixtures"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	commandName       = "fern-go-sdk"
	configFilename    = "config.json"
	testdataPath      = "../../internal/testdata/sdk"
	fixturesDirectory = "fixtures"
)

func TestFixtures(t *testing.T) {
	cmdtest.TestFixtures(t, commandName, testdataPath, usage, run)
}

func TestStringifyJSON(t *testing.T) {
	valueWithUnrecognized := new(packages.Foo)
	require.NoError(t, json.Unmarshal([]byte(`{"id":"42","name":"fern","extra":"unrecognized"}`), valueWithUnrecognized))
	assert.Equal(
		t,
		`{
  "id": "42",
  "name": "fern",
  "extra": "unrecognized"
}`,
		valueWithUnrecognized.String(),
	)

	valueWithoutUnrecognized := new(packages.Foo)
	require.NoError(t, json.Unmarshal([]byte(`{"id":"42","name":"fern"}`), valueWithoutUnrecognized))
	assert.Equal(
		t,
		`{
  "id": "42",
  "name": "fern"
}`,
		valueWithoutUnrecognized.String(),
	)
}
