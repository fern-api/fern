package api

import (
	json "encoding/json"
	fmt "fmt"
)

type Union struct {
	Type string
	Docs string
	One  *ExampleType
}

func (x *Union) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
		Docs string `json:"docs"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	x.Docs = unmarshaler.Docs
	switch unmarshaler.Type {
	case "one":
		value := new(ExampleType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.One = value
	}
	return nil
}

func (x Union) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "one":
		var marshaler = struct {
			Type string `json:"type"`
			Docs string `json:"docs"`
			*ExampleType
		}{
			Type:        x.Type,
			Docs:        x.Docs,
			ExampleType: x.One,
		}
		return json.Marshal(marshaler)
	}
}

type UnionVisitor interface {
	VisitOne(*ExampleType) error
}

func (x *Union) Accept(v UnionVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "one":
		return v.VisitOne(x.One)
	}
}
