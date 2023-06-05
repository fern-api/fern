package main

import (
	"encoding/json"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	builtin "github.com/fern-api/fern-go/internal/testdata/builtin/fixtures"
	custom "github.com/fern-api/fern-go/internal/testdata/custom/fixtures"
	undiscriminated "github.com/fern-api/fern-go/internal/testdata/undiscriminated/fixtures"
	union "github.com/fern-api/fern-go/internal/testdata/union/fixtures"
	"github.com/gofrs/uuid"
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

// TestRoundTrip verifies that a variety of the generated types
// can be round-tripped, i.e. serializing -> deserializing ->
// serializing produces the same bytes.
func TestRoundTrip(t *testing.T) {
	tests := []struct {
		desc        string
		value       any
		constructor func() any
	}{
		{
			desc: "built-in types",
			value: &builtin.Type{
				One:       42,
				Two:       3.14,
				Three:     "fern",
				Four:      true,
				Five:      42,
				Six:       time.Now(),
				Seven:     time.Now(),
				Eight:     newUUID(t),
				Nine:      []byte("abc"),
				Ten:       []int{3, 1, 4},
				Eleven:    []float64{1.618, 3.14, 6.02},
				Twelve:    map[string]bool{"key": false},
				Thirteen:  int64Ptr(42),
				Fourteen:  map[string]any{"custom": "object"},
				Fifteen:   [][]int{{3, 1, 4}},
				Sixteen:   []map[string]int{{"key": 5}},
				Seventeen: []*uuid.UUID{uuidPtr(newUUID(t))},
			},
			constructor: func() any {
				return new(builtin.Type)
			},
		},
		{
			desc: "simple object",
			value: &custom.Foo{
				Id:   newUUID(t),
				Name: "fern",
			},
			constructor: func() any {
				return new(custom.Foo)
			},
		},
		{
			desc: "simple union",
			value: &union.Union{
				Type: "foo",
				Foo: &union.Foo{
					Name: "fern",
				},
			},
			constructor: func() any {
				return new(union.Union)
			},
		},
	}
	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			expectedBytes, err := json.Marshal(test.value)
			require.NoError(t, err)

			value := test.constructor()
			require.NoError(t, json.Unmarshal(expectedBytes, &value))

			actualBytes, err := json.Marshal(value)
			require.NoError(t, err)

			assert.Equal(t, expectedBytes, actualBytes)
		})
	}
}

// TestLiteral verifies that any type with a literal has
// the constant value serialized, regardless, of what's
// found on the wire.
func TestLiteral(t *testing.T) {
	t.Run("object", func(t *testing.T) {
		value := new(builtin.Type)
		require.NoError(t, json.Unmarshal([]byte(`{"eighteen": "something"}`), &value))
		assert.Equal(t, "fern", value.Eighteen())

		bytes, err := json.Marshal(value)
		require.NoError(t, err)

		object := make(map[string]any)
		require.NoError(t, json.Unmarshal(bytes, &object))

		assert.Equal(t, "fern", object["eighteen"])
	})

	t.Run("union", func(t *testing.T) {
		value := new(union.UnionWithLiteral)
		require.NoError(t, json.Unmarshal([]byte(`{"type": "fern", "value": "fern"}`), &value))
		assert.Equal(t, "extended", value.Extended())
		assert.Equal(t, "base", value.Base())
		assert.Equal(t, "fern", value.Fern())

		bytes, err := json.Marshal(value)
		require.NoError(t, err)

		object := make(map[string]any)
		require.NoError(t, json.Unmarshal(bytes, &object))

		actualBytes, err := json.Marshal(object)
		require.NoError(t, err)

		assert.Equal(t, []byte(`{"base":"base","extended":"extended","type":"fern","value":"fern"}`), actualBytes)
	})
}

func TestUndiscriminatedUnion(t *testing.T) {
	type body struct {
		Body *undiscriminated.Union `json:"body"`
	}

	request := new(body)
	require.NoError(t, json.Unmarshal([]byte(`{"body": "something"}`), request))

	assert.Equal(t, "something", request.Body.String)
	assert.Empty(t, request.Body.StringLiteral())

	unionLiteral := new(undiscriminated.Union)
	require.NoError(t, json.Unmarshal([]byte(`"fern"`), unionLiteral))

	// Test that the string takes precedence over the literal because
	// they aren't specified in the correct order.
	assert.Empty(t, unionLiteral.StringLiteral())
	assert.Equal(t, "fern", unionLiteral.String)

	unionWithLiteral := new(undiscriminated.UnionWithLiteral)
	require.NoError(t, json.Unmarshal([]byte(`"fern"`), unionWithLiteral))

	// Test that the literal is used as long as it's actually observed
	// on the wire.
	assert.Equal(t, "fern", unionWithLiteral.StringLiteral())
	assert.Empty(t, unionWithLiteral.String)
}

func newUUID(t *testing.T) uuid.UUID {
	u, err := uuid.NewV4()
	require.NoError(t, err)
	return u
}

func uuidPtr(v uuid.UUID) *uuid.UUID {
	return &v
}

func int64Ptr(v int64) *int64 {
	return &v
}
