package ir

import (
	json "encoding/json"
	fmt "fmt"
	strconv "strconv"
)

type PrimitiveType uint8

const (
	PrimitiveTypeInteger PrimitiveType = iota + 1
	PrimitiveTypeDouble
	PrimitiveTypeString
	PrimitiveTypeBoolean
	// Within the range -2^53 to 2^53
	PrimitiveTypeLong
	PrimitiveTypeDateTime
	PrimitiveTypeDate
	PrimitiveTypeUuid
	PrimitiveTypeBase64
)

func (x PrimitiveType) String() string {
	switch x {
	default:
		return strconv.Itoa(int(x))
	case PrimitiveTypeInteger:
		return "INTEGER"
	case PrimitiveTypeDouble:
		return "DOUBLE"
	case PrimitiveTypeString:
		return "STRING"
	case PrimitiveTypeBoolean:
		return "BOOLEAN"
	case PrimitiveTypeLong:
		return "LONG"
	case PrimitiveTypeDateTime:
		return "DATE_TIME"
	case PrimitiveTypeDate:
		return "DATE"
	case PrimitiveTypeUuid:
		return "UUID"
	case PrimitiveTypeBase64:
		return "BASE_64"
	}
}

func (x PrimitiveType) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", x.String())), nil
}

func (x *PrimitiveType) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "INTEGER":
		value := PrimitiveTypeInteger
		*x = value
	case "DOUBLE":
		value := PrimitiveTypeDouble
		*x = value
	case "STRING":
		value := PrimitiveTypeString
		*x = value
	case "BOOLEAN":
		value := PrimitiveTypeBoolean
		*x = value
	case "LONG":
		value := PrimitiveTypeLong
		*x = value
	case "DATE_TIME":
		value := PrimitiveTypeDateTime
		*x = value
	case "DATE":
		value := PrimitiveTypeDate
		*x = value
	case "UUID":
		value := PrimitiveTypeUuid
		*x = value
	case "BASE_64":
		value := PrimitiveTypeBase64
		*x = value
	}
	return nil
}
