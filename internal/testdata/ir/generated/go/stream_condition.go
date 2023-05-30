package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type StreamCondition struct {
	Type string
	// The name of a boolean query parameter. If it is true, the response
	// should be streamed. Otherwise, it should not be streamed.
	QueryParameterKey string
	// The name of a boolean property on the request. If it is true, the response
	// should be streamed. Otherwise, it should not be streamed.
	RequestPropertyKey string
}

func (x *StreamCondition) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "queryParameterKey":
		var valueUnmarshaler struct {
			QueryParameterKey string `json:"value"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.QueryParameterKey = valueUnmarshaler.QueryParameterKey
	case "requestPropertyKey":
		var valueUnmarshaler struct {
			RequestPropertyKey string `json:"value"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.RequestPropertyKey = valueUnmarshaler.RequestPropertyKey
	}
	return nil
}

func (x StreamCondition) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "queryParameterKey":
		var marshaler = struct {
			Type              string `json:"type"`
			QueryParameterKey string `json:"value"`
		}{
			Type:              x.Type,
			QueryParameterKey: x.QueryParameterKey,
		}
		return json.Marshal(marshaler)
	case "requestPropertyKey":
		var marshaler = struct {
			Type               string `json:"type"`
			RequestPropertyKey string `json:"value"`
		}{
			Type:               x.Type,
			RequestPropertyKey: x.RequestPropertyKey,
		}
		return json.Marshal(marshaler)
	}
}

type StreamConditionVisitor interface {
	VisitQueryParameterKey(string) error
	VisitRequestPropertyKey(string) error
}

func (x *StreamCondition) Accept(v StreamConditionVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "queryParameterKey":
		return v.VisitQueryParameterKey(x.QueryParameterKey)
	case "requestPropertyKey":
		return v.VisitRequestPropertyKey(x.RequestPropertyKey)
	}
}
