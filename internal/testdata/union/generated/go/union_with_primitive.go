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
		var valueUnmarshaler struct {
			Boolean bool `json:"value"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Boolean = valueUnmarshaler.Boolean
	case "string":
		var valueUnmarshaler struct {
			String string `json:"value"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.String = valueUnmarshaler.String
	}
	return nil
}

func (x UnionWithPrimitive) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "boolean":
		var marshaler = struct {
			Type    string `json:"type"`
			Boolean bool   `json:"value"`
		}{
			Type:    x.Type,
			Boolean: x.Boolean,
		}
		return json.Marshal(marshaler)
	case "string":
		var marshaler = struct {
			Type   string `json:"type"`
			String string `json:"value"`
		}{
			Type:   x.Type,
			String: x.String,
		}
		return json.Marshal(marshaler)
	}
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
