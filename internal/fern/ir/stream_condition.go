package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type StreamCondition struct {
	Type               string
	QueryParameterKey  string
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
