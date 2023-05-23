package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleSingleUnionTypeProperties struct {
	Type                   string
	SamePropertiesAsObject *ExampleNamedType
	SingleProperty         *ExampleTypeReference
	NoProperties           any
}

func (x *ExampleSingleUnionTypeProperties) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "samePropertiesAsObject":
		value := new(ExampleNamedType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.SamePropertiesAsObject = value
	case "singleProperty":
		value := new(ExampleTypeReference)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.SingleProperty = value
	case "noProperties":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.NoProperties = value
	}
	return nil
}

type ExampleSingleUnionTypePropertiesVisitor interface {
	VisitSamePropertiesAsObject(*ExampleNamedType) error
	VisitSingleProperty(*ExampleTypeReference) error
	VisitNoProperties(any) error
}

func (x *ExampleSingleUnionTypeProperties) Accept(v ExampleSingleUnionTypePropertiesVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "samePropertiesAsObject":
		return v.VisitSamePropertiesAsObject(x.SamePropertiesAsObject)
	case "singleProperty":
		return v.VisitSingleProperty(x.SingleProperty)
	case "noProperties":
		return v.VisitNoProperties(x.NoProperties)
	}
}
