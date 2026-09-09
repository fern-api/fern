package internal

import (
	"encoding/json"
	"math/big"
	"reflect"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type testExplicitFieldsStruct struct {
	Name           *string  `json:"name,omitempty"`
	Code           *string  `json:"code,omitempty"`
	Count          *int     `json:"count,omitempty"`
	Enabled        *bool    `json:"enabled,omitempty"`
	Tags           []string `json:"tags,omitempty"`
	unexported     string   `json:"-"` //nolint:unused
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
		s.SetName(nil)                   // explicit nil
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
		Field1         *string  `json:"field1,omitempty" url:"field1,omitempty"`
		Field2         *string  `json:"field2,omitempty,string" url:"field2"`
		Field3         *string  `json:"-"`
		Field4         *string  `json:"field4"`
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

// Test types for nested struct explicit fields testing
type testNestedStruct struct {
	NestedName     *string  `json:"nested_name,omitempty"`
	NestedCode     *string  `json:"nested_code,omitempty"`
	explicitFields *big.Int `json:"-"`
}

type testParentStruct struct {
	ParentName     *string           `json:"parent_name,omitempty"`
	Nested         *testNestedStruct `json:"nested,omitempty"`
	explicitFields *big.Int          `json:"-"`
}

var (
	nestedFieldName = big.NewInt(1 << 0)
	nestedFieldCode = big.NewInt(1 << 1)
)

var (
	parentFieldName   = big.NewInt(1 << 0)
	parentFieldNested = big.NewInt(1 << 1)
)

func (n *testNestedStruct) require(field *big.Int) {
	if n.explicitFields == nil {
		n.explicitFields = big.NewInt(0)
	}
	n.explicitFields.Or(n.explicitFields, field)
}

func (n *testNestedStruct) SetNestedName(name *string) {
	n.NestedName = name
	n.require(nestedFieldName)
}

func (n *testNestedStruct) SetNestedCode(code *string) {
	n.NestedCode = code
	n.require(nestedFieldCode)
}

func (n *testNestedStruct) MarshalJSON() ([]byte, error) {
	type embed testNestedStruct
	var marshaler = struct {
		embed
	}{
		embed: embed(*n),
	}
	return json.Marshal(HandleExplicitFields(marshaler, n.explicitFields))
}

func (p *testParentStruct) require(field *big.Int) {
	if p.explicitFields == nil {
		p.explicitFields = big.NewInt(0)
	}
	p.explicitFields.Or(p.explicitFields, field)
}

func (p *testParentStruct) SetParentName(name *string) {
	p.ParentName = name
	p.require(parentFieldName)
}

func (p *testParentStruct) SetNested(nested *testNestedStruct) {
	p.Nested = nested
	p.require(parentFieldNested)
}

func (p *testParentStruct) MarshalJSON() ([]byte, error) {
	type embed testParentStruct
	var marshaler = struct {
		embed
	}{
		embed: embed(*p),
	}
	return json.Marshal(HandleExplicitFields(marshaler, p.explicitFields))
}

func TestHandleExplicitFieldsNestedStruct(t *testing.T) {
	tests := []struct {
		desc      string
		setupFunc func() *testParentStruct
		wantBytes []byte
	}{
		{
			desc: "nested struct with explicit nil in nested object",
			setupFunc: func() *testParentStruct {
				nested := &testNestedStruct{
					NestedName: stringPtr("implicit-nested"),
				}
				nested.SetNestedCode(nil) // explicit nil

				return &testParentStruct{
					ParentName: stringPtr("implicit-parent"),
					Nested:     nested,
				}
			},
			wantBytes: []byte(`{"parent_name":"implicit-parent","nested":{"nested_name":"implicit-nested","nested_code":null}}`),
		},
		{
			desc: "parent with explicit nil nested struct",
			setupFunc: func() *testParentStruct {
				parent := &testParentStruct{
					ParentName: stringPtr("implicit-parent"),
				}
				parent.SetNested(nil) // explicit nil nested struct
				return parent
			},
			wantBytes: []byte(`{"parent_name":"implicit-parent","nested":null}`),
		},
		{
			desc: "all explicit fields in nested structure",
			setupFunc: func() *testParentStruct {
				nested := &testNestedStruct{}
				nested.SetNestedName(stringPtr("explicit-nested"))
				nested.SetNestedCode(nil) // explicit nil

				parent := &testParentStruct{}
				parent.SetParentName(nil) // explicit nil
				parent.SetNested(nested)  // explicit nested struct

				return parent
			},
			wantBytes: []byte(`{"parent_name":null,"nested":{"nested_name":"explicit-nested","nested_code":null}}`),
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			parent := tt.setupFunc()
			bytes, err := parent.MarshalJSON()
			require.NoError(t, err)
			assert.JSONEq(t, string(tt.wantBytes), string(bytes))

			// Verify it's valid JSON
			var value interface{}
			require.NoError(t, json.Unmarshal(bytes, &value))
		})
	}
}

// Test for setter method documentation and behavior
func TestSetterMethodsDocumentation(t *testing.T) {
	t.Run("setter prevents omitempty for nil values", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}

		// Use setter to explicitly set nil - this should prevent omitempty
		s.SetName(nil)
		s.SetCode(nil)

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Both fields should be included as null, not omitted
		assert.JSONEq(t, `{"name":null,"code":null}`, string(bytes))
	})

	t.Run("setter prevents omitempty for empty slice", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}

		// Use setter to explicitly set empty slice
		s.SetTags([]string{})

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Empty slice should be included as [], not omitted
		assert.JSONEq(t, `{"tags":[]}`, string(bytes))
	})

	t.Run("setter prevents omitempty for zero values", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}

		// Use setter to explicitly set zero values
		s.SetCount(intPtr(0))
		s.SetEnabled(boolPtr(false))

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Zero values should be included, not omitted
		assert.JSONEq(t, `{"count":0,"enabled":false}`, string(bytes))
	})

	t.Run("direct assignment is omitted when nil", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name: nil, // Direct assignment, not using setter
			Code: nil, // Direct assignment, not using setter
		}

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Fields not set via setter should be omitted when nil
		assert.JSONEq(t, `{}`, string(bytes))
	})

	t.Run("mix of setter and direct assignment", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name:  stringPtr("direct"), // Direct assignment
			Count: intPtr(42),          // Direct assignment
		}
		s.SetCode(nil)               // Setter with nil
		s.SetEnabled(boolPtr(false)) // Setter with zero value

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Direct assignments included if non-nil, setter fields always included
		assert.JSONEq(t, `{"name":"direct","code":null,"count":42,"enabled":false}`, string(bytes))
	})
}

