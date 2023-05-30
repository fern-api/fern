package api

import (
	json "encoding/json"
	fmt "fmt"
	strconv "strconv"
)

type Enum uint8

const (
	// The first enum value.
	EnumOne Enum = iota + 1
	EnumTwo
	EnumThree
)

func (x Enum) String() string {
	switch x {
	default:
		return strconv.Itoa(int(x))
	case EnumOne:
		return "ONE"
	case EnumTwo:
		return "TWO"
	case EnumThree:
		return "THREE"
	}
}

func (x Enum) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", x.String())), nil
}

func (x *Enum) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "ONE":
		value := EnumOne
		*x = value
	case "TWO":
		value := EnumTwo
		*x = value
	case "THREE":
		value := EnumThree
		*x = value
	}
	return nil
}
