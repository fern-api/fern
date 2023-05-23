package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ErrorDeclarationDiscriminantValue struct {
	Type       string
	Property   *NameAndWireValue
	StatusCode any
}

func (x *ErrorDeclarationDiscriminantValue) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "property":
		value := new(NameAndWireValue)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Property = value
	case "statusCode":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.StatusCode = value
	}
	return nil
}

type ErrorDeclarationDiscriminantValueVisitor interface {
	VisitProperty(*NameAndWireValue) error
	VisitStatusCode(any) error
}

func (x *ErrorDeclarationDiscriminantValue) Accept(v ErrorDeclarationDiscriminantValueVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "property":
		return v.VisitProperty(x.Property)
	case "statusCode":
		return v.VisitStatusCode(x.StatusCode)
	}
}
