package api

import (
	json "encoding/json"
	fmt "fmt"
)

type Docs struct {
	Docs string `json:"docs"`
}

type Json struct {
	Docs string `json:"docs"`
	Raw  string `json:"raw"`
}

type Type struct {
	Docs string `json:"docs"`
	Name string `json:"name"`
}

type NestedType struct {
	Docs string `json:"docs"`
	Raw  string `json:"raw"`
	Name string `json:"name"`
}

type Union struct {
	Type string
	Docs string
	One  *Type
}

func (x *Union) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
		Docs string `json:"docs"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	x.Docs = unmarshaler.Docs
	switch unmarshaler.Type {
	case "one":
		value := new(Type)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.One = value
	}
	return nil
}

type UnionVisitor interface {
	VisitOne(*Type) error
}

func (x *Union) Accept(v UnionVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "one":
		return v.VisitOne(x.One)
	}
}

type NestedUnion struct {
	Type string
	Docs string
	Raw  string
	One  *Type
}

func (x *NestedUnion) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
		Docs string `json:"docs"`
		Raw  string `json:"raw"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	x.Docs = unmarshaler.Docs
	x.Raw = unmarshaler.Raw
	switch unmarshaler.Type {
	case "one":
		value := new(Type)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.One = value
	}
	return nil
}

type NestedUnionVisitor interface {
	VisitOne(*Type) error
}

func (x *NestedUnion) Accept(v NestedUnionVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "one":
		return v.VisitOne(x.One)
	}
}
