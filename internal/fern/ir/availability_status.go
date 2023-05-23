package ir

import (
	json "encoding/json"
	fmt "fmt"
	strconv "strconv"
)

type AvailabilityStatus uint8

const (
	AvailabilityStatusInDevelopment AvailabilityStatus = iota + 1
	AvailabilityStatusPreRelease
	AvailabilityStatusGeneralAvailability
	AvailabilityStatusDeprecated
)

func (x AvailabilityStatus) String() string {
	switch x {
	default:
		return strconv.Itoa(int(x))
	case AvailabilityStatusInDevelopment:
		return "IN_DEVELOPMENT"
	case AvailabilityStatusPreRelease:
		return "PRE_RELEASE"
	case AvailabilityStatusGeneralAvailability:
		return "GENERAL_AVAILABILITY"
	case AvailabilityStatusDeprecated:
		return "DEPRECATED"
	}
}

func (x AvailabilityStatus) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf("%q", x.String())), nil
}

func (x *AvailabilityStatus) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	switch raw {
	case "IN_DEVELOPMENT":
		value := AvailabilityStatusInDevelopment
		*x = value
	case "PRE_RELEASE":
		value := AvailabilityStatusPreRelease
		*x = value
	case "GENERAL_AVAILABILITY":
		value := AvailabilityStatusGeneralAvailability
		*x = value
	case "DEPRECATED":
		value := AvailabilityStatusDeprecated
		*x = value
	}
	return nil
}
