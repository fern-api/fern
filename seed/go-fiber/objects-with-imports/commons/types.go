// This file was auto-generated by Fern from our API Definition.

package commons

import (
	fmt "fmt"
	core "github.com/objects-with-imports/fern/core"
)

type Metadata struct {
	Id   string            `json:"id" url:"id"`
	Data map[string]string `json:"data,omitempty" url:"data,omitempty"`
}

func (m *Metadata) String() string {
	if value, err := core.StringifyJSON(m); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", m)
}
