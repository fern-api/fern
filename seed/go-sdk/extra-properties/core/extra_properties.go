package core

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
)

// MarshalJSONWithExtraProperties marshals the given value to JSON, including any extra properties.
func MarshalJSONWithExtraProperties(marshaler interface{}, extraProperties map[string]interface{}) ([]byte, error) {
	if len(extraProperties) == 0 {
		return json.Marshal(marshaler)
	}
	bytes, err := json.Marshal(marshaler)
	if err != nil {
		return nil, err
	}
	values := make(map[string]interface{})
	if err := json.Unmarshal(bytes, &values); err != nil {
		return nil, err
	}
	for key, value := range extraProperties {
		values[key] = value
	}
	return json.Marshal(values)
}

// ExtractExtraProperties extracts any extra properties from the given value.
func ExtractExtraProperties(bytes []byte, value interface{}, exclude ...string) (map[string]interface{}, error) {
	val := reflect.ValueOf(value)
	for val.Kind() == reflect.Ptr {
		if val.IsNil() {
			return nil, fmt.Errorf("value must be non-nil to extract extra properties")
		}
		val = val.Elem()
	}
	if err := json.Unmarshal(bytes, &value); err != nil {
		return nil, err
	}
	var extraProperties map[string]interface{}
	if err := json.Unmarshal(bytes, &extraProperties); err != nil {
		return nil, err
	}
	for i := 0; i < val.Type().NumField(); i++ {
		key := jsonKey(val.Type().Field(i))
		if key == "" || key == "-" {
			continue
		}
		delete(extraProperties, key)
	}
	for _, key := range exclude {
		delete(extraProperties, key)
	}
	return extraProperties, nil
}

// jsonKey returns the JSON key from the struct tag of the given field,
// excluding the omitempty flag (if any).
func jsonKey(field reflect.StructField) string {
	return strings.TrimSuffix(field.Tag.Get("json"), ",omitempty")
}
