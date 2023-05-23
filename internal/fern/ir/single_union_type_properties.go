package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type SingleUnionTypeProperties struct {
	PropertiesType         string
	SamePropertiesAsObject *DeclaredTypeName
	SingleProperty         *SingleUnionTypeProperty
	NoProperties           any
}

func (x *SingleUnionTypeProperties) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		PropertiesType string `json:"_type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.PropertiesType = unmarshaler.PropertiesType
	switch unmarshaler.PropertiesType {
	case "samePropertiesAsObject":
		value := new(DeclaredTypeName)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.SamePropertiesAsObject = value
	case "singleProperty":
		value := new(SingleUnionTypeProperty)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.SingleProperty = value
	case "noProperties":
		value := make(map[string]any)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.NoProperties = value
	}
	return nil
}

type SingleUnionTypePropertiesVisitor interface {
	VisitSamePropertiesAsObject(*DeclaredTypeName) error
	VisitSingleProperty(*SingleUnionTypeProperty) error
	VisitNoProperties(any) error
}

func (x *SingleUnionTypeProperties) Accept(v SingleUnionTypePropertiesVisitor) error {
	switch x.PropertiesType {
	default:
		return fmt.Errorf("invalid type %s in %T", x.PropertiesType, x)
	case "samePropertiesAsObject":
		return v.VisitSamePropertiesAsObject(x.SamePropertiesAsObject)
	case "singleProperty":
		return v.VisitSingleProperty(x.SingleProperty)
	case "noProperties":
		return v.VisitNoProperties(x.NoProperties)
	}
}
