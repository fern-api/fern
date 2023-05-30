package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleRequestBody struct {
	Type               string
	InlinedRequestBody *ExampleInlinedRequestBody
	Reference          *ExampleTypeReference
}

func (x *ExampleRequestBody) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "inlinedRequestBody":
		value := new(ExampleInlinedRequestBody)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.InlinedRequestBody = value
	case "reference":
		value := new(ExampleTypeReference)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Reference = value
	}
	return nil
}

func (x ExampleRequestBody) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "inlinedRequestBody":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleInlinedRequestBody
		}{
			Type:                      x.Type,
			ExampleInlinedRequestBody: x.InlinedRequestBody,
		}
		return json.Marshal(marshaler)
	case "reference":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleTypeReference
		}{
			Type:                 x.Type,
			ExampleTypeReference: x.Reference,
		}
		return json.Marshal(marshaler)
	}
}

type ExampleRequestBodyVisitor interface {
	VisitInlinedRequestBody(*ExampleInlinedRequestBody) error
	VisitReference(*ExampleTypeReference) error
}

func (x *ExampleRequestBody) Accept(v ExampleRequestBodyVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "inlinedRequestBody":
		return v.VisitInlinedRequestBody(x.InlinedRequestBody)
	case "reference":
		return v.VisitReference(x.Reference)
	}
}
