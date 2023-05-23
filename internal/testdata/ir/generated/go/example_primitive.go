package ir

import (
	json "encoding/json"
	fmt "fmt"
	uuid "github.com/gofrs/uuid"
	time "time"
)

type ExamplePrimitive struct {
	Type     string
	Integer  int
	Double   float64
	String   string
	Boolean  bool
	Long     int64
	Datetime time.Time
	Date     time.Time
	Uuid     uuid.UUID
}

func (x *ExamplePrimitive) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "integer":
		var value int
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Integer = value
	case "double":
		var value float64
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Double = value
	case "string":
		var value string
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.String = value
	case "boolean":
		var value bool
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Boolean = value
	case "long":
		var value int64
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Long = value
	case "datetime":
		var value time.Time
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Datetime = value
	case "date":
		var value time.Time
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Date = value
	case "uuid":
		var value uuid.UUID
		if err := json.Unmarshal(data, &unmarshaler); err != nil {
			return err
		}
		x.Uuid = value
	}
	return nil
}

type ExamplePrimitiveVisitor interface {
	VisitInteger(int) error
	VisitDouble(float64) error
	VisitString(string) error
	VisitBoolean(bool) error
	VisitLong(int64) error
	VisitDatetime(time.Time) error
	VisitDate(time.Time) error
	VisitUuid(uuid.UUID) error
}

func (x *ExamplePrimitive) Accept(v ExamplePrimitiveVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "integer":
		return v.VisitInteger(x.Integer)
	case "double":
		return v.VisitDouble(x.Double)
	case "string":
		return v.VisitString(x.String)
	case "boolean":
		return v.VisitBoolean(x.Boolean)
	case "long":
		return v.VisitLong(x.Long)
	case "datetime":
		return v.VisitDatetime(x.Datetime)
	case "date":
		return v.VisitDate(x.Date)
	case "uuid":
		return v.VisitUuid(x.Uuid)
	}
}
