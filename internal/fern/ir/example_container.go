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
		Type     string                  `json:"type"`
		List     []*ExampleTypeReference `json:"list"`
		Set      []*ExampleTypeReference `json:"set"`
		Optional *ExampleTypeReference   `json:"optional"`
		Map      []*ExampleKeyValuePair  `json:"map"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "list":
		x.List = unmarshaler.List
	case "set":
		x.Set = unmarshaler.Set
	case "optional":
		x.Optional = unmarshaler.Optional
	case "map":
		x.Map = unmarshaler.Map
	}
	return nil
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
