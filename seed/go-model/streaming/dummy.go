// Code generated by Fern. DO NOT EDIT.

package streaming

import (
	json "encoding/json"
	fmt "fmt"
	internal "github.com/streaming/fern/v2/internal"
)

type StreamResponse struct {
	Id   string  `json:"id" url:"id"`
	Name *string `json:"name,omitempty" url:"name,omitempty"`

	extraProperties map[string]any
	rawJSON         json.RawMessage
}

func (s *StreamResponse) GetId() string {
	if s == nil {
		return ""
	}
	return s.Id
}

func (s *StreamResponse) GetName() *string {
	if s == nil {
		return nil
	}
	return s.Name
}

func (s *StreamResponse) GetExtraProperties() map[string]any {
	if s == nil {
		return nil
	}
	return s.extraProperties
}

func (s *StreamResponse) UnmarshalJSON(
	data []byte,
) error {
	type unmarshaler StreamResponse
	var value unmarshaler
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	*s = StreamResponse(value)
	extraProperties, err := internal.ExtractExtraProperties(data, *s)
	if err != nil {
		return err
	}
	s.extraProperties = extraProperties
	s.rawJSON = json.RawMessage(data)
	return nil
}

func (s *StreamResponse) String() string {
	if len(s.rawJSON) > 0 {
		if value, err := internal.StringifyJSON(s.rawJSON); err == nil {
			return value
		}
	}
	if value, err := internal.StringifyJSON(s); err == nil {
		return value
	}
	return fmt.Sprintf("%#v", s)
}
