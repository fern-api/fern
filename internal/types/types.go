package types

import (
	"encoding/json"
	"strconv"
)

// TypeReference is a reference to a generic type (e.g. primitives,
// containers, etc).
type TypeReference interface {
	isTypeReference()
}

// TypeReferencePrimitive is the primitive TypeReference.
type TypeReferencePrimitive struct {
	Type      string         `json:"_type,omitempty"`
	Primitive *PrimitiveType `json:"primitive,omitempty"`
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
func (p *PrimitiveType) String() string {
	if p == nil {
		return ""
	}
	switch *p {
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
		return strconv.Itoa(int(*p))
	}
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
		p = &value
	case "DOUBLE":
		value := PrimitiveTypeDouble
		p = &value
	case "STRING":
		value := PrimitiveTypeString
		p = &value
	case "BOOLEAN":
		value := PrimitiveTypeBoolean
		p = &value
	case "LONG":
		value := PrimitiveTypeLong
		p = &value
	case "DATE_TIME":
		value := PrimitiveTypeDateTime
		p = &value
	case "DATE":
		value := PrimitiveTypeDate
		p = &value
	case "UUID":
		value := PrimitiveTypeUUID
		p = &value
	case "BASE_64":
		value := PrimitiveTypeBase64
		p = &value
	}
	return nil
}
