package internal

import (
	"bytes"
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"sync"
	"unicode/utf8"
)

// MarshalJSONWithExtraProperty marshals the given value to JSON, including the extra property.
func MarshalJSONWithExtraProperty(marshaler interface{}, key string, value interface{}) ([]byte, error) {
	return MarshalJSONWithExtraProperties(marshaler, map[string]interface{}{key: value})
}

// MarshalJSONWithExtraProperties marshals the given value to JSON, including any extra properties.
func MarshalJSONWithExtraProperties(marshaler interface{}, extraProperties map[string]interface{}) ([]byte, error) {
	bytes, err := json.Marshal(marshaler)
	if err != nil {
		return nil, err
	}
	if len(extraProperties) == 0 {
		return bytes, nil
	}
	keys, err := getKeys(marshaler)
	if err != nil {
		return nil, err
	}
	for _, key := range keys {
		if _, ok := extraProperties[key]; ok {
			return nil, fmt.Errorf("cannot add extra property %q because it is already defined on the type", key)
		}
	}
	extraBytes, err := json.Marshal(extraProperties)
	if err != nil {
		return nil, err
	}
	if isEmptyJSON(bytes) {
		if isEmptyJSON(extraBytes) {
			return bytes, nil
		}
		return extraBytes, nil
	}
	result := bytes[:len(bytes)-1]
	result = append(result, ',')
	result = append(result, extraBytes[1:len(extraBytes)-1]...)
	result = append(result, '}')
	return result, nil
}

// ExtractExtraProperties extracts any extra properties from the given value.
//
// Generated UnmarshalJSON methods call this with the bytes they have just
// decoded into the struct, so it decodes only what the struct does not
// declare. The object is validated once without allocating, then scanned in
// place: each property name is compared as it stands in the input, a declared
// property's value is skipped without being read, and only the values of extra
// properties are decoded.
func ExtractExtraProperties(bytes []byte, value interface{}, exclude ...string) (map[string]interface{}, error) {
	val := reflect.ValueOf(value)
	for val.Kind() == reflect.Ptr {
		if val.IsNil() {
			return nil, fmt.Errorf("value must be non-nil to extract extra properties")
		}
		val = val.Elem()
	}
	start := skipJSONSpace(bytes, 0)
	if !json.Valid(bytes) || start == len(bytes) || bytes[start] != '{' {
		// Not a valid object: answer as encoding/json does, an error for
		// anything but null.
		var extraProperties map[string]interface{}
		return nil, json.Unmarshal(bytes, &extraProperties)
	}
	declaredKeys := declaredKeysForStructType(val.Type())
	var extraProperties map[string]interface{}
	for i := skipJSONSpace(bytes, start+1); i < len(bytes) && bytes[i] != '}'; {
		nameEnd := skipJSONString(bytes, i)
		quotedName := bytes[i:nameEnd]
		valueStart := skipJSONSpace(bytes, skipJSONSpace(bytes, nameEnd)+1)
		valueEnd := skipJSONValue(bytes, valueStart)
		i = skipJSONSpace(bytes, valueEnd)
		if i < len(bytes) && bytes[i] == ',' {
			i = skipJSONSpace(bytes, i+1)
		}

		var key string
		if name := quotedName[1 : len(quotedName)-1]; isPlainJSONName(name) {
			// Looked up as it stands: string(name) in a map index or a
			// comparison does not allocate.
			if _, ok := declaredKeys[string(name)]; ok || containsName(exclude, name) {
				continue
			}
			key = string(name)
		} else {
			// An escaped or invalid name is read with encoding/json's rules,
			// into its own variable so that key does not escape on every name.
			var decoded string
			if err := json.Unmarshal(quotedName, &decoded); err != nil {
				return nil, err
			}
			if _, ok := declaredKeys[decoded]; ok || containsName(exclude, []byte(decoded)) {
				continue
			}
			key = decoded
		}

		var extraValue interface{}
		if err := json.Unmarshal(bytes[valueStart:valueEnd], &extraValue); err != nil {
			return nil, err
		}
		if extraProperties == nil {
			extraProperties = make(map[string]interface{})
		}
		extraProperties[key] = extraValue
	}
	return extraProperties, nil
}

// declaredKeysByStructType caches declaredKeysForStructType, which is otherwise
// recomputed by reflection for every object decoded.
var declaredKeysByStructType sync.Map

// declaredKeysForStructType returns the JSON keys the given struct type declares
// directly: the json tag of each field without the omitempty flag, skipping
// fields with no tag or a "-" tag.
func declaredKeysForStructType(structType reflect.Type) map[string]struct{} {
	if cached, ok := declaredKeysByStructType.Load(structType); ok {
		return cached.(map[string]struct{})
	}
	declaredKeys := make(map[string]struct{}, structType.NumField())
	for i := 0; i < structType.NumField(); i++ {
		key := jsonKey(structType.Field(i))
		if key == "" || key == "-" {
			continue
		}
		declaredKeys[key] = struct{}{}
	}
	cached, _ := declaredKeysByStructType.LoadOrStore(structType, declaredKeys)
	return cached.(map[string]struct{})
}

