package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleTypeReferenceShape struct {
	Type      string
	Primitive *ExamplePrimitive
	Container *ExampleContainer
	Unknown   any
	Named     *ExampleNamedType
}

func (x *ExampleTypeReferenceShape) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "primitive":
		value := new(ExamplePrimitive)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Primitive = value
	case "container":
		value := new(ExampleContainer)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Container = value
	case "unknown":
		var value any
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Unknown = value
	case "named":
		value := new(ExampleNamedType)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Named = value
	}
	return nil
}

type ExampleTypeReferenceShapeVisitor interface {
	VisitPrimitive(*ExamplePrimitive) error
	VisitContainer(*ExampleContainer) error
	VisitUnknown(any) error
	VisitNamed(*ExampleNamedType) error
}

func (x *ExampleTypeReferenceShape) Accept(v ExampleTypeReferenceShapeVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "primitive":
		return v.VisitPrimitive(x.Primitive)
	case "container":
		return v.VisitContainer(x.Container)
	case "unknown":
		return v.VisitUnknown(x.Unknown)
	case "named":
		return v.VisitNamed(x.Named)
	}
}
