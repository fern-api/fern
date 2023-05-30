package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type Type struct {
	Type                 string
	Alias                *AliasTypeDeclaration
	Enum                 *EnumTypeDeclaration
	Object               *ObjectTypeDeclaration
	Union                *UnionTypeDeclaration
	UndiscriminatedUnion *UndiscriminatedUnionTypeDeclaration
}

func (x *Type) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "alias":
		value := new(AliasTypeDeclaration)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Alias = value
	case "enum":
		value := new(EnumTypeDeclaration)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Enum = value
	case "object":
		value := new(ObjectTypeDeclaration)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Object = value
	case "union":
		value := new(UnionTypeDeclaration)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Union = value
	case "undiscriminatedUnion":
		value := new(UndiscriminatedUnionTypeDeclaration)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.UndiscriminatedUnion = value
	}
	return nil
}

func (x Type) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "alias":
		var marshaler = struct {
			Type string `json:"_type"`
			*AliasTypeDeclaration
		}{
			Type:                 x.Type,
			AliasTypeDeclaration: x.Alias,
		}
		return json.Marshal(marshaler)
	case "enum":
		var marshaler = struct {
			Type string `json:"_type"`
			*EnumTypeDeclaration
		}{
			Type:                x.Type,
			EnumTypeDeclaration: x.Enum,
		}
		return json.Marshal(marshaler)
	case "object":
		var marshaler = struct {
			Type string `json:"_type"`
			*ObjectTypeDeclaration
		}{
			Type:                  x.Type,
			ObjectTypeDeclaration: x.Object,
		}
		return json.Marshal(marshaler)
	case "union":
		var marshaler = struct {
			Type string `json:"_type"`
			*UnionTypeDeclaration
		}{
			Type:                 x.Type,
			UnionTypeDeclaration: x.Union,
		}
		return json.Marshal(marshaler)
	case "undiscriminatedUnion":
		var marshaler = struct {
			Type string `json:"_type"`
			*UndiscriminatedUnionTypeDeclaration
		}{
			Type:                                x.Type,
			UndiscriminatedUnionTypeDeclaration: x.UndiscriminatedUnion,
		}
		return json.Marshal(marshaler)
	}
}

type TypeVisitor interface {
	VisitAlias(*AliasTypeDeclaration) error
	VisitEnum(*EnumTypeDeclaration) error
	VisitObject(*ObjectTypeDeclaration) error
	VisitUnion(*UnionTypeDeclaration) error
	VisitUndiscriminatedUnion(*UndiscriminatedUnionTypeDeclaration) error
}

func (x *Type) Accept(v TypeVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "alias":
		return v.VisitAlias(x.Alias)
	case "enum":
		return v.VisitEnum(x.Enum)
	case "object":
		return v.VisitObject(x.Object)
	case "union":
		return v.VisitUnion(x.Union)
	case "undiscriminatedUnion":
		return v.VisitUndiscriminatedUnion(x.UndiscriminatedUnion)
	}
}
