package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleContainer struct {
	Type     string
	List     []*ExampleTypeReference
	Set      []*ExampleTypeReference
	Optional *ExampleTypeReference
	Map      []*ExampleKeyValuePair
}

func (x *ExampleContainer) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "list":
		var valueUnmarshaler struct {
			List []*ExampleTypeReference `json:"list"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.List = valueUnmarshaler.List
	case "set":
		var valueUnmarshaler struct {
			Set []*ExampleTypeReference `json:"set"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Set = valueUnmarshaler.Set
	case "optional":
		var valueUnmarshaler struct {
			Optional *ExampleTypeReference `json:"optional"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Optional = valueUnmarshaler.Optional
	case "map":
		var valueUnmarshaler struct {
			Map []*ExampleKeyValuePair `json:"map"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Map = valueUnmarshaler.Map
	}
	return nil
}

func (x ExampleContainer) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "list":
		var marshaler = struct {
			Type string                  `json:"type"`
			List []*ExampleTypeReference `json:"list"`
		}{
			Type: x.Type,
			List: x.List,
		}
		return json.Marshal(marshaler)
	case "set":
		var marshaler = struct {
			Type string                  `json:"type"`
			Set  []*ExampleTypeReference `json:"set"`
		}{
			Type: x.Type,
			Set:  x.Set,
		}
		return json.Marshal(marshaler)
	case "optional":
		var marshaler = struct {
			Type     string                `json:"type"`
			Optional *ExampleTypeReference `json:"optional"`
		}{
			Type:     x.Type,
			Optional: x.Optional,
		}
		return json.Marshal(marshaler)
	case "map":
		var marshaler = struct {
			Type string                 `json:"type"`
			Map  []*ExampleKeyValuePair `json:"map"`
		}{
			Type: x.Type,
			Map:  x.Map,
		}
		return json.Marshal(marshaler)
	}
}

type ExampleContainerVisitor interface {
	VisitList([]*ExampleTypeReference) error
	VisitSet([]*ExampleTypeReference) error
	VisitOptional(*ExampleTypeReference) error
	VisitMap([]*ExampleKeyValuePair) error
}

func (x *ExampleContainer) Accept(v ExampleContainerVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "list":
		return v.VisitList(x.List)
	case "set":
		return v.VisitSet(x.Set)
	case "optional":
		return v.VisitOptional(x.Optional)
	case "map":
		return v.VisitMap(x.Map)
	}
}
