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
	Schemes     []AuthScheme    `json:"schemes,omitempty"`
}

// AuthScheme represents a union of auth schemes.
type AuthScheme interface {
	isAuthScheme()
}

// AuthSchemeBearer is the bearer AuthScheme.
type AuthSchemeBearer struct {
	Type  string `json:"_type,omitempty"`
	Docs  string `json:"docs,omitempty"`
	Token *Name  `json:"token,omitempty"`
}

func (*AuthSchemeBearer) isAuthScheme() {}

// AuthSchemeBasic is the basic AuthScheme.
type AuthSchemeBasic struct {
	Type     string `json:"_type,omitempty"`
	Docs     string `json:"docs,omitempty"`
	Username *Name  `json:"username,omitempty"`
	Password *Name  `json:"password,omitempty"`
}

func (*AuthSchemeBasic) isAuthScheme() {}

// AuthSchemeHeader is the header AuthScheme.
type AuthSchemeHeader struct {
	Type             string            `json:"_type,omitempty"`
	Docs             string            `json:"docs,omitempty"`
	NameAndWireValue *NameAndWireValue `json:"nameAndWireValue,omitempty"`

	// TODO: Add the rest of the valid TypeReferences (only primitive is supported so far).
	ValueType TypeReference `json:"valueType,omitempty"`
	Prefix    string        `json:"prefix,omitempty"`
}

func (*AuthSchemeHeader) isAuthScheme() {}
