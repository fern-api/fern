package core

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type OptionalRequest struct {
	Id        string               `json:"id"`
	Filter    *Optional[string]    `json:"filter,omitempty"`
	Reference *Optional[Reference] `json:"reference,omitempty"`
}

type Reference struct {
	Id   string   `json:"id"`
	Tags []string `json:"tags"`
}

func (r *Reference) MarshalJSON() ([]byte, error) {
	type embed Reference
	var marshaler = struct {
		embed
		Extra string `json:"extra"`
	}{
		embed: embed(*r),
		Extra: "metadata",
	}
	return json.Marshal(marshaler)
}

func TestOptional(t *testing.T) {
	tests := []struct {
		desc         string
		giveOptional *Optional[any]
		wantBytes    []byte
	}{
		{
			desc: "primitive",
			giveOptional: &Optional[any]{
				Value: "foo",
			},
			wantBytes: []byte(`"foo"`),
		},
		{
			desc: "null primitive",
			giveOptional: &Optional[any]{
				Null: true,
			},
			wantBytes: []byte("null"),
		},
		{
			desc: "object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
					Filter: &Optional[string]{
						Value: "foo",
					},
				},
			},
			wantBytes: []byte(`{"id":"xyz","filter":"foo"}`),
		},
		{
			desc: "null object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
					Filter: &Optional[string]{
						Null: true,
					},
				},
			},
			wantBytes: []byte(`{"id":"xyz","filter":null}`),
		},
		{
			desc: "empty object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
				},
			},
			wantBytes: []byte(`{"id":"xyz"}`),
		},
		{
			desc: "nested object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
					Reference: &Optional[Reference]{
						Value: Reference{
							Id:   "abc",
							Tags: []string{"one", "two", "three"},
						},
					},
				},
			},
			wantBytes: []byte(`{"id":"xyz","reference":{"id":"abc","tags":["one","two","three"],"extra":"metadata"}}`),
		},
		{
			desc: "null nested object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
					Reference: &Optional[Reference]{
						Null: true,
					},
				},
			},
			wantBytes: []byte(`{"id":"xyz","reference":null}`),
		},
		{
			desc: "empty nested object",
			giveOptional: &Optional[any]{
				Value: &OptionalRequest{
					Id: "xyz",
				},
			},
			wantBytes: []byte(`{"id":"xyz"}`),
		},
	}
	for _, test := range tests {
		t.Run(test.desc, func(t *testing.T) {
			bytes, err := json.Marshal(test.giveOptional)
			require.NoError(t, err)
			assert.Equal(t, test.wantBytes, bytes)
		})
	}
}
