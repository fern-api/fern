package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type Literal struct {
	Type   string
	String string
}

func (x *Literal) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type   string `json:"type"`
		String string `json:"string"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "string":
		x.String = unmarshaler.String
	}
	return nil
}

type LiteralVisitor interface {
	VisitString(string) error
}

func (x *Literal) Accept(v LiteralVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "string":
		return v.VisitString(x.String)
	}
}
