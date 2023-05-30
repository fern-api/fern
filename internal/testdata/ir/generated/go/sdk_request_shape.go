package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type SdkRequestShape struct {
	Type            string
	JustRequestBody *HttpRequestBodyReference
	Wrapper         *SdkRequestWrapper
}

func (x *SdkRequestShape) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "justRequestBody":
		value := new(HttpRequestBodyReference)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.JustRequestBody = value
	case "wrapper":
		value := new(SdkRequestWrapper)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Wrapper = value
	}
	return nil
}

func (x SdkRequestShape) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "justRequestBody":
		var marshaler = struct {
			Type string `json:"type"`
			*HttpRequestBodyReference
		}{
			Type:                     x.Type,
			HttpRequestBodyReference: x.JustRequestBody,
		}
		return json.Marshal(marshaler)
	case "wrapper":
		var marshaler = struct {
			Type string `json:"type"`
			*SdkRequestWrapper
		}{
			Type:              x.Type,
			SdkRequestWrapper: x.Wrapper,
		}
		return json.Marshal(marshaler)
	}
}

type SdkRequestShapeVisitor interface {
	VisitJustRequestBody(*HttpRequestBodyReference) error
	VisitWrapper(*SdkRequestWrapper) error
}

func (x *SdkRequestShape) Accept(v SdkRequestShapeVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "justRequestBody":
		return v.VisitJustRequestBody(x.JustRequestBody)
	case "wrapper":
		return v.VisitWrapper(x.Wrapper)
	}
}
