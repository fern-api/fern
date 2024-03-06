package main

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/fern-api/fern-go/internal/cmd/cmdtest"
	builtin "github.com/fern-api/fern-go/internal/testdata/model/builtin/fixtures"
	custom "github.com/fern-api/fern-go/internal/testdata/model/custom/fixtures"
	enum "github.com/fern-api/fern-go/internal/testdata/model/enum/fixtures"
	undiscriminated "github.com/fern-api/fern-go/internal/testdata/model/undiscriminated/fixtures"
	union "github.com/fern-api/fern-go/internal/testdata/model/union/fixtures"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	commandName       = "fern-go-model"
	configFilename    = "config.json"
	testdataPath      = "../../internal/testdata/model"
	fixturesDirectory = "fixtures"
)

func TestFixtures(t *testing.T) {
	cmdtest.TestFixtures(t, commandName, testdataPath, usage, run)
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
			desc:  "simple enum",
			value: enum.EnumTwo,
			constructor: func() any {
				var value enum.Enum
				return value
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

// TestEnum verifies that enums are [de]serialized and
// represented appropriately.
func TestEnum(t *testing.T) {
	var one enum.Enum
	require.NoError(t, json.Unmarshal([]byte(`"ONE"`), &one))

	assert.Equal(t, enum.EnumOne, one)
	assert.Equal(t, "ONE", string(one))

	bytes, err := json.Marshal(one)
	require.NoError(t, err)
	assert.Equal(t, []byte(`"ONE"`), bytes)

	two, err := enum.NewEnumFromString("TWO")
	require.NoError(t, err)
	assert.Equal(t, enum.EnumTwo, two)
	assert.Equal(t, two.Ptr(), two.Ptr())

	_, err = enum.NewEnumFromString("FOUR")
	assert.EqualError(t, err, "FOUR is not a valid api.Enum")
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
	assert.Empty(t, request.Body.FernStringLiteral())

	unionLiteral := new(undiscriminated.Union)
	require.NoError(t, json.Unmarshal([]byte(`"fern"`), unionLiteral))

	// Test that the string takes precedence over the literal because
	// they aren't specified in the correct order.
	assert.Empty(t, unionLiteral.FernStringLiteral())
	assert.Equal(t, "fern", unionLiteral.String)

	unionWithLiteral := new(undiscriminated.UnionWithLiteral)
	require.NoError(t, json.Unmarshal([]byte(`"fern"`), unionWithLiteral))

	// Test that the literal is used as long as it's actually observed
	// on the wire.
	assert.Equal(t, "fern", unionWithLiteral.FernStringLiteral())
	assert.Empty(t, unionWithLiteral.String)
}

func TestTime(t *testing.T) {
	date := time.Date(1994, time.March, 16, 0, 0, 0, 0, time.UTC)

	t.Run("union (required)", func(t *testing.T) {
		value := union.NewUnionWithTimeFromDatetime(date)

		bytes, err := json.Marshal(value)
		require.NoError(t, err)
		assert.Equal(t, `{"type":"datetime","value":"1994-03-16T00:00:00Z"}`, string(bytes))

		var decode union.UnionWithTime
		require.NoError(t, json.Unmarshal(bytes, &decode))

		assert.Equal(t, "datetime", decode.Type)
		assert.Equal(t, 1994, decode.Datetime.Year())
		assert.Equal(t, time.March, decode.Datetime.Month())
		assert.Equal(t, 16, decode.Datetime.Day())
	})

	t.Run("union (optional)", func(t *testing.T) {
		empty := union.NewUnionWithOptionalTimeFromDate(nil)

		emptyBytes, err := json.Marshal(empty)
		require.NoError(t, err)
		assert.Equal(t, `{"type":"date"}`, string(emptyBytes))

		value := union.NewUnionWithOptionalTimeFromDate(&date)

		bytes, err := json.Marshal(value)
		require.NoError(t, err)
		assert.Equal(t, `{"type":"date","value":"1994-03-16"}`, string(bytes))

		var decode union.UnionWithOptionalTime
		require.NoError(t, json.Unmarshal(bytes, &decode))

		assert.Equal(t, "date", decode.Type)
		assert.Equal(t, 1994, decode.Date.Year())
		assert.Equal(t, time.March, decode.Date.Month())
		assert.Equal(t, 16, decode.Date.Day())
	})

	t.Run("undiscrimnated union (required)", func(t *testing.T) {
		value := undiscriminated.NewUnionWithTimeFromDate(date)

		bytes, err := json.Marshal(value)
		require.NoError(t, err)
		assert.Equal(t, `"1994-03-16"`, string(bytes))

		var decode undiscriminated.UnionWithTime
		require.NoError(t, json.Unmarshal(bytes, &decode))

		assert.Equal(t, 1994, decode.Date.Year())
		assert.Equal(t, time.March, decode.Date.Month())
		assert.Equal(t, 16, decode.Date.Day())
	})

	t.Run("undiscrimnated union (optional)", func(t *testing.T) {
		value := undiscriminated.NewUnionWithOptionalTimeFromDateOptional(&date)

		bytes, err := json.Marshal(value)
		require.NoError(t, err)
		assert.Equal(t, `"1994-03-16"`, string(bytes))

		var decode undiscriminated.UnionWithOptionalTime
		require.NoError(t, json.Unmarshal(bytes, &decode))

		assert.Equal(t, 1994, decode.DateOptional.Year())
		assert.Equal(t, time.March, decode.DateOptional.Month())
		assert.Equal(t, 16, decode.DateOptional.Day())
	})
}

func newUUID(t *testing.T) uuid.UUID {
	u, err := uuid.NewRandom()
	require.NoError(t, err)
	return u
}

func uuidPtr(v uuid.UUID) *uuid.UUID {
	return &v
}

func int64Ptr(v int64) *int64 {
	return &v
}
