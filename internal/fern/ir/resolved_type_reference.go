package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ResolvedTypeReference struct {
	Type      string
	Container *ContainerType
	Named     *ResolvedNamedType
	Primitive PrimitiveType
	Unknown   any
}

func (x *ResolvedTypeReference) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type      string         `json:"_type"`
		Container *ContainerType `json:"container"`
		Primitive PrimitiveType  `json:"primitive"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "container":
		x.Container = unmarshaler.Container
	case "named":
		value := new(ResolvedNamedType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Named = value
	case "primitive":
		x.Primitive = unmarshaler.Primitive
	case "unknown":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Unknown = value
	}
	return nil
}

type ResolvedTypeReferenceVisitor interface {
	VisitContainer(*ContainerType) error
	VisitNamed(*ResolvedNamedType) error
	VisitPrimitive(PrimitiveType) error
	VisitUnknown(any) error
}

func (x *ResolvedTypeReference) Accept(v ResolvedTypeReferenceVisitor) error {
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