// Test for complex scenarios with multiple setters
func TestComplexSetterScenarios(t *testing.T) {
	t.Run("multiple setter calls on same field", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}

		// Call setter multiple times - last one should win
		s.SetName(stringPtr("first"))
		s.SetName(stringPtr("second"))
		s.SetName(nil) // Final value is nil

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Should serialize the last set value (nil)
		assert.JSONEq(t, `{"name":null}`, string(bytes))
	})

	t.Run("setter after direct assignment", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name: stringPtr("direct"),
		}

		// Override with setter
		s.SetName(nil)

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// Setter should mark field as explicit, so nil is serialized
		assert.JSONEq(t, `{"name":null}`, string(bytes))
	})

	t.Run("all fields set via setters", func(t *testing.T) {
		s := &testExplicitFieldsStruct{}
		s.SetName(nil)
		s.SetCode(stringPtr(""))     // Empty string
		s.SetCount(intPtr(0))        // Zero
		s.SetEnabled(boolPtr(false)) // False
		s.SetTags(nil)               // Nil slice

		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		// All fields should be present even with nil/zero values
		assert.JSONEq(t, `{"name":null,"code":"","count":0,"enabled":false,"tags":null}`, string(bytes))
	})
}

// Test for backwards compatibility
func TestBackwardsCompatibility(t *testing.T) {
	t.Run("struct without setters behaves normally", func(t *testing.T) {
		s := &testStructWithoutExplicitFields{
			Name: stringPtr("test"),
			Code: nil, // This should be omitted
		}

		bytes, err := json.Marshal(s)
		require.NoError(t, err)

		// Without setters, omitempty works normally
		assert.JSONEq(t, `{"name":"test"}`, string(bytes))
	})

	t.Run("struct with explicit fields works with standard json.Marshal", func(t *testing.T) {
		s := &testExplicitFieldsStruct{
			Name: stringPtr("test"),
		}
		s.SetCode(nil)

		// Using the custom MarshalJSON
		bytes, err := s.MarshalJSON()
		require.NoError(t, err)

		assert.JSONEq(t, `{"name":"test","code":null}`, string(bytes))
	})
}

