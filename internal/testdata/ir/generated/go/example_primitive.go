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
		var valueUnmarshaler struct {
			Integer int `json:"integer"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Integer = valueUnmarshaler.Integer
	case "double":
		var valueUnmarshaler struct {
			Double float64 `json:"double"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Double = valueUnmarshaler.Double
	case "string":
		var valueUnmarshaler struct {
			String string `json:"string"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.String = valueUnmarshaler.String
	case "boolean":
		var valueUnmarshaler struct {
			Boolean bool `json:"boolean"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Boolean = valueUnmarshaler.Boolean
	case "long":
		var valueUnmarshaler struct {
			Long int64 `json:"long"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Long = valueUnmarshaler.Long
	case "datetime":
		var valueUnmarshaler struct {
			Datetime time.Time `json:"datetime"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Datetime = valueUnmarshaler.Datetime
	case "date":
		var valueUnmarshaler struct {
			Date time.Time `json:"date"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Date = valueUnmarshaler.Date
	case "uuid":
		var valueUnmarshaler struct {
			Uuid uuid.UUID `json:"uuid"`
		}
		if err := json.Unmarshal(data, &valueUnmarshaler); err != nil {
			return err
		}
		x.Uuid = valueUnmarshaler.Uuid
	}
	return nil
}

func (x ExamplePrimitive) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "integer":
		var marshaler = struct {
			Type    string `json:"type"`
			Integer int    `json:"integer"`
		}{
			Type:    x.Type,
			Integer: x.Integer,
		}
		return json.Marshal(marshaler)
	case "double":
		var marshaler = struct {
			Type   string  `json:"type"`
			Double float64 `json:"double"`
		}{
			Type:   x.Type,
			Double: x.Double,
		}
		return json.Marshal(marshaler)
	case "string":
		var marshaler = struct {
			Type   string `json:"type"`
			String string `json:"string"`
		}{
			Type:   x.Type,
			String: x.String,
		}
		return json.Marshal(marshaler)
	case "boolean":
		var marshaler = struct {
			Type    string `json:"type"`
			Boolean bool   `json:"boolean"`
		}{
			Type:    x.Type,
			Boolean: x.Boolean,
		}
		return json.Marshal(marshaler)
	case "long":
		var marshaler = struct {
			Type string `json:"type"`
			Long int64  `json:"long"`
		}{
			Type: x.Type,
			Long: x.Long,
		}
		return json.Marshal(marshaler)
	case "datetime":
		var marshaler = struct {
			Type     string    `json:"type"`
			Datetime time.Time `json:"datetime"`
		}{
			Type:     x.Type,
			Datetime: x.Datetime,
		}
		return json.Marshal(marshaler)
	case "date":
		var marshaler = struct {
			Type string    `json:"type"`
			Date time.Time `json:"date"`
		}{
			Type: x.Type,
			Date: x.Date,
		}
		return json.Marshal(marshaler)
	case "uuid":
		var marshaler = struct {
			Type string    `json:"type"`
			Uuid uuid.UUID `json:"uuid"`
		}{
			Type: x.Type,
			Uuid: x.Uuid,
		}
		return json.Marshal(marshaler)
	}
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
