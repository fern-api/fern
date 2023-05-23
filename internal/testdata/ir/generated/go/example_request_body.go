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
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.InlinedRequestBody = value
	case "reference":
		value := new(ExampleTypeReference)
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Reference = value
	}
	return nil
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
