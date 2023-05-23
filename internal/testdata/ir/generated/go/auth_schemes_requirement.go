package ir

import (
	json "encoding/json"
	fmt "fmt"
	strconv "strconv"
)

type AuthSchemesRequirement uint8

const (
	AuthSchemesRequirementAll AuthSchemesRequirement = iota + 1
	AuthSchemesRequirementAny
)

func (x AuthSchemesRequirement) String() string {
	switch x {
	default:
		return strconv.Itoa(int(x))
	case AuthSchemesRequirementAll:
		return "ALL"
	case AuthSchemesRequirementAny:
		return "ANY"
	}
}

func (x AuthSchemesRequirement) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", x.String())), nil
}

func (x *AuthSchemesRequirement) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "ALL":
		value := AuthSchemesRequirementAll
		*x = value
	case "ANY":
		value := AuthSchemesRequirementAny
		*x = value
	}
	return nil
}
