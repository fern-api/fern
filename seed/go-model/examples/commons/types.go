// Code generated by Fern. DO NOT EDIT.

package commons

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/examples/fern/internal"
)

type Tag = string

type Metadata struct {
	Id         string            `json:"id" url:"id"`
	Data       map[string]string `json:"data,omitempty" url:"data,omitempty"`
	JsonString *string           `json:"jsonString,omitempty" url:"jsonString,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (m *Metadata) GetId() string {
	if m == nil {
		return ""
	}
	return m.Id
}

func (m *Metadata) GetData() map[string]string {
	if m == nil {
		return nil
	}
	return m.Data
}

func (m *Metadata) GetJsonString() *string {
	if m == nil {
		return nil
	}
	return m.JsonString
}

func (m *Metadata) GetExtraProperties() map[string]any {
	if m == nil {
		return nil
	}
	return m.extraProperties
}

func (m *Metadata) String() string {
	if len(m.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(m.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(m); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", m)
}

type EventInfo struct {
	Type     string
	Metadata Metadata
	Tag      Tag
}

type Data struct {
	Type   string
	String string
	Base64 []byte
}
