// This file was auto-generated by Fern from our API Definition.

package responseproperty

import (
	fmt "fmt"
	core "github.com/response-property/fern/core"
)

type WithMetadata struct {
	Metadata map[string]string `json:"metadata,omitempty" url:"metadata,omitempty"`
}

func (w *WithMetadata) String() string {
	if value, err := core.StringifyJSON(w); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", w)
}

type Movie struct {
	Id   string `json:"id" url:"id"`
	Name string `json:"name" url:"name"`
}

func (m *Movie) String() string {
	if value, err := core.StringifyJSON(m); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", m)
}

type WithDocs struct {
	Docs string `json:"docs" url:"docs"`
}

func (w *WithDocs) String() string {
	if value, err := core.StringifyJSON(w); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", w)
}
