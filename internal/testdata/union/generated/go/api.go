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
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Foo = value
	case "unknown":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
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

type Foo struct {
	Name string `json:"name"`
}

type Bar struct {
	Name string `json:"name"`
}

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
		value := new(Foo)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Foo = value
	case "bar":
		value := new(Bar)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Bar = value
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
		value := new(Foo)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Foo = value
	case "bar":
		value := new(Bar)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Bar = value
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

type UnionWithoutKey struct {
	Type string
	Foo  *Foo
	Bar  *Bar
}

func (x *UnionWithoutKey) UnmarshalJSON(data []byte) error {
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
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Foo = value
	case "bar":
		value := new(Bar)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Bar = value
	}
	return nil
}

type UnionWithoutKeyVisitor interface {
	VisitFoo(*Foo) error
	VisitBar(*Bar) error
}

func (x *UnionWithoutKey) Accept(v UnionWithoutKeyVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "foo":
		return v.VisitFoo(x.Foo)
	case "bar":
		return v.VisitBar(x.Bar)
	}
}
