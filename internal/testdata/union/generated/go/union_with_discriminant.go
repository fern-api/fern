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
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "foo":
		var valueUnmarshaler struct {
			Foo *Foo `json:"foo"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Foo = valueUnmarshaler.Foo
	case "bar":
		var valueUnmarshaler struct {
			Bar *Bar `json:"bar"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Bar = valueUnmarshaler.Bar
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
