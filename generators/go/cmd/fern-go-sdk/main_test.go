package main

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/fern-api/fern-go/internal/cmd/cmdtest"
	packages "github.com/fern-api/fern-go/internal/testdata/sdk/packages/fixtures"
	post "github.com/fern-api/fern-go/internal/testdata/sdk/post-with-path-params/fixtures"
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

func TestTime(t *testing.T) {
	date := time.Date(1994, time.March, 16, 0, 0, 0, 0, time.UTC)

	t.Run("required", func(t *testing.T) {
		empty := &post.SetNameRequest{}

		emptyBytes, err := json.Marshal(empty)
		require.NoError(t, err)
		assert.Equal(t, `{"userName":"","date":"0001-01-01","datetime":"0001-01-01T00:00:00Z"}`, string(emptyBytes))

		value := &post.SetNameRequest{
			UserName: "fern",
			Date:     date,
			Datetime: date,
		}

		bytes, err := json.Marshal(value)
		require.NoError(t, err)
		assert.Equal(t, `{"userName":"fern","date":"1994-03-16","datetime":"1994-03-16T00:00:00Z"}`, string(bytes))
	})
}
