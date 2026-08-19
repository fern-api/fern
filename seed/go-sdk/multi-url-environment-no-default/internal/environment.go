package internal

import (
	"reflect"
)

// ResolveEnvironmentBaseURL resolves the base URL from an environment struct
// by looking up the field with the given name. This is used for multi-URL
// environments where different endpoints use different base URLs.
func ResolveEnvironmentBaseURL(environment interface{}, fieldName string) string {
	if environment == nil || fieldName == "" {
		return ""
	}
	v := reflect.ValueOf(environment)
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return ""
		}
		v = v.Elem()
	}
	if v.Kind() != reflect.Struct {
		return ""
	}
	field := v.FieldByName(fieldName)
	if !field.IsValid() || field.Kind() != reflect.String {
		return ""
	}
	return field.String()
}
