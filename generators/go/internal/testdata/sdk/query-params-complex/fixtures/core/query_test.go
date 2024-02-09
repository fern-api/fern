package core

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestQueryValues(t *testing.T) {
	t.Run("empty optional", func(t *testing.T) {
		type nested struct {
			Value *string `json:"value,omitempty" url:"value,omitempty"`
		}
		type example struct {
			Nested *nested `json:"nested,omitempty" url:"nested,omitempty"`
		}

		values, err := QueryValues(&example{})
		require.NoError(t, err)
		assert.Empty(t, values)
	})

	t.Run("empty required", func(t *testing.T) {
		type nested struct {
			Value *string `json:"value,omitempty" url:"value,omitempty"`
		}
		type example struct {
			Required string  `json:"required" url:"required"`
			Nested   *nested `json:"nested,omitempty" url:"nested,omitempty"`
		}

		values, err := QueryValues(&example{})
		require.NoError(t, err)
		assert.Equal(t, "required=", values.Encode())
	})

	t.Run("allow multiple", func(t *testing.T) {
		type example struct {
			Values []string `json:"values" url:"values"`
		}

		values, err := QueryValues(
			&example{
				Values: []string{"foo", "bar", "baz"},
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "values=foo&values=bar&values=baz", values.Encode())
	})

	t.Run("nested object", func(t *testing.T) {
		type nested struct {
			Value *string `json:"value,omitempty" url:"value,omitempty"`
		}
		type example struct {
			Required string  `json:"required" url:"required"`
			Nested   *nested `json:"nested,omitempty" url:"nested,omitempty"`
		}

		nestedValue := "nestedValue"
		values, err := QueryValues(
			&example{
				Required: "requiredValue",
				Nested: &nested{
					Value: &nestedValue,
				},
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "nested%5Bvalue%5D=nestedValue&required=requiredValue", values.Encode())
	})

	t.Run("url unspecified", func(t *testing.T) {
		type example struct {
			Required string `json:"required" url:"required"`
			NotFound string `json:"notFound"`
		}

		values, err := QueryValues(
			&example{
				Required: "requiredValue",
				NotFound: "notFound",
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "required=requiredValue", values.Encode())
	})

	t.Run("url ignored", func(t *testing.T) {
		type example struct {
			Required string `json:"required" url:"required"`
			NotFound string `json:"notFound" url:"-"`
		}

		values, err := QueryValues(
			&example{
				Required: "requiredValue",
				NotFound: "notFound",
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "required=requiredValue", values.Encode())
	})

	t.Run("datetime", func(t *testing.T) {
		type example struct {
			DateTime time.Time `json:"dateTime" url:"dateTime"`
		}

		values, err := QueryValues(
			&example{
				DateTime: time.Date(1994, 3, 16, 12, 34, 56, 0, time.UTC),
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "dateTime=1994-03-16T12%3A34%3A56Z", values.Encode())
	})

	t.Run("date", func(t *testing.T) {
		type example struct {
			Date time.Time `json:"date" url:"date" format:"date"`
		}

		values, err := QueryValues(
			&example{
				Date: time.Date(1994, 3, 16, 12, 34, 56, 0, time.UTC),
			},
		)
		require.NoError(t, err)
		assert.Equal(t, "date=1994-03-16", values.Encode())
	})

	t.Run("optional time", func(t *testing.T) {
		type example struct {
			Date *time.Time `json:"date,omitempty" url:"date,omitempty" format:"date"`
		}

		values, err := QueryValues(
			&example{},
		)
		require.NoError(t, err)
		assert.Empty(t, values.Encode())
	})
}
