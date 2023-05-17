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
		case "container":
			o.ValueType = new(TypeReferenceContainer)
		case "named":
			o.ValueType = new(TypeReferenceNamed)
		case "primitive":
			o.ValueType = new(TypeReferencePrimitive)
		case "unknown":
			o.ValueType = new(TypeReferenceUnknown)
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
		Name            *DeclaredTypeName   `json:"name,omitempty"`
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
		Type string `json:"_type,omitempty"`
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

// TypeReferenceNamed is the named TypeReference.
type TypeReferenceNamed struct {
	Named *DeclaredTypeName `json:"named,omitempty"`
}

func (t *TypeReferenceNamed) isTypeReference() {}

// TypeReferenceContainer is the container TypeReference.
type TypeReferenceContainer struct {
	Type      string        `json:"_type,omitempty"`
	Container ContainerType `json:"container,omitempty"`
}

func (t *TypeReferenceContainer) isTypeReference() {}

// ContainerType is a union of container types (e.g. list, map etc).
type ContainerType interface {
	isContainerType()
}

// ContainerTypeList implements the list ContainerType.
type ContainerTypeList struct {
	Type string        `json:"_type,omitempty"`
	List TypeReference `json:"list,omitempty"`
}

func (c *ContainerTypeList) isContainerType() {}

// UnmarshalJSON implements json.Unmarshaler.
func (c *ContainerTypeList) UnmarshalJSON(data []byte) error {
	var raw struct {
		Type string          `json:"_type,omitempty"`
		List json.RawMessage `json:"list,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	c.Type = raw.Type

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var list struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.List, &list); err != nil {
		return err
	}
	if list.Type != "" {
		switch list.Type {
		case "container":
			c.List = new(TypeReferenceContainer)
		case "named":
			c.List = new(TypeReferenceNamed)
		case "primitive":
			c.List = new(TypeReferencePrimitive)
		case "unknown":
			c.List = new(TypeReferenceUnknown)
		default:
			return fmt.Errorf("unrecognized %T type: %v", c.List, list.Type)
		}
		if err := json.Unmarshal(raw.List, c.List); err != nil {
			return err
		}
	}

	return nil
}

// ContainerTypeMap implements the map ContainerType.
type ContainerTypeMap struct {
	Type string   `json:"_type,omitempty"`
	Map  *MapType `json:"map,omitempty"`
}

func (c *ContainerTypeMap) isContainerType() {}

// MapType is a type with key, value pairs.
type MapType struct {
	KeyType   TypeReference `json:"keyType,omitempty"`
	ValueType TypeReference `json:"valueType,omitempty"`
}

// UnmarshalJSON implements json.Unmarshaler.
func (m *MapType) UnmarshalJSON(data []byte) error {
	var raw struct {
		KeyType   json.RawMessage `json:"keyType,omitempty"`
		ValueType json.RawMessage `json:"valueType,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var keyType struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.KeyType, &keyType); err != nil {
		return err
	}
	if keyType.Type != "" {
		switch keyType.Type {
		case "container":
			m.KeyType = new(TypeReferenceContainer)
		case "named":
			m.KeyType = new(TypeReferenceNamed)
		case "primitive":
			m.KeyType = new(TypeReferencePrimitive)
		case "unknown":
			m.KeyType = new(TypeReferenceUnknown)
		default:
			return fmt.Errorf("unrecognized %T type: %v", m.KeyType, keyType.Type)
		}
		if err := json.Unmarshal(raw.KeyType, m.KeyType); err != nil {
			return err
		}
	}

	var valueType struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.ValueType, &valueType); err != nil {
		return err
	}
	if valueType.Type != "" {
		switch valueType.Type {
		case "container":
			m.ValueType = new(TypeReferenceContainer)
		case "named":
			m.ValueType = new(TypeReferenceNamed)
		case "primitive":
			m.ValueType = new(TypeReferencePrimitive)
		case "unknown":
			m.ValueType = new(TypeReferenceUnknown)
		default:
			return fmt.Errorf("unrecognized %T type: %v", m.ValueType, valueType.Type)
		}
		if err := json.Unmarshal(raw.ValueType, m.ValueType); err != nil {
			return err
		}
	}

	return nil
}

