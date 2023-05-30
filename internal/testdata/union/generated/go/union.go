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

func (x Union) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "foo":
		var marshaler = struct {
			Type string `json:"type"`
			Foo  *Foo   `json:"foo"`
		}{
			Type: x.Type,
			Foo:  x.Foo,
		}
		return json.Marshal(marshaler)
	case "bar":
		var marshaler = struct {
			Type string `json:"type"`
			Bar  *Bar   `json:"bar"`
		}{
			Type: x.Type,
			Bar:  x.Bar,
		}
		return json.Marshal(marshaler)
	}
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
