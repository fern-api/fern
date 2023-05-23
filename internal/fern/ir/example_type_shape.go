package ir

import (
	json "encoding/json"
	fmt "fmt"
)

type ExampleTypeShape struct {
	Type   string
	Alias  *ExampleAliasType
	Enum   *ExampleEnumType
	Object *ExampleObjectType
	Union  *ExampleSingleUnionType
}

func (x *ExampleTypeShape) UnmarshalJSON(data []byte) error {
	var unmarshaler struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &unmarshaler); err != nil {
		return err
	}
	x.Type = unmarshaler.Type
	switch unmarshaler.Type {
	case "alias":
		value := new(ExampleAliasType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Alias = value
	case "enum":
		value := new(ExampleEnumType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Enum = value
	case "object":
		value := new(ExampleObjectType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Object = value
	case "union":
		value := new(ExampleSingleUnionType)
		if err := json.Unmarshal(data, &value); err != nil {
			return err
		}
		x.Union = value
	}
	return nil
}

type ExampleTypeShapeVisitor interface {
	VisitAlias(*ExampleAliasType) error
	VisitEnum(*ExampleEnumType) error
	VisitObject(*ExampleObjectType) error
	VisitUnion(*ExampleSingleUnionType) error
}

func (x *ExampleTypeShape) Accept(v ExampleTypeShapeVisitor) error {
	switch x.Type {
	default:
		return fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "alias":
		return v.VisitAlias(x.Alias)
	case "enum":
		return v.VisitEnum(x.Enum)
	case "object":
		return v.VisitObject(x.Object)
	case "union":
		return v.VisitUnion(x.Union)
	}
}
