package generatorexec

import (
	json "encoding/json"
	fmt "fmt"
)

type ExitStatusUpdate struct {
	Type       string
	Successful *SuccessfulStatusUpdate
	Error      *ErrorExitStatusUpdate
}

func (x *ExitStatusUpdate) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "successful":
		value := new(SuccessfulStatusUpdate)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Successful = value
	case "error":
		value := new(ErrorExitStatusUpdate)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Error = value
	}
	return nil
}

type ExitStatusUpdateVisitor interface {
	VisitSuccessful(*SuccessfulStatusUpdate) error
	VisitError(*ErrorExitStatusUpdate) error
}

func (x *ExitStatusUpdate) Accept(v ExitStatusUpdateVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "successful":
		return v.VisitSuccessful(x.Successful)
	case "error":
		return v.VisitError(x.Error)
	}
}
