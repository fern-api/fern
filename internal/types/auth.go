package types

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// AuthRequirement defines an auth requirement.
type AuthRequirement uint8

// All of the supported auth requirements.
const (
	AuthRequirementAll AuthRequirement = iota + 1
	AuthRequirementAny
)

// String implements fmt.Stringer.
func (a AuthRequirement) String() string {
	switch a {
	case AuthRequirementAll:
		return "ALL"
	case AuthRequirementAny:
		return "ANY"
	default:
		return strconv.Itoa(int(a))
	}
}

// MarshalJSON implements json.Marshaler.
func (a AuthRequirement) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", a.String())), nil
}

// UnmarshalJSON implements json.Unmarshaler.
func (a *AuthRequirement) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "ALL":
		value := AuthRequirementAll
		*a = value
	case "ANY":
		value := AuthRequirementAny
		*a = value
	}
	return nil
}

// APIAuth represents the API auth configuration.
type APIAuth struct {
	Docs        string          `json:"docs,omitempty"`
	Requirement AuthRequirement `json:"requirement,omitempty"`

	// TODO: Schemes     []AuthScheme    `json:"schemes,omitempty"`
}
