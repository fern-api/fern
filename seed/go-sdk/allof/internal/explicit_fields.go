package internal

import (
	"math/big"
	"reflect"
	"strings"
)

// HandleExplicitFields processes a struct to remove `omitempty` from
// fields that have been explicitly set (as indicated by their corresponding bit in explicitFields).
// Note that `marshaler` should be an embedded struct to avoid infinite recursion.
//
// The marshaler may either be the struct itself, or a wrapper struct whose first
// field embeds the struct and whose remaining fields shadow some of the embedded
// fields (e.g. to override how dates are serialized). In the wrapper case, the
// explicitFields bits are indexed against the embedded struct's fields, and the
// shadow fields take precedence over the embedded fields with the same JSON name.
//
// Returns an interface{} that can be passed to json.Marshal.
func HandleExplicitFields(marshaler interface{}, explicitFields *big.Int) interface{} {
	val := reflect.ValueOf(marshaler)
	typ := reflect.TypeOf(marshaler)

	// Handle pointer types
	if val.Kind() == reflect.Ptr {
		if val.IsNil() {
			return nil
		}
		val = val.Elem()
		typ = typ.Elem()
	}

	// Only handle struct types
	if val.Kind() != reflect.Struct {
		return marshaler
	}

	// If no explicit fields set, use standard marshaling
	if explicitFields == nil || explicitFields.Sign() == 0 {
		return marshaler
	}

	sourceVal := val
	sourceType := typ
	var shadowFields []reflect.StructField
	var shadowValues []reflect.Value

	// Detect the embedded struct pattern: the first field is anonymous, and any
	// remaining fields shadow fields of the embedded struct.
	if typ.NumField() > 0 && typ.Field(0).Anonymous && val.Field(0).Kind() == reflect.Struct {
		sourceVal = val.Field(0)
		sourceType = sourceVal.Type()
		for i := 1; i < typ.NumField(); i++ {
			field := typ.Field(i)
			if !field.IsExported() || field.Anonymous {
				continue
			}
			shadowFields = append(shadowFields, field)
			shadowValues = append(shadowValues, val.Field(i))
		}
	}

	// Fields tagged json:"-" are never serialized, so they can't shadow anything.
	shadowIndexByName := make(map[string]int, len(shadowFields))
	for i, shadow := range shadowFields {
		if name := jsonFieldName(shadow); name != "-" {
			shadowIndexByName[name] = i
		}
	}

	fields := make([]reflect.StructField, 0, sourceType.NumField()+len(shadowFields))
	values := make([]reflect.Value, 0, sourceType.NumField()+len(shadowFields))
	usedShadows := make([]bool, len(shadowFields))

	// The generated bit constants are numbered over the exported fields in
	// declaration order, so unexported fields don't consume a bit.
	bitIndex := 0
	for i := 0; i < sourceType.NumField(); i++ {
		field := sourceType.Field(i)

		// Skip unexported fields and the explicitFields field itself
		if !field.IsExported() || field.Name == "explicitFields" {
			continue
		}

		value := sourceVal.Field(i)

		// If a shadow field exists for this JSON name, it is the one that actually
		// serializes, so use it (and its value) in place of the embedded field.
		if j, ok := shadowIndexByName[jsonFieldName(field)]; ok {
			field = shadowFields[j]
			value = shadowValues[j]
			usedShadows[j] = true
		}

		// Check if this field has been explicitly set
		if explicitFields.Bit(bitIndex) != 0 {
			field.Tag = removeOmitEmpty(field.Tag)
		}
		bitIndex++

		fields = append(fields, field)
		values = append(values, value)
	}

	// Preserve any wrapper fields that don't shadow an embedded field.
	for j, shadow := range shadowFields {
		if usedShadows[j] {
			continue
		}
		fields = append(fields, shadow)
		values = append(values, shadowValues[j])
	}

	// Create new struct type with modified tags
	newType := reflect.StructOf(fields)
	newVal := reflect.New(newType).Elem()

	// Copy field values from original struct to new struct
	for i, value := range values {
		newVal.Field(i).Set(value)
	}

	return newVal.Interface()
}

// jsonFieldName returns the name the field is serialized as by encoding/json.
func jsonFieldName(field reflect.StructField) string {
	tag := field.Tag.Get("json")
	if tag == "-" {
		return "-"
	}
	if name := strings.Split(tag, ",")[0]; name != "" {
		return name
	}
	return field.Name
}

// removeOmitEmpty returns the given struct tag with `omitempty` removed
// from the json tag options.
func removeOmitEmpty(structTag reflect.StructTag) reflect.StructTag {
	tag := structTag.Get("json")
	if tag == "" || tag == "-" {
		return structTag
	}

	// Parse the json tag, remove omitempty from options
	parts := strings.Split(tag, ",")
	if len(parts) > 1 {
		var newParts []string
		newParts = append(newParts, parts[0]) // Keep the field name
		for _, part := range parts[1:] {
			if strings.TrimSpace(part) != "omitempty" {
				newParts = append(newParts, part)
			}
		}
		tag = strings.Join(newParts, ",")
	}

	// Reconstruct the struct tag
	newTag := `json:"` + tag + `"`
	if urlTag := structTag.Get("url"); urlTag != "" {
		newTag += ` url:"` + urlTag + `"`
	}
	return reflect.StructTag(newTag)
}
