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

func (x ExampleTypeShape) MarshalJSON() ([]byte, error) {
	switch x.Type {
	default:
		return nil, fmt.Errorf("invalid type %s in %T", x.Type, x)
	case "alias":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleAliasType
		}{
			Type:             x.Type,
			ExampleAliasType: x.Alias,
		}
		return json.Marshal(marshaler)
	case "enum":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleEnumType
		}{
			Type:            x.Type,
			ExampleEnumType: x.Enum,
		}
		return json.Marshal(marshaler)
	case "object":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleObjectType
		}{
			Type:              x.Type,
			ExampleObjectType: x.Object,
		}
		return json.Marshal(marshaler)
	case "union":
		var marshaler = struct {
			Type string `json:"type"`
			*ExampleSingleUnionType
		}{
			Type:                   x.Type,
			ExampleSingleUnionType: x.Union,
		}
		return json.Marshal(marshaler)
	}
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