// testDatedStruct mirrors a generated type with date fields, whose MarshalJSON
// wraps the embedded struct with shadow fields that override date serialization.
type testDatedStruct struct {
	StartDate *time.Time `json:"start_date,omitempty"`
	EndDate   *time.Time `json:"end_date,omitempty"`
	Count     *int       `json:"count,omitempty"`
	Offset    *int       `json:"offset,omitempty"`

	explicitFields *big.Int
}

var (
	datedFieldStartDate = big.NewInt(1 << 0)
	datedFieldEndDate   = big.NewInt(1 << 1)
	datedFieldCount     = big.NewInt(1 << 2)
	datedFieldOffset    = big.NewInt(1 << 3)
)

func (d *testDatedStruct) require(field *big.Int) {
	if d.explicitFields == nil {
		d.explicitFields = big.NewInt(0)
	}
	d.explicitFields.Or(d.explicitFields, field)
}

func (d *testDatedStruct) SetStartDate(startDate *time.Time) {
	d.StartDate = startDate
	d.require(datedFieldStartDate)
}

func (d *testDatedStruct) SetEndDate(endDate *time.Time) {
	d.EndDate = endDate
	d.require(datedFieldEndDate)
}

func (d *testDatedStruct) SetCount(count *int) {
	d.Count = count
	d.require(datedFieldCount)
}

func (d *testDatedStruct) SetOffset(offset *int) {
	d.Offset = offset
	d.require(datedFieldOffset)
}

func (d *testDatedStruct) MarshalJSON() ([]byte, error) {
	type embed testDatedStruct
	var marshaler = struct {
		embed
		StartDate *string `json:"start_date,omitempty"`
		EndDate   *string `json:"end_date,omitempty"`
	}{
		embed:     embed(*d),
		StartDate: formatDate(d.StartDate),
		EndDate:   formatDate(d.EndDate),
	}
	return json.Marshal(HandleExplicitFields(marshaler, d.explicitFields))
}

func formatDate(t *time.Time) *string {
	if t == nil {
		return nil
	}
	return stringPtr(t.Format("2006-01-02"))
}

func TestHandleExplicitFieldsShadowedWrapper(t *testing.T) {
	date := time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		desc      string
		setupFunc func() *testDatedStruct
		wantBytes []byte
	}{
		{
			desc: "no explicit fields uses shadow serialization",
			setupFunc: func() *testDatedStruct {
				return &testDatedStruct{
					StartDate: &date,
					Count:     intPtr(7),
				}
			},
			wantBytes: []byte(`{"start_date":"2024-01-15","count":7}`),
		},
		{
			desc: "explicit non-shadowed field is preserved",
			setupFunc: func() *testDatedStruct {
				s := &testDatedStruct{}
				s.SetCount(intPtr(7))
				return s
			},
			wantBytes: []byte(`{"count":7}`),
		},
		{
			desc: "explicit non-shadowed field with bit beyond wrapper field count",
			setupFunc: func() *testDatedStruct {
				s := &testDatedStruct{Count: intPtr(7)}
				s.SetOffset(nil)
				return s
			},
			wantBytes: []byte(`{"count":7,"offset":null}`),
		},
		{
			desc: "explicit nil shadowed field emits null",
			setupFunc: func() *testDatedStruct {
				s := &testDatedStruct{Count: intPtr(7)}
				s.SetStartDate(nil)
				return s
			},
			wantBytes: []byte(`{"start_date":null,"count":7}`),
		},
		{
			desc: "explicit non-nil shadowed field uses shadow serialization",
			setupFunc: func() *testDatedStruct {
				s := &testDatedStruct{}
				s.SetEndDate(&date)
				return s
			},
			wantBytes: []byte(`{"end_date":"2024-01-15"}`),
		},
		{
			desc: "mixed explicit shadowed and non-shadowed fields",
			setupFunc: func() *testDatedStruct {
				s := &testDatedStruct{StartDate: &date}
				s.SetEndDate(nil)
				s.SetCount(nil)
				s.SetOffset(intPtr(0))
				return s
			},
			wantBytes: []byte(`{"start_date":"2024-01-15","end_date":null,"count":null,"offset":0}`),
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			bytes, err := json.Marshal(tt.setupFunc())
			require.NoError(t, err)
			assert.JSONEq(t, string(tt.wantBytes), string(bytes))
		})
	}
}

