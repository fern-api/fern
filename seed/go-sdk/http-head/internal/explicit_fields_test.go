package internal

import (
	"encoding/json"
	"math/big"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type testExplicitFieldsStruct struct {
	Name           *string  `json:"name,omitempty"`
	Code           *string  `json:"code,omitempty"`
	Count          *int     `json:"count,omitempty"`
	Enabled        *bool    `json:"enabled,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	unexported     string   `json:"-"`
	explicitFields *big.Int `json:"-"`
}

var (
	testFieldName    = big.NewInt(1 << 0)
	testFieldCode    = big.NewInt(1 << 1)
	testFieldCount   = big.NewInt(1 << 2)
	testFieldEnabled = big.NewInt(1 << 3)
	testFieldTags    = big.NewInt(1 << 4)
)

func (t *testExplicitFieldsStruct) require(field *big.Int) {
	if t.explicitFields == nil {
		t.explicitFields = big.NewInt(0)
	}
	t.explicitFields.Or(t.explicitFields, field)
}

func (t *testExplicitFieldsStruct) SetName(name *string) {
	t.Name = name
	t.require(testFieldName)
}

func (t *testExplicitFieldsStruct) SetCode(code *string) {
	t.Code = code
	t.require(testFieldCode)
}

func (t *testExplicitFieldsStruct) SetCount(count *int) {
	t.Count = count
	t.require(testFieldCount)
}

func (t *testExplicitFieldsStruct) SetEnabled(enabled *bool) {
	t.Enabled = enabled
	t.require(testFieldEnabled)
}

func (t *testExplicitFieldsStruct) SetTags(tags []string) {
	t.Tags = tags
	t.require(testFieldTags)
}

func (t *testExplicitFieldsStruct) MarshalJSON() ([]byte, error) {
	type embed testExplicitFieldsStruct
	var marshaler = struct {
		embed
	}{
		embed: embed(*t),
	}
	return json.Marshal(HandleExplicitFields(marshaler, t.explicitFields))
}

type testStructWithoutExplicitFields struct {
	Name *string `json:"name,omitempty"`
	Code *string `json:"code,omitempty"`
}

func TestHandleExplicitFields(t *testing.T) {
	tests := []struct {
		desc      string
		giveInput interface{}
		wantBytes []byte
		wantError string
	}{
		{
			desc:      "nil input",
			giveInput: nil,
			wantBytes: []byte(`null`),
		},
		{
			desc:      "non-struct input",
			giveInput: "string",
			wantBytes: []byte(`"string"`),
		},
		{
			desc:      "slice input",
			giveInput: []string{"a", "b"},
			wantBytes: []byte(`["a","b"]`),
		},
		{
			desc:      "map input",
			giveInput: map[string]interface{}{"key": "value"},
			wantBytes: []byte(`{"key":"value"}`),
		},
		{
			desc: "struct without explicitFields field",
			giveInput: &testStructWithoutExplicitFields{
				Name: stringPtr("test"),
				Code: nil,
			},
			wantBytes: []byte(`{"name":"test"}`),
		},
		{
			desc: "struct with no explicit fields set",
			giveInput: &testExplicitFieldsStruct{
				Name: stringPtr("test"),
				Code: nil,
			},
			wantBytes: []byte(`{"name":"test"}`),
		},
		{
			desc: "struct with explicit nil field",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{
					Name: stringPtr("test"),
				}
				s.SetCode(nil)
				return s
			}(),
			wantBytes: []byte(`{"name":"test","code":null}`),
		},
		{
			desc: "struct with explicit non-nil field",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{}
				s.SetName(stringPtr("explicit"))
				s.SetCode(stringPtr("also-explicit"))
				return s
			}(),
			wantBytes: []byte(`{"name":"explicit","code":"also-explicit"}`),
		},
		{
			desc: "struct with mixed explicit and implicit fields",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{
					Name:  stringPtr("implicit"),
					Count: intPtr(42),
				}
				s.SetCode(nil) // explicit nil
				return s
			}(),
			wantBytes: []byte(`{"name":"implicit","code":null,"count":42}`),
		},
		{
			desc: "struct with multiple explicit nil fields",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{
					Name: stringPtr("test"),
				}
				s.SetCode(nil)
				s.SetCount(nil)
				return s
			}(),
			wantBytes: []byte(`{"name":"test","code":null,"count":null}`),
		},
		{
			desc: "struct with slice field",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{
					Tags: []string{"tag1", "tag2"},
				}
				s.SetTags(nil) // explicit nil slice
				return s
			}(),
			wantBytes: []byte(`{"tags":null}`),
		},
		{
			desc: "struct with boolean field",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{}
				s.SetEnabled(boolPtr(false)) // explicit false
				return s
			}(),
			wantBytes: []byte(`{"enabled":false}`),
		},
		{
			desc: "struct with all fields explicit",
			giveInput: func() *testExplicitFieldsStruct {
				s := &testExplicitFieldsStruct{}
				s.SetName(stringPtr("test"))
				s.SetCode(nil)
				s.SetCount(intPtr(0))
				s.SetEnabled(boolPtr(false))
				s.SetTags([]string{})
				return s
			}(),
			wantBytes: []byte(`{"name":"test","code":null,"count":0,"enabled":false,"tags":[]}`),
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			var explicitFields *big.Int
			if s, ok := tt.giveInput.(*testExplicitFieldsStruct); ok {
				explicitFields = s.explicitFields
			}
			bytes, err := json.Marshal(HandleExplicitFields(tt.giveInput, explicitFields))
			if tt.wantError != "" {
				require.EqualError(t, err, tt.wantError)
				assert.Nil(t, tt.wantBytes)
				return
			}
			require.NoError(t, err)
			assert.JSONEq(t, string(tt.wantBytes), string(bytes))

			// Verify it's valid JSON
			var value interface{}
			require.NoError(t, json.Unmarshal(bytes, &value))
		})
	}
}

func TestHandleExplicitFieldsCustomMarshaler(t *testing.T) {
	t.Run("custom marshaler with explicit fields", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}
		s.SetName(nil)
		s.SetCode(stringPtr("test-code"))

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)
		assert.JSONEq(t, `{"name":null,"code":"test-code"}`, string(bytes))
	})

	t.Run("custom marshaler with no explicit fields", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name: stringPtr("implicit"),
			Code: stringPtr("also-implicit"),
		}

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)
		assert.JSONEq(t, `{"name":"implicit","code":"also-implicit"}`, string(bytes))
	})
}

func TestHandleExplicitFieldsPointerHandling(t *testing.T) {
	t.Run("nil pointer", func(t *testing.T) {
		var s *testExplicitFieldsStruct
		bytes, err := json.Marshal(HandleExplicitFields(s, nil))
		require.NoError(t, err)
		assert.Equal(t, []byte(`null`), bytes)
	})

	t.Run("pointer to struct", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}
		s.SetName(nil)

		bytes, err := json.Marshal(HandleExplicitFields(s, s.explicitFields))
		require.NoError(t, err)
		assert.JSONEq(t, `{"name":null}`, string(bytes))
	})
}

func TestHandleExplicitFieldsEmbeddedStruct(t *testing.T) {
	t.Run("embedded struct with explicit fields", func(t *testing.T) {
		// Create a struct similar to what MarshalJSON creates
		s := &testExplicitFieldsStruct{}
		s.SetName(nil)
		s.SetCode(stringPtr("test-code"))

		type embed testExplicitFieldsStruct
		var marshaler = struct {
			embed
		}{
			embed: embed(*s),
		}

		bytes, err := json.Marshal(HandleExplicitFields(marshaler, s.explicitFields))
		require.NoError(t, err)
		// Should include both explicit fields (name as null, code as "test-code")
		assert.JSONEq(t, `{"name":null,"code":"test-code"}`, string(bytes))
	})

	t.Run("embedded struct with no explicit fields", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name: stringPtr("implicit"),
			Code: stringPtr("also-implicit"),
		}

		type embed testExplicitFieldsStruct
		var marshaler = struct {
			embed
		}{
			embed: embed(*s),
		}

		bytes, err := json.Marshal(HandleExplicitFields(marshaler, s.explicitFields))
		require.NoError(t, err)
		// Should only include non-nil fields (omitempty behavior)
		assert.JSONEq(t, `{"name":"implicit","code":"also-implicit"}`, string(bytes))
	})

	t.Run("embedded struct with mixed fields", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Count: intPtr(42), // implicit field
		}
		s.SetName(nil)        // explicit nil
		s.SetCode(stringPtr("explicit")) // explicit value

		type embed testExplicitFieldsStruct
		var marshaler = struct {
			embed
		}{
			embed: embed(*s),
		}

		bytes, err := json.Marshal(HandleExplicitFields(marshaler, s.explicitFields))
		require.NoError(t, err)
		// Should include explicit null, explicit value, and implicit value
		assert.JSONEq(t, `{"name":null,"code":"explicit","count":42}`, string(bytes))
	})
}

func TestHandleExplicitFieldsTagHandling(t *testing.T) {
	type testStructWithComplexTags struct {
		Field1         *string `json:"field1,omitempty" url:"field1,omitempty"`
		Field2         *string `json:"field2,omitempty,string" url:"field2"`
		Field3         *string `json:"-"`
		Field4         *string `json:"field4"`
		explicitFields *big.Int `json:"-"`
	}

	s := &testStructWithComplexTags{
		Field1:         stringPtr("test1"),
		Field4:         stringPtr("test4"),
		explicitFields: big.NewInt(1), // Only first field is explicit
	}

	bytes, err := json.Marshal(HandleExplicitFields(s, s.explicitFields))
	require.NoError(t, err)

	// Field1 should have omitempty removed, Field2 should keep omitempty, Field4 should be included
	assert.JSONEq(t, `{"field1":"test1","field4":"test4"}`, string(bytes))
}

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func intPtr(i int) *int {
	return &i
}

func boolPtr(b bool) *bool {
	return &b
}
