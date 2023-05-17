package types

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// TypeID uniquely identifies a type.
type TypeID string

// Availability defines an a status and a message.
type Availability struct {
	Status  AvailabilityStatus `json:"status,omitempty"`
	Message string             `json:"message,omitempty"`
}

// AvailabilityStatus represents an availability status.
type AvailabilityStatus uint8

// All of the supported auth requirements.
const (
	AvailabilityStatusInDevelopment AvailabilityStatus = iota + 1
	AvailabilityStatusPreRelease
	AvailabilityStatusGeneralAvailability
	AvailabilityStatusDeprecated
)

// String implements fmt.Stringer.
func (a AvailabilityStatus) String() string {
	switch a {
	case AvailabilityStatusInDevelopment:
		return "IN_DEVELOPMENT"
	case AvailabilityStatusPreRelease:
		return "PRE_RELEASE"
	case AvailabilityStatusGeneralAvailability:
		return "GENERAL_AVAILABILITY"
	case AvailabilityStatusDeprecated:
		return "DEPRECATED"
	default:
		return strconv.Itoa(int(a))
	}
}

// MarshalJSON implements json.Marshaler.
func (a AvailabilityStatus) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", a.String())), nil
}

// UnmarshalJSON implements json.Unmarshaler.
func (a *AvailabilityStatus) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "IN_DEVELOPMENT":
		value := AvailabilityStatusInDevelopment
		*a = value
	case "PRE_RELEASE":
		value := AvailabilityStatusPreRelease
		*a = value
	case "GENERAL_AVAILABILITY":
		value := AvailabilityStatusGeneralAvailability
		*a = value
	case "DEPRECATED":
		value := AvailabilityStatusDeprecated
		*a = value
	}
	return nil
}

// Name contains a variety of different naming conventions for
// a given identifier.
type Name struct {
	OriginalName       string          `json:"originalName,omitempty"`
	CamelCase          *SafeUnsafeName `json:"camelCase,omitempty"`
	SnakeCase          *SafeUnsafeName `json:"snakeCase,omitempty"`
	ScreamingSnakeCase *SafeUnsafeName `json:"screamingSnakeCase,omitempty"`
	PascalCase         *SafeUnsafeName `json:"pascalCase,omitempty"`
}

// SafeUnsafeName contains both the unsafe and safe name representation
// for a given identifier.
type SafeUnsafeName struct {
	SafeName   string `json:"safeName,omitempty"`
	UnsafeName string `json:"unsafeName,omitempty"`
}

// NameAndWireValue contains both the name and the wire value representation
// for a given identifier.
type NameAndWireValue struct {
	Name      *Name  `json:"name,omitempty"`
	WireValue string `json:"wireValue,omitempty"`
}

// FernFilepath identifies the location of a particular type.
type FernFilepath struct {
	AllParts    []*Name `json:"allParts,omitempty"`
	PackagePath []*Name `json:"packagePath,omitempty"`
	File        *Name   `json:"file,omitempty"`
}
