package api

import (
	json "encoding/json"
	fmt "fmt"
)

type UnionWithDiscriminant struct {
	Type string
	Foo  *Foo
	Bar  *Bar
}

func (x *UnionWithDiscriminant) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
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

type UnionWithDiscriminantVisitor interface {
	VisitFoo(*Foo) error
	VisitBar(*Bar) error
}

func (x *UnionWithDiscriminant) Accept(v UnionWithDiscriminantVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "foo":
		return v.VisitFoo(x.Foo)
	case "bar":
		return v.VisitBar(x.Bar)
	}
}
