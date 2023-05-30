package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ErrorDiscriminationStrategy struct {
	Type       string
	StatusCode any
	Property   *ErrorDiscriminationByPropertyStrategy
}

func (x *ErrorDiscriminationStrategy) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "statusCode":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.StatusCode = value
	case "property":
		value := new(ErrorDiscriminationByPropertyStrategy)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Property = value
	}
	return nil
}

func (x ErrorDiscriminationStrategy) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "statusCode":
		var marshaler = struct {
			Type       string `json:"type"`
			StatusCode any    `json:"statusCode"`
		}{
			Type:       x.Type,
			StatusCode: x.StatusCode,
		}
		return json.Marshal(marshaler)
	case "property":
		var marshaler = struct {
			Type string `json:"type"`
			*ErrorDiscriminationByPropertyStrategy
		}{
			Type:                                  x.Type,
			ErrorDiscriminationByPropertyStrategy: x.Property,
		}
		return json.Marshal(marshaler)
	}
}

type ErrorDiscriminationStrategyVisitor interface {
	VisitStatusCode(any) error
	VisitProperty(*ErrorDiscriminationByPropertyStrategy) error
}

func (x *ErrorDiscriminationStrategy) Accept(v ErrorDiscriminationStrategyVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "statusCode":
		return v.VisitStatusCode(x.StatusCode)
	case "property":
		return v.VisitProperty(x.Property)
	}
}
