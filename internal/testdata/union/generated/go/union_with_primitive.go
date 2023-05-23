package api

import (
	json "encoding/json"
	fmt "fmt"
)

type UnionWithPrimitive struct {
	Type    string
	Boolean bool
	String  string
}

func (x *UnionWithPrimitive) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "boolean":
		var value bool
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Boolean = value
	case "string":
		var value string
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.String = value
	}
	return nil
}

type UnionWithPrimitiveVisitor interface {
	VisitBoolean(bool) error
	VisitString(string) error
}

func (x *UnionWithPrimitive) Accept(v UnionWithPrimitiveVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "boolean":
		return v.VisitBoolean(x.Boolean)
	case "string":
		return v.VisitString(x.String)
	}
}