// testInterleavedStruct has unexported fields declared before exported ones.
// The bit constants are numbered over exported fields only, matching how the
// generator numbers them.
type testInterleavedStruct struct {
	internalNote   string  `json:"-"` //nolint:unused
	Name           *string `json:"name,omitempty"`
	explicitFields *big.Int
	Code           *string `json:"code,omitempty"`
	other          int     //nolint:unused
	Count          *int    `json:"count,omitempty"`
}

var (
	interleavedFieldName  = big.NewInt(1 << 0)
	interleavedFieldCode  = big.NewInt(1 << 1)
	interleavedFieldCount = big.NewInt(1 << 2)
)

func (s *testInterleavedStruct) require(field *big.Int) {
	if s.explicitFields == nil {
		s.explicitFields = big.NewInt(0)
	}
	s.explicitFields.Or(s.explicitFields, field)
}

func (s *testInterleavedStruct) SetName(name *string) {
	s.Name = name
	s.require(interleavedFieldName)
}

func (s *testInterleavedStruct) SetCode(code *string) {
	s.Code = code
	s.require(interleavedFieldCode)
}

func (s *testInterleavedStruct) SetCount(count *int) {
	s.Count = count
	s.require(interleavedFieldCount)
}

func (s *testInterleavedStruct) MarshalJSON() ([]byte, error) {
	type embed testInterleavedStruct
	var marshaler = struct {
		embed
	}{
		embed: embed(*s),
	}
	return json.Marshal(HandleExplicitFields(marshaler, s.explicitFields))
}

func TestHandleExplicitFieldsUnexportedFieldsBeforeExported(t *testing.T) {
	tests := []struct {
		desc      string
		setupFunc func() *testInterleavedStruct
		wantBytes []byte
	}{
		{
			desc: "explicit nil first exported field",
			setupFunc: func() *testInterleavedStruct {
				s := &testInterleavedStruct{}
				s.SetName(nil)
				return s
			},
			wantBytes: []byte(`{"name":null}`),
		},
		{
			desc: "explicit nil field after unexported field",
			setupFunc: func() *testInterleavedStruct {
				s := &testInterleavedStruct{}
				s.SetCode(nil)
				return s
			},
			wantBytes: []byte(`{"code":null}`),
		},
		{
			desc: "explicit nil last field after two unexported fields",
			setupFunc: func() *testInterleavedStruct {
				s := &testInterleavedStruct{Name: stringPtr("n")}
				s.SetCount(nil)
				return s
			},
			wantBytes: []byte(`{"name":"n","count":null}`),
		},
		{
			desc: "implicit nil fields stay omitted",
			setupFunc: func() *testInterleavedStruct {
				s := &testInterleavedStruct{}
				s.SetName(stringPtr("n"))
				return s
			},
			wantBytes: []byte(`{"name":"n"}`),
		},
	}

	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			bytes, err := json.Marshal(tt.setupFunc())
			require.NoError(t, err)
			assert.JSONEq(t, string(tt.wantBytes), string(bytes))
		})
	}
}

func TestHandleExplicitFieldsIgnoredWrapperFieldDoesNotShadow(t *testing.T) {
	type testIgnoredFieldStruct struct {
		Name           *string `json:"name,omitempty"`
		Secret         *string `json:"-"`
		explicitFields *big.Int
	}

	s := &testIgnoredFieldStruct{
		Name:           stringPtr("n"),
		Secret:         stringPtr("embedded-secret"),
		explicitFields: big.NewInt(1 << 1),
	}

	type embed testIgnoredFieldStruct
	var marshaler = struct {
		embed
		Hidden *string `json:"-"`
	}{
		embed:  embed(*s),
		Hidden: stringPtr("wrapper-hidden"),
	}

	bytes, err := json.Marshal(HandleExplicitFields(marshaler, s.explicitFields))
	require.NoError(t, err)
	// Neither json:"-" field is serialized, and the wrapper's field must not be
	// mistaken for a shadow of the embedded one.
	assert.JSONEq(t, `{"name":"n"}`, string(bytes))

	result := reflect.ValueOf(HandleExplicitFields(marshaler, s.explicitFields))
	secret, ok := result.Type().FieldByName("Secret")
	require.True(t, ok)
	assert.Equal(t, "-", secret.Tag.Get("json"))
	assert.Equal(t, "embedded-secret", *result.FieldByName("Secret").Interface().(*string))
	hidden, ok := result.Type().FieldByName("Hidden")
	require.True(t, ok)
	assert.Equal(t, "-", hidden.Tag.Get("json"))
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
