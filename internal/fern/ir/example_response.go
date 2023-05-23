package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleResponse struct {
	Type  string
	Ok    *ExampleEndpointSuccessResponse
	Error *ExampleEndpointErrorResponse
}

func (x *ExampleResponse) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "ok":
		value := new(ExampleEndpointSuccessResponse)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Ok = value
	case "error":
		value := new(ExampleEndpointErrorResponse)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Error = value
	}
	return nil
}

type ExampleResponseVisitor interface {
	VisitOk(*ExampleEndpointSuccessResponse) error
	VisitError(*ExampleEndpointErrorResponse) error
}

func (x *ExampleResponse) Accept(v ExampleResponseVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "ok":
		return v.VisitOk(x.Ok)
	case "error":
		return v.VisitError(x.Error)
	}
}
