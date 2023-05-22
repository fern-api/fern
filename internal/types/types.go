package types

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// TypeDeclaration declares a generic type.
type TypeDeclaration struct {
	Docs            string              `json:"docs,omitempty"`
	Availability    *Availability       `json:"availability,omitempty"`
	Name            *DeclaredTypeName   `json:"name,omitempty"`
	Shape           *Type               `json:"shape,omitempty"`
	Examples        []*ExampleType      `json:"examples,omitempty"`
	ReferencedTypes []*DeclaredTypeName `json:"referenceTypes,omitempty"`
}

// Type is a generic type.
type Type struct {
	Type   string                 `json:"_type,omitempty"`
	Alias  *AliasTypeDeclaration  `json:"alias,omitempty"`
	Object *ObjectTypeDeclaration `json:"object,omitempty"`

	// TODO: Fill in the remaining Type union values.
}

// UnmarshalJSON implement json.Unmarshaler.
func (t *Type) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type,omitempty"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	t.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "alias":
		// This type does not have an explicit union key, so we need to
		// unmarshal it as its underyling type.
		value := new(AliasTypeDeclaration)
		if err := json.Unmarshal(data, value); err != nil {
			return err
		}
		t.Alias = value
	case "object":
		// This type does not have an explicit union key, so we need to
		// unmarshal it as its underyling type.
		value := new(ObjectTypeDeclaration)
		if err := json.Unmarshal(data, value); err != nil {
			return err
		}
		t.Object = value
	}
	return nil
}

// TypeVisitor can visit all of the possible types available in the
// Type union.
type TypeVisitor interface {
	VisitAlias(*AliasTypeDeclaration) error
	VisitObject(*ObjectTypeDeclaration) error
}

// Accept accepts the visitor so that it can visit the union's value.
func (t *Type) Accept(v TypeVisitor) error {
	switch t.Type {
	case "alias":
		return v.VisitAlias(t.Alias)
	case "object":
		return v.VisitObject(t.Object)
	default:
		return fmt.Errorf("invalid type %s in %T", t.Type, t)
	}
}

// ObjectTypeDeclaration implements the Type interface.
type ObjectTypeDeclaration struct {
	Extends    []*DeclaredTypeName `json:"extends,omitempty"`
	Properties []*ObjectProperty   `json:"properties,omitempty"`
}

// ObjectProperty is a single property associated with an object.
type ObjectProperty struct {
	Docs         string            `json:"docs,omitempty"`
	Availability *Availability     `json:"availability,omitempty"`
	Name         *NameAndWireValue `json:"name,omitempty"`
	ValueType    *TypeReference    `json:"valueType,omitempty"`
}

// AliasTypeDeclaration is an alias type declaration.
type AliasTypeDeclaration struct {
	AliasOf      *TypeReference         `json:"aliasOf,omitempty"`
	ResolvedType *ResolvedTypeReference `json:"resolvedType,omitempty"`
}

// ResolvedTypeReference is a resolved type reference.
type ResolvedTypeReference struct {
	// TODO: Fill this in!
}

// ExampleType specifies an example of a particular type.
type ExampleType struct {
	Docs        string            `json:"docs,omitempty"`
	JSONExample any               `json:"jsonExample,omitempty"`
	Name        *Name             `json:"name,omitempty"`
	Shape       *ExampleTypeShape `json:"shape,omitempty"`
}

// ExampleTypeShape specifies the shape of an example type.
type ExampleTypeShape struct {
	Object *ExampleObjectType `json:"object,omitempty"` // TODO: This is actually flattened in the JSON representation - we need to customize the unmarshaler.
}

