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
		Type     string    `json:"type"`
		Integer  int       `json:"integer"`
		Double   float64   `json:"double"`
		String   string    `json:"string"`
		Boolean  bool      `json:"boolean"`
		Long     int64     `json:"long"`
		Datetime time.Time `json:"datetime"`
		Date     time.Time `json:"date"`
		Uuid     uuid.UUID `json:"uuid"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "integer":
		x.Integer = unmarshaler.Integer
	case "double":
		x.Double = unmarshaler.Double
	case "string":
		x.String = unmarshaler.String
	case "boolean":
		x.Boolean = unmarshaler.Boolean
	case "long":
		x.Long = unmarshaler.Long
	case "datetime":
		x.Datetime = unmarshaler.Datetime
	case "date":
		x.Date = unmarshaler.Date
	case "uuid":
		x.Uuid = unmarshaler.Uuid
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
