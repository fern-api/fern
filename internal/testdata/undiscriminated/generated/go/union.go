package api

import (
	json "encoding/json"
	fmt "fmt"
)

type Union struct {
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
		x.Foo = Foo
		return nil
	}
	Bar := new(Bar)
	if err := json.Unmarshal(data, &Bar); err == nil {
		x.Bar = Bar
		return nil
	}
	Baz := new(Baz)
	if err := json.Unmarshal(data, &Baz); err == nil {
		x.Baz = Baz
		return nil
	}
	var String string
	if err := json.Unmarshal(data, &String); err == nil {
		x.String = String
		return nil
	}
	var IntegerOptional *int
	if err := json.Unmarshal(data, &IntegerOptional); err == nil {
		x.IntegerOptional = IntegerOptional
		return nil
	}
	var StringBooleanMap map[string]bool
	if err := json.Unmarshal(data, &StringBooleanMap); err == nil {
		x.StringBooleanMap = StringBooleanMap
		return nil
	}
	var StringList []string
	if err := json.Unmarshal(data, &StringList); err == nil {
		x.StringList = StringList
		return nil
	}
	var StringListList [][]string
	if err := json.Unmarshal(data, &StringListList); err == nil {
		x.StringListList = StringListList
		return nil
	}
	var DoubleSet []float64
	if err := json.Unmarshal(data, &DoubleSet); err == nil {
		x.DoubleSet = DoubleSet
		return nil
	}
	return fmt.Errorf("%s cannot be deserialized as a %T", data, x)
}
