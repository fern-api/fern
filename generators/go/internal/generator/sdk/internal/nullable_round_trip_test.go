package internal

import (
	"encoding/json"
	"math/big"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// nullableRoundTripCategory and nullableRoundTripHolder mirror a generated
// object and enum referenced by optional<nullable<T>> properties.
type nullableRoundTripCategory struct {
	Primary string `json:"primary"`
}

type nullableRoundTripHolder string

// nullableRoundTripModel mirrors the shape of a generated object: every
// nullable or optional field is a pointer (or container) tagged omitempty, and
// the nullableFields map drives decode-time presence tracking.
type nullableRoundTripModel struct {
	AccountID               string                     `json:"account_id"`
	Mask                    *string                    `json:"mask,omitempty"`
	PersonalFinanceCategory *nullableRoundTripCategory `json:"personal_finance_category,omitempty"`
	HolderCategory          *nullableRoundTripHolder   `json:"holder_category,omitempty"`
	Category                []string                   `json:"category,omitempty"`
	Metadata                map[string]string          `json:"metadata,omitempty"`
	Nickname                *string                    `json:"nickname,omitempty"`

	explicitFields  *big.Int
	extraProperties map[string]interface{}
	rawJSON         json.RawMessage
}

var (
	nullableRoundTripFieldAccountID               = big.NewInt(1 << 0)
	nullableRoundTripFieldMask                    = big.NewInt(1 << 1)
	nullableRoundTripFieldPersonalFinanceCategory = big.NewInt(1 << 2)
	nullableRoundTripFieldHolderCategory          = big.NewInt(1 << 3)
	nullableRoundTripFieldCategory                = big.NewInt(1 << 4)
	nullableRoundTripFieldMetadata                = big.NewInt(1 << 5)
	nullableRoundTripFieldNickname                = big.NewInt(1 << 6)
)

// Nickname is a plain optional<string> and is deliberately excluded.
var nullableRoundTripNullableFields = map[string]*big.Int{
	"mask":                      nullableRoundTripFieldMask,
	"personal_finance_category": nullableRoundTripFieldPersonalFinanceCategory,
	"holder_category":           nullableRoundTripFieldHolderCategory,
	"category":                  nullableRoundTripFieldCategory,
	"metadata":                  nullableRoundTripFieldMetadata,
}

func (m *nullableRoundTripModel) require(field *big.Int) {
	next := new(big.Int)
	if m.explicitFields != nil {
		next.Set(m.explicitFields)
	}
	next.Or(next, field)
	m.explicitFields = next
}

func (m *nullableRoundTripModel) SetHolderCategory(holderCategory *nullableRoundTripHolder) {
	m.HolderCategory = holderCategory
	m.require(nullableRoundTripFieldHolderCategory)
}

func (m *nullableRoundTripModel) SetCategory(category []string) {
	m.Category = category
	m.require(nullableRoundTripFieldCategory)
}

func (m *nullableRoundTripModel) UnmarshalJSON(data []byte) error {
	type unmarshaler nullableRoundTripModel
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*m = nullableRoundTripModel(value)
	extraProperties, err := ExtractExtraProperties(data, *m)
	if err != nil {
		return err
	}
	m.extraProperties = extraProperties
	presentFields, err := ExplicitFieldsFromJSON(data, nullableRoundTripNullableFields)
	if err != nil {
		return err
	}
	if presentFields != nil {
		m.require(presentFields)
	}
	m.rawJSON = json.RawMessage(data)
	return nil
}

func (m *nullableRoundTripModel) MarshalJSON() ([]byte, error) {
	type embed nullableRoundTripModel
	var marshaler = struct {
		embed
	}{
		embed: embed(*m),
	}
	return json.Marshal(HandleExplicitFields(marshaler, m.explicitFields))
}

func nullableRoundTrip(t *testing.T, in string) map[string]json.RawMessage {
	t.Helper()
	var value nullableRoundTripModel
	require.NoError(t, json.Unmarshal([]byte(in), &value))
	out, err := json.Marshal(&value)
	require.NoError(t, err)
	var result map[string]json.RawMessage
	require.NoError(t, json.Unmarshal(out, &result))
	return result
}

// TestNullableRoundTripMatrix asserts the absent / null / populated matrix for
// each field kind a generated object can carry.
func TestNullableRoundTripMatrix(t *testing.T) {
	for _, tc := range []struct {
		kind      string
		key       string
		populated string
		nullable  bool
	}{
		{"required nullable", "mask", `"0000"`, true},
		{"optional nullable object", "personal_finance_category", `{"primary":"FOOD"}`, true},
		{"optional nullable enum", "holder_category", `"personal"`, true},
		{"optional nullable list", "category", `["a","b"]`, true},
		{"optional nullable map", "metadata", `{"k":"v"}`, true},
		{"plain optional", "nickname", `"nick"`, false},
	} {
		t.Run(tc.kind, func(t *testing.T) {
			t.Run("absent", func(t *testing.T) {
				result := nullableRoundTrip(t, `{"account_id":"a"}`)
				assert.NotContains(t, result, tc.key)
			})
			t.Run("null", func(t *testing.T) {
				result := nullableRoundTrip(t, `{"account_id":"a","`+tc.key+`":null}`)
				if !tc.nullable {
					assert.NotContains(t, result, tc.key)
					return
				}
				require.Contains(t, result, tc.key)
				assert.Equal(t, "null", string(result[tc.key]))
			})
			t.Run("populated", func(t *testing.T) {
				result := nullableRoundTrip(t, `{"account_id":"a","`+tc.key+`":`+tc.populated+`}`)
				require.Contains(t, result, tc.key)
				assert.JSONEq(t, tc.populated, string(result[tc.key]))
			})
		})
	}

	t.Run("only null keys from the input are emitted", func(t *testing.T) {
		result := nullableRoundTrip(t, `{"account_id":"a","holder_category":null}`)
		assert.Equal(t, "null", string(result["holder_category"]))
		for _, key := range []string{"mask", "personal_finance_category", "category", "metadata", "nickname"} {
			assert.NotContains(t, result, key)
		}
	})

	t.Run("empty containers survive", func(t *testing.T) {
		result := nullableRoundTrip(t, `{"account_id":"a","category":[],"metadata":{}}`)
		assert.Equal(t, "[]", string(result["category"]))
		assert.Equal(t, "{}", string(result["metadata"]))
	})
}

func TestNullableRoundTripMatchesSetters(t *testing.T) {
	var decoded nullableRoundTripModel
	require.NoError(t, json.Unmarshal([]byte(`{"account_id":"a","holder_category":null,"category":null}`), &decoded))
	decodedJSON, err := json.Marshal(&decoded)
	require.NoError(t, err)

	built := nullableRoundTripModel{AccountID: "a"}
	built.SetHolderCategory(nil)
	built.SetCategory(nil)
	builtJSON, err := json.Marshal(&built)
	require.NoError(t, err)

	assert.JSONEq(t, string(builtJSON), string(decodedJSON))
	assert.JSONEq(t, `{"account_id":"a","holder_category":null,"category":null}`, string(decodedJSON))
}

func TestNullableRoundTripKeepsExtraPropertiesAndRawJSON(t *testing.T) {
	input := `{"account_id":"a","holder_category":null,"unknown":1}`
	var value nullableRoundTripModel
	require.NoError(t, json.Unmarshal([]byte(input), &value))
	assert.Equal(t, map[string]interface{}{"unknown": float64(1)}, value.extraProperties)
	assert.Equal(t, input, string(value.rawJSON))
}