// ContainerTypeOptional implements the optional ContainerType.
type ContainerTypeOptional struct {
	Type     string        `json:"_type,omitempty"`
	Optional TypeReference `json:"optional,omitempty"`
}

func (c *ContainerTypeOptional) isContainerType() {}

// UnmarshalJSON implements json.Unmarshaler.
func (c *ContainerTypeOptional) UnmarshalJSON(data []byte) error {
	var raw struct {
		Type     string          `json:"_type,omitempty"`
		Optional json.RawMessage `json:"optional,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	c.Type = raw.Type

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var optional struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.Optional, &optional); err != nil {
		return err
	}
	if optional.Type != "" {
		switch optional.Type {
		case "container":
			c.Optional = new(TypeReferenceContainer)
		case "named":
			c.Optional = new(TypeReferenceNamed)
		case "primitive":
			c.Optional = new(TypeReferencePrimitive)
		case "unknown":
			c.Optional = new(TypeReferenceUnknown)
		default:
			return fmt.Errorf("unrecognized %T type: %v", c.Optional, optional.Type)
		}
		if err := json.Unmarshal(raw.Optional, c.Optional); err != nil {
			return err
		}
	}

	return nil
}

// ContainerTypeSet implements the set ContainerType.
type ContainerTypeSet struct {
	Type string        `json:"_type,omitempty"`
	Set  TypeReference `json:"set,omitempty"`
}

func (c *ContainerTypeSet) isContainerType() {}

// UnmarshalJSON implements json.Unmarshaler.
func (c *ContainerTypeSet) UnmarshalJSON(data []byte) error {
	var raw struct {
		Type string          `json:"_type,omitempty"`
		Set  json.RawMessage `json:"set,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Set all of the simple, non-union fields.
	c.Type = raw.Type

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var set struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.Set, &set); err != nil {
		return err
	}
	if set.Type != "" {
		switch set.Type {
		case "container":
			c.Set = new(TypeReferenceContainer)
		case "named":
			c.Set = new(TypeReferenceNamed)
		case "primitive":
			c.Set = new(TypeReferencePrimitive)
		case "unknown":
			c.Set = new(TypeReferenceUnknown)
		default:
			return fmt.Errorf("unrecognized %T type: %v", c.Set, set.Type)
		}
		if err := json.Unmarshal(raw.Set, c.Set); err != nil {
			return err
		}
	}

	return nil
}

// ContainerTypeLiteral implements the set ContainerType.
type ContainerTypeLiteral struct {
	Type    string  `json:"_type,omitempty"`
	Literal Literal `json:"literal,omitempty"`
}

func (c *ContainerTypeLiteral) isContainerType() {}

// UnmarshalJSON implements json.Unmarshaler.
func (c *ContainerTypeLiteral) UnmarshalJSON(data []byte) error {
	var raw struct {
		Type    string          `json:"_type,omitempty"`
		Literal json.RawMessage `json:"literal,omitempty"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Literal all of the simple, non-union fields.
	c.Type = raw.Type

	// Then unmarshal each union based on its type.
	// This needs to take the discriminant into
	// consideration.
	var literal struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(raw.Literal, &literal); err != nil {
		return err
	}
	if literal.Type != "" {
		switch literal.Type {
		case "string":
			c.Literal = new(LiteralString)
		default:
			return fmt.Errorf("unrecognized %T type: %v", c.Literal, literal.Type)
		}
		if err := json.Unmarshal(raw.Literal, c.Literal); err != nil {
			return err
		}
	}

	return nil
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

// TypeReferenceUnknown is the unknown TypeReference.
type TypeReferenceUnknown struct {
	Type    string `json:"_type,omitempty"`
	Unknown any    `json:"unknown,omitempty"`
}

func (t *TypeReferenceUnknown) isTypeReference() {}
