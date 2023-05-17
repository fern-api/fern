package types

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// Type is a generic type.
type Type interface {
	isType()
}

// ObjectTypeDeclaration implements the Type interface.
type ObjectTypeDeclaration struct {
	Type       string              `json:"_type,omitempty"`
	Extends    []*DeclaredTypeName `json:"extends,omitempty"`
	Properties []*ObjectProperty   `json:"properties,omitempty"`
}

func (o ObjectTypeDeclaration) isType() {}

// ObjectProperty is a single property associated with an object.
type ObjectProperty struct {
	Docs         string            `json:"docs,omitempty"`
	Availability *Availability     `json:"availability,omitempty"`
	Name         *NameAndWireValue `json:"name,omitempty"`
	ValueType    TypeReference     `json:"valueType,omitempty"`
}

// UnmarshalJSON implements json.Unmarshaler.
func (o *ObjectProperty) UnmarshalJSON(data []byte) error {
	var raw struct {
		Docs         string            `json:"docs,omitempty"`
		Availability *Availability     `json:"availability,omitempty"`
		Name         *NameAndWireValue `json:"name,omitempty"`
		ValueType    json.RawMessage   `json:"valueType,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	o.Docs = raw.Docs
	o.Availability = raw.Availability
	o.Name = raw.Name

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var valueType struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.ValueType, &valueType); err != nil {
		return err
	}
	if valueType.Type != "" {
		switch valueType.Type {
		case "primitive":
			o.ValueType = new(TypeReferencePrimitive)
		default:
			return fmt.Errorf("unrecognized %T type: %v", o.ValueType, valueType.Type)
		}
		if err := json.Unmarshal(raw.ValueType, o.ValueType); err != nil {
			return err
		}
	}
	return nil
}

// TypeDeclaration declares a generic type.
type TypeDeclaration struct {
	Docs         string            `json:"docs,omitempty"`
	Availability *Availability     `json:"availability,omitempty"`
	Name         *DeclaredTypeName `json:"name,omitempty"`
	Shape        Type              `json:"shape,omitempty"`
	Examples     []*ExampleType    `json:"examples,omitempty"`

	// TODO: This is actually represented as a Fern set, but this is problematic
	// w.r.t. a complex struct as a map key. Verify the wire representation to
	// see if this is actually just a list with unique elements.
	ReferencedTypes []*DeclaredTypeName `json:"referenceTypes,omitempty"`
}

// UnmarshalJSON implements json.Unmarshaler.
func (t *TypeDeclaration) UnmarshalJSON(data []byte) error {
	var raw struct {
		Docs            string              `json:"docs,omitempty"`
		Availability    *Availability       `json:"availability,omitempty"`
		Name            *Name               `json:"name,omitempty"`
		Shape           json.RawMessage     `json:"shape,omitempty"`
		Examples        []*ExampleType      `json:"examples,omitempty"`
		ReferencedTypes []*DeclaredTypeName `json:"referenceTypes,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	t.Docs = raw.Docs
	t.Availability = raw.Availability
	t.Name = raw.Name
	t.Examples = raw.Examples
	t.ReferencedTypes = raw.ReferencedTypes

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var shape struct {
		Type string `json:"type,omitempty"`
	}
	if err := json.Unmarshal(raw.Shape, &shape); err != nil {
		return err
	}
	if shape.Type != "" {
		switch shape.Type {
		case "object":
			t.Shape = new(ObjectTypeDeclaration)
		default:
			return fmt.Errorf("unrecognized %T type: %v", t.Shape, shape.Type)
		}
		if err := json.Unmarshal(raw.Shape, t.Shape); err != nil {
			return err
		}
	}
	return nil
}

// ExampleType specifies an example of a particular type.
type ExampleType struct {
	Docs        string `json:"docs,omitempty"`
	JSONExample any    `json:"jsonExample,omitempty"`
	Name        *Name  `json:"name,omitempty"`

	// TODO: Add the following field.
	// Shape       ExampleTypeShape `json:"shape,omitempty"` // TODO: Needs custom json.Unmarshaler.
}

// ExampleTypeShape specifies the shape of an example type.
type ExampleTypeShape interface {
	isExampleTypeShape()
}

// ExampleTypeShapeObject implements the ExampleTypeShape interface.
type ExampleTypeShapeObject struct {
	Type       string                   `json:"type,omitempty"`
	Properties []*ExampleObjectProperty `json:"properties,omitempty"`
}

// ExampleObjectProperty is an example of an object property.
type ExampleObjectProperty struct {
	WireKey                 string                `json:"wireKey,omitempty"`
	Value                   *ExampleTypeReference `json:"value,omitempty"`
	OriginalTypeDeclaration *DeclaredTypeName     `json:"originalTypeDeclaration,omitempty"`
}

// ExampleTypeReference is an example of a type reference.
type ExampleTypeReference struct {
	JSONExample any `json:"jsonExample,omitempty"`

	// TODO: Add the following field.
	// Shape       *ExampleTypeReferenceShape `json:"shape,omitempty"`
}

// DeclaredTypeName references a type name, including the file it's
// defined.
type DeclaredTypeName struct {
	TypeID       TypeID        `json:"typeId,omitempty"`
	FernFilepath *FernFilepath `json:"fernFilepath,omitempty"`
	Name         *Name         `json:"name,omitempty"`
}

// TypeReference is a reference to a generic type (e.g. primitives,
// containers, etc).
type TypeReference interface {
	isTypeReference()
}

// TypeReferencePrimitive is the primitive TypeReference.
type TypeReferencePrimitive struct {
	Type      string        `json:"_type,omitempty"`
	Primitive PrimitiveType `json:"primitive,omitempty"`
}

func (t *TypeReferencePrimitive) isTypeReference() {}

// PrimitiveType defines a primitive type.
type PrimitiveType uint8

// All of the support auth requirements.
const (
	PrimitiveTypeInteger PrimitiveType = iota + 1
	PrimitiveTypeDouble
	PrimitiveTypeString
	PrimitiveTypeBoolean
	PrimitiveTypeLong
	PrimitiveTypeDateTime
	PrimitiveTypeDate
	PrimitiveTypeUUID
	PrimitiveTypeBase64
)

// String implements fmt.Stringer.
func (p PrimitiveType) String() string {
	switch p {
	case PrimitiveTypeInteger:
		return "INTEGER"
	case PrimitiveTypeDouble:
		return "DOUBLE"
	case PrimitiveTypeString:
		return "STRING"
	case PrimitiveTypeBoolean:
		return "BOOLEAN"
	case PrimitiveTypeLong:
		return "LONG"
	case PrimitiveTypeDateTime:
		return "DATE_TIME"
	case PrimitiveTypeDate:
		return "DATE"
	case PrimitiveTypeUUID:
		return "UUID"
	case PrimitiveTypeBase64:
		return "BASE_64"
	default:
		return strconv.Itoa(int(p))
	}
}

// MarshalJSON implements json.Marshaler.
func (p PrimitiveType) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", p.String())), nil
}

// UnmarshalJSON implements json.Unmarshaler.
func (p *PrimitiveType) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "INTEGER":
		value := PrimitiveTypeInteger
		*p = value
	case "DOUBLE":
		value := PrimitiveTypeDouble
		*p = value
	case "STRING":
		value := PrimitiveTypeString
		*p = value
	case "BOOLEAN":
		value := PrimitiveTypeBoolean
		*p = value
	case "LONG":
		value := PrimitiveTypeLong
		*p = value
	case "DATE_TIME":
		value := PrimitiveTypeDateTime
		*p = value
	case "DATE":
		value := PrimitiveTypeDate
		*p = value
	case "UUID":
		value := PrimitiveTypeUUID
		*p = value
	case "BASE_64":
		value := PrimitiveTypeBase64
		*p = value
	}
	return nil
}
