package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type TypeReference struct {
	Type      string
	Container *ContainerType
	Named     *DeclaredTypeName
	Primitive PrimitiveType
	Unknown   any
}

func (x *TypeReference) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "container":
		value := new(ContainerType)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Container = value
	case "named":
		value := new(DeclaredTypeName)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Named = value
	case "primitive":
		var value PrimitiveType
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Primitive = value
	case "unknown":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Unknown = value
	}
	return nil
}

type TypeReferenceVisitor interface {
	VisitContainer(*ContainerType) error
	VisitNamed(*DeclaredTypeName) error
	VisitPrimitive(PrimitiveType) error
	VisitUnknown(any) error
}

func (x *TypeReference) Accept(v TypeReferenceVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "container":
		return v.VisitContainer(x.Container)
	case "named":
		return v.VisitNamed(x.Named)
	case "primitive":
		return v.VisitPrimitive(x.Primitive)
	case "unknown":
		return v.VisitUnknown(x.Unknown)
	}
}