// containsName reports whether name is one of keys.
func containsName(keys []string, name []byte) bool {
	for _, key := range keys {
		if key == string(name) {
			return true
		}
	}
	return false
}

// isPlainJSONName reports whether a property name, without its quotes, reads
// the same decoded: no escapes and valid UTF-8.
func isPlainJSONName(name []byte) bool {
	return bytes.IndexByte(name, '\\') < 0 && utf8.Valid(name)
}

// skipJSONSpace returns the index of the first byte at or after i that is not
// JSON whitespace.
func skipJSONSpace(data []byte, i int) int {
	for i < len(data) {
		switch data[i] {
		case ' ', '\t', '\n', '\r':
			i++
		default:
			return i
		}
	}
	return i
}

// skipJSONString returns the index just past the string that starts at i.
func skipJSONString(data []byte, i int) int {
	for i++; i < len(data); i++ {
		switch data[i] {
		case '\\':
			i++
		case '"':
			return i + 1
		}
	}
	return i
}

// skipJSONValue returns the index just past the value that starts at i. The
// data must already be known to be valid JSON.
func skipJSONValue(data []byte, i int) int {
	switch data[i] {
	case '"':
		return skipJSONString(data, i)
	case '{', '[':
		depth := 0
		for i < len(data) {
			switch data[i] {
			case '"':
				i = skipJSONString(data, i)
				continue
			case '{', '[':
				depth++
			case '}', ']':
				depth--
				if depth == 0 {
					return i + 1
				}
			}
			i++
		}
		return i
	default:
		for i < len(data) {
			switch data[i] {
			case ',', '}', ']', ' ', '\t', '\n', '\r':
				return i
			}
			i++
		}
		return i
	}
}

// MatchesObjectKeys reports whether the given data is a JSON object that only
// contains keys from known and includes every key in required.
func MatchesObjectKeys(data []byte, known []string, required []string) bool {
	var object map[string]json.RawMessage
	if err := json.Unmarshal(data, &object); err != nil || object == nil {
		return false
	}
	for _, key := range required {
		if _, ok := object[key]; !ok {
			return false
		}
	}
	knownKeys := make(map[string]struct{}, len(known))
	for _, key := range known {
		knownKeys[key] = struct{}{}
	}
	for key := range object {
		if _, ok := knownKeys[key]; !ok {
			return false
		}
	}
	return true
}

// HasObjectKeys reports whether the given data is a JSON object that includes
// every key in required.
func HasObjectKeys(data []byte, required []string) bool {
	var object map[string]json.RawMessage
	if err := json.Unmarshal(data, &object); err != nil || object == nil {
		return false
	}
	for _, key := range required {
		if _, ok := object[key]; !ok {
			return false
		}
	}
	return true
}

// getKeys returns the keys associated with the given value. The value must be a
// a struct or a map with string keys.
func getKeys(value interface{}) ([]string, error) {
	val := reflect.ValueOf(value)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}
	if !val.IsValid() {
		return nil, nil
	}
	switch val.Kind() {
	case reflect.Struct:
		return getKeysForStructType(val.Type()), nil
	case reflect.Map:
		var keys []string
		if val.Type().Key().Kind() != reflect.String {
			return nil, fmt.Errorf("cannot extract keys from %T; only structs and maps with string keys are supported", value)
		}
		for _, key := range val.MapKeys() {
			keys = append(keys, key.String())
		}
		return keys, nil
	default:
		return nil, fmt.Errorf("cannot extract keys from %T; only structs and maps with string keys are supported", value)
	}
}

// getKeysForStructType returns all the keys associated with the given struct type,
// visiting embedded fields recursively.
func getKeysForStructType(structType reflect.Type) []string {
	if structType.Kind() == reflect.Pointer {
		structType = structType.Elem()
	}
	if structType.Kind() != reflect.Struct {
		return nil
	}
	var keys []string
	for i := 0; i < structType.NumField(); i++ {
		field := structType.Field(i)
		if field.Anonymous {
			keys = append(keys, getKeysForStructType(field.Type)...)
			continue
		}
		keys = append(keys, jsonKey(field))
	}
	return keys
}

// jsonKey returns the JSON key from the struct tag of the given field,
// excluding the omitempty flag (if any).
func jsonKey(field reflect.StructField) string {
	return strings.TrimSuffix(field.Tag.Get("json"), ",omitempty")
}

// isEmptyJSON returns true if the given data is empty, the empty JSON object, or
// an explicit null.
func isEmptyJSON(data []byte) bool {
	return len(data) <= 2 || bytes.Equal(data, []byte("null"))
}
