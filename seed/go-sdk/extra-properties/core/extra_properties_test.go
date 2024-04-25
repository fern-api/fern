package core

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestExtraProperties(t *testing.T) {
	t.Run("non-nil pointer", func(t *testing.T) {
		type user struct {
			Name string `json:"name"`
		}
		value := &user{
			Name: "alice",
		}
		extraProperties, err := ExtractExtraProperties([]byte(`{"name": "alice", "age": 42}`), value)
		require.NoError(t, err)
		assert.Equal(t, map[string]interface{}{"age": float64(42)}, extraProperties)
	})

	t.Run("nil pointer", func(t *testing.T) {
		type user struct {
			Name string `json:"name"`
		}
		var value *user
		_, err := ExtractExtraProperties([]byte(`{"name": "alice", "age": 42}`), value)
		assert.EqualError(t, err, "value must be non-nil to extract extra properties")
	})

	t.Run("non-zero value", func(t *testing.T) {
		type user struct {
			Name string `json:"name"`
		}
		value := user{
			Name: "alice",
		}
		extraProperties, err := ExtractExtraProperties([]byte(`{"name": "alice", "age": 42}`), value)
		require.NoError(t, err)
		assert.Equal(t, map[string]interface{}{"age": float64(42)}, extraProperties)
	})

	t.Run("zero value", func(t *testing.T) {
		type user struct {
			Name string `json:"name"`
		}
		var value user
		extraProperties, err := ExtractExtraProperties([]byte(`{"name": "alice", "age": 42}`), value)
		require.NoError(t, err)
		assert.Equal(t, map[string]interface{}{"age": float64(42)}, extraProperties)
	})

	t.Run("exclude", func(t *testing.T) {
		type user struct {
			Name string `json:"name"`
		}
		value := &user{
			Name: "alice",
		}
		extraProperties, err := ExtractExtraProperties([]byte(`{"name": "alice", "age": 42}`), value, "age")
		require.NoError(t, err)
		assert.Equal(t, map[string]interface{}{}, extraProperties)
	})
}
