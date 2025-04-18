package gospec

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestScope(t *testing.T) {
	t.Run("import <-> import collision", func(t *testing.T) {
		scope := NewScope()

		json := scope.AddImport("encoding/json")
		assert.Equal(t, "json", json)

		encodingjson := scope.AddImport("other/encoding/json")
		assert.Equal(t, "encodingjson", encodingjson)
	})
	t.Run("import <-> ident collision", func(t *testing.T) {
		scope := NewScope()

		json := scope.Add("json")
		assert.Equal(t, "json", json)

		encodingjson := scope.AddImport("encoding/json")
		assert.Equal(t, "encodingjson", encodingjson)
	})
	t.Run("ident <-> import collision", func(t *testing.T) {
		scope := NewScope()

		json := scope.AddImport("encoding/json")
		assert.Equal(t, "json", json)

		_json := scope.Add("json")
		assert.Equal(t, "_json", _json)

	})
	t.Run("child", func(t *testing.T) {
		scope := NewScope()
		child := scope.Child()

		value := child.Add("value")
		assert.Equal(t, "value", value)

		value = scope.Add("value")
		assert.Equal(t, "value", value)

		os := child.AddImport("os")
		assert.Equal(t, "os", os)

		_os := scope.Add("os")
		assert.Equal(t, "_os", _os)

		assert.True(t, scope.Imports.Exists("os"))
	})

	t.Run("invalid identifier", func(t *testing.T) {
		scope := NewScope()
		assert.Equal(t, "ending", scope.Add("$ending"))
	})
}
