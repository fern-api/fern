package api

import (
	json "encoding/json"
	fmt "fmt"
)

type Union struct {
	Type string
	Foo  *Foo
	Bar  *Bar
}

func (x *Union) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
		Foo  *Foo   `json:"foo"`
		Bar  *Bar   `json:"bar"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "foo":
		x.Foo = unmarshaler.Foo
	case "bar":
		x.Bar = unmarshaler.Bar
	}
	return nil
}

type UnionVisitor interface {
	VisitFoo(*Foo) error
	VisitBar(*Bar) error
}

func (x *Union) Accept(v UnionVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "foo":
		return v.VisitFoo(x.Foo)
	case "bar":
		return v.VisitBar(x.Bar)
	}
}