// ExampleTypeShapeObject implements the ExampleTypeShape interface.
type ExampleObjectType struct {
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
type TypeReference struct {
	Type      string
	Container *ContainerType
	Named     *DeclaredTypeName
	Primitive PrimitiveType
	Unknown   any
}

// TypeReferenceVisitor can visit all of the possible types available in the
// TypeReference union.
type TypeReferenceVisitor interface {
	VisitContainer(*ContainerType) error
	VisitNamed(*DeclaredTypeName) error
	VisitPrimitive(PrimitiveType) error
	VisitUnknown(any) error
}

// Accept accepts the visitor so that it can visit the union's value.
func (t *TypeReference) Accept(v TypeReferenceVisitor) error {
	switch t.Type {
	case "container":
		return v.VisitContainer(t.Container)
	case "named":
		return v.VisitNamed(t.Named)
	case "primitive":
		return v.VisitPrimitive(t.Primitive)
	case "unknown":
		return v.VisitUnknown(t.Unknown)
	default:
		return fmt.Errorf("invalid type %s in %T", t.Type, t)
	}
}

// UnmarshalJSON implement json.Unmarshaler.
func (t *TypeReference) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type      string         `json:"_type,omitempty"`
		Container *ContainerType `json:"container,omitempty"`
		Primitive PrimitiveType  `json:"primitive,omitempty"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	t.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "container":
		t.Container = unmarshaler.Container
	case "named":
		// This type does not have an explicit union key, so we need to
		// unmarshal it as its underyling type.
		value := new(DeclaredTypeName)
		if err := json.Unmarshal(data, value); err != nil {
			return err
		}
		t.Named = value
	case "primitive":
		t.Primitive = unmarshaler.Primitive
	case "unknown":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		// Remove the type that's already present at the top-level
		// because it's redundant.
		delete(value, "_type")
		t.Unknown = value
	}
	return nil
}

// ContainerType is a union of container types.
type ContainerType struct {
	Type     string
	List     *TypeReference
	Map      *MapType
	Optional *TypeReference
	Set      *TypeReference
	Literal  *Literal
}

// ContainerTypeVisitor can visit all of the possible types available in the
// ContainerType union.
type ContainerTypeVisitor interface {
	VisitList(*TypeReference) error
	VisitMap(*MapType) error
	VisitOptional(*TypeReference) error
	VisitSet(*TypeReference) error
	VisitLiteral(*Literal) error
}

// Accept accepts the visitor so that it can visit the union's value.
func (c *ContainerType) Accept(v ContainerTypeVisitor) error {
	switch c.Type {
	case "list":
		return v.VisitList(c.List)
	case "map":
		return v.VisitMap(c.Map)
	case "optional":
		return v.VisitOptional(c.Optional)
	case "set":
		return v.VisitSet(c.Set)
	case "literal":
		return v.VisitLiteral(c.Literal)
	default:
		return fmt.Errorf("invalid type %s in %T", c.Type, c)
	}
}

// UnmarshalJSON implement json.Unmarshaler.
func (c *ContainerType) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type     string         `json:"_type,omitempty"`
		List     *TypeReference `json:"list,omitempty"`
		Optional *TypeReference `json:"optional,omitempty"`
		Set      *TypeReference `json:"set,omitempty"`
		Literal  *Literal       `json:"literal,omitempty"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	c.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "list":
		c.List = unmarshaler.List
	case "map":
		value := new(MapType)
		if err := json.Unmarshal(data, value); err != nil {
			return err
		}
		c.Map = value
	case "optional":
		c.Optional = unmarshaler.Optional
	case "set":
		c.Set = unmarshaler.Set
	case "literal":
		c.Literal = unmarshaler.Literal
	}
	return nil
}

// MapType implements the map ContainerType.
type MapType struct {
	KeyType   *TypeReference `json:"keyType,omitempty"`
	ValueType *TypeReference `json:"valueType,omitempty"`
}

// Literal is a literal value.
type Literal struct {
	Type   string `json:"type,omitempty"`
	String string `json:"string,omitempty"`
}

// LiteralVisitor can visit all of the possible types available in the
// Literal union.
type LiteralVisitor interface {
	VisitString(string) error
}

// Accept accepts the visitor so that it can visit the union's value.
func (l *Literal) Accept(v LiteralVisitor) error {
	switch l.Type {
	case "string":
		return v.VisitString(l.String)
	default:
		return fmt.Errorf("invalid type %s in %T", l.Type, l)
	}
}

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
