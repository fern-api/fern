package api

import (
	json "encoding/json"
)

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
	case "bar":
	}
	return nil
}

type UnionWithUnknown struct {
	Type string
	Foo  *Foo
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
	case "unknown":
	}
	return nil
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
	case "bar":
	}
	return nil
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
	case "bar":
	}
	return nil
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
	case "string":
	}
	return nil
}
