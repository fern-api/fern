package api

import (
	json "encoding/json"
	fmt "fmt"
)

type Union struct {
	typeName         string
	Foo              *Foo
	Bar              *Bar
	Baz              *Baz
	String           string
	IntegerOptional  *int
	StringBooleanMap map[string]bool
	StringList       []string
	StringListList   [][]string
	DoubleSet        []float64
}

func (x *Union) UnmarshalJSON(data []byte) error {
	Foo := new(Foo)
	if err := json.Unmarshal(data, &Foo); err == nil {
		x.typeName = "Foo"
		x.Foo = Foo
		return nil
	}
	Bar := new(Bar)
	if err := json.Unmarshal(data, &Bar); err == nil {
		x.typeName = "Bar"
		x.Bar = Bar
		return nil
	}
	Baz := new(Baz)
	if err := json.Unmarshal(data, &Baz); err == nil {
		x.typeName = "Baz"
		x.Baz = Baz
		return nil
	}
	var String string
	if err := json.Unmarshal(data, &String); err == nil {
		x.typeName = "String"
		x.String = String
		return nil
	}
	var IntegerOptional *int
	if err := json.Unmarshal(data, &IntegerOptional); err == nil {
		x.typeName = "IntegerOptional"
		x.IntegerOptional = IntegerOptional
		return nil
	}
	var StringBooleanMap map[string]bool
	if err := json.Unmarshal(data, &StringBooleanMap); err == nil {
		x.typeName = "StringBooleanMap"
		x.StringBooleanMap = StringBooleanMap
		return nil
	}
	var StringList []string
	if err := json.Unmarshal(data, &StringList); err == nil {
		x.typeName = "StringList"
		x.StringList = StringList
		return nil
	}
	var StringListList [][]string
	if err := json.Unmarshal(data, &StringListList); err == nil {
		x.typeName = "StringListList"
		x.StringListList = StringListList
		return nil
	}
	var DoubleSet []float64
	if err := json.Unmarshal(data, &DoubleSet); err == nil {
		x.typeName = "DoubleSet"
		x.DoubleSet = DoubleSet
		return nil
	}
	return fmt.Errorf("%s cannot be deserialized as a %T", data, x)
}

type UnionVisitor interface {
	VisitFoo(*Foo) error
	VisitBar(*Bar) error
	VisitBaz(*Baz) error
	VisitString(string) error
	VisitIntegerOptional(*int) error
	VisitStringBooleanMap(map[string]bool) error
	VisitStringList([]string) error
	VisitStringListList([][]string) error
	VisitDoubleSet([]float64) error
}

func (x *Union) Accept(v UnionVisitor) error {
	switch x.typeName {
	default:
		return fmt.Errorf("invalid type %s in %T", x.typeName, x)
	case "Foo":
		return v.VisitFoo(x.Foo)
	case "Bar":
		return v.VisitBar(x.Bar)
	case "Baz":
		return v.VisitBaz(x.Baz)
	case "String":
		return v.VisitString(x.String)
	case "IntegerOptional":
		return v.VisitIntegerOptional(x.IntegerOptional)
	case "StringBooleanMap":
		return v.VisitStringBooleanMap(x.StringBooleanMap)
	case "StringList":
		return v.VisitStringList(x.StringList)
	case "StringListList":
		return v.VisitStringListList(x.StringListList)
	case "DoubleSet":
		return v.VisitDoubleSet(x.DoubleSet)
	}
}
