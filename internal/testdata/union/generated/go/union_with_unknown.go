package api

import (
	json "encoding/json"
	fmt "fmt"
)

type UnionWithUnknown struct {
	Type    string
	Foo     *Foo
	Unknown any
}

func (x *UnionWithUnknown) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "foo":
		value := new(Foo)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Foo = value
	case "unknown":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Unknown = value
	}
	return nil
}

type UnionWithUnknownVisitor interface {
	VisitFoo(*Foo) error
	VisitUnknown(any) error
}

func (x *UnionWithUnknown) Accept(v UnionWithUnknownVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "foo":
		return v.VisitFoo(x.Foo)
	case "unknown":
		return v.VisitUnknown(x.Unknown)
	}
}
