package internal

import (
	"encoding/json"
	"fmt"
	"time"
)

const dateFormat = "2006-01-02"

// DateTime wraps time.Time and adapts its JSON representation
// to conform to a RFC3339 date (e.g. 2006-01-02).
//
// Ref: https://ijmacd.github.io/rfc3339-iso8601
type Date struct {
	t *time.Time
}

// NewDate returns a new *Date. If the given time.Time
// is nil, nil will be returned.
func NewDate(t time.Time) *Date {
	return &Date{t: &t}
}

// NewOptionalDate returns a new *Date. If the given time.Time
// is nil, nil will be returned.
func NewOptionalDate(t *time.Time) *Date {
	if t == nil {
		return nil
	}
	return &Date{t: t}
}

// Time returns the Date's underlying time, if any. If the
// date is nil, the zero value is returned.
func (d *Date) Time() time.Time {
	if d == nil || d.t == nil {
		return time.Time{}
	}
	return *d.t
}

// TimePtr returns a pointer to the Date's underlying time.Time, if any.
func (d *Date) TimePtr() *time.Time {
	if d == nil || d.t == nil {
		return nil
	}
	if d.t.IsZero() {
		return nil
	}
	return d.t
}

func (d *Date) MarshalJSON() ([]byte, error) {
	if d == nil || d.t == nil {
		return nil, nil
	}
	return json.Marshal(d.t.Format(dateFormat))
}

func (d *Date) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	parsedTime, err := time.Parse(dateFormat, raw)
	if err != nil {
		return err
	}

	*d = Date{t: &parsedTime}
	return nil
}

// NewDateList returns a slice of *Date for the given times. If the given
// slice is nil, nil will be returned.
func NewDateList(times []time.Time) []*Date {
	if times == nil {
		return nil
	}
	dates := make([]*Date, 0, len(times))
	for _, t := range times {
		dates = append(dates, NewDate(t))
	}
	return dates
}

// NewDateMap returns a map of *Date for the given times. If the given
// map is nil, nil will be returned.
func NewDateMap(times map[string]time.Time) map[string]*Date {
	if times == nil {
		return nil
	}
	dates := make(map[string]*Date, len(times))
	for key, t := range times {
		dates[key] = NewDate(t)
	}
	return dates
}

// TimesFromDateList returns the underlying times of the given dates. If the
// given slice is nil, nil will be returned.
func TimesFromDateList(dates []*Date) []time.Time {
	if dates == nil {
		return nil
	}
	times := make([]time.Time, 0, len(dates))
	for _, date := range dates {
		times = append(times, date.Time())
	}
	return times
}

// TimesFromDateMap returns the underlying times of the given dates. If the
// given map is nil, nil will be returned.
func TimesFromDateMap(dates map[string]*Date) map[string]time.Time {
	if dates == nil {
		return nil
	}
	times := make(map[string]time.Time, len(dates))
	for key, date := range dates {
		times[key] = date.Time()
	}
	return times
}

// NewDateListFromPtr returns a slice of *Date for the given times. If the
// given pointer is nil, nil will be returned.
func NewDateListFromPtr(times *[]time.Time) []*Date {
	if times == nil {
		return nil
	}
	return NewDateList(*times)
}

// NewDateMapFromPtr returns a map of *Date for the given times. If the given
// pointer is nil, nil will be returned.
func NewDateMapFromPtr(times *map[string]time.Time) map[string]*Date {
	if times == nil {
		return nil
	}
	return NewDateMap(*times)
}

// TimesPtrFromDateList returns a pointer to the underlying times of the given
// dates. If the given slice is nil, nil will be returned.
func TimesPtrFromDateList(dates []*Date) *[]time.Time {
	if dates == nil {
		return nil
	}
	times := TimesFromDateList(dates)
	return &times
}

// TimesPtrFromDateMap returns a pointer to the underlying times of the given
// dates. If the given map is nil, nil will be returned.
func TimesPtrFromDateMap(dates map[string]*Date) *map[string]time.Time {
	if dates == nil {
		return nil
	}
	times := TimesFromDateMap(dates)
	return &times
}

// DateTime wraps time.Time and adapts its JSON representation
// to conform to a RFC3339 date-time (e.g. 2017-07-21T17:32:28Z).
//
// Ref: https://ijmacd.github.io/rfc3339-iso8601
type DateTime struct {
	t *time.Time
}

// NewDateTime returns a new *DateTime.
func NewDateTime(t time.Time) *DateTime {
	return &DateTime{t: &t}
}

// NewOptionalDateTime returns a new *DateTime. If the given time.Time
// is nil, nil will be returned.
func NewOptionalDateTime(t *time.Time) *DateTime {
	if t == nil {
		return nil
	}
	return &DateTime{t: t}
}

// Time returns the DateTime's underlying time, if any. If the
// date-time is nil, the zero value is returned.
func (d *DateTime) Time() time.Time {
	if d == nil || d.t == nil {
		return time.Time{}
	}
	return *d.t
}

// TimePtr returns a pointer to the DateTime's underlying time.Time, if any.
func (d *DateTime) TimePtr() *time.Time {
	if d == nil || d.t == nil {
		return nil
	}
	if d.t.IsZero() {
		return nil
	}
	return d.t
}

func (d *DateTime) MarshalJSON() ([]byte, error) {
	if d == nil || d.t == nil {
		return nil, nil
	}
	return json.Marshal(d.t.Format(time.RFC3339))
}

func (d *DateTime) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		// If the value is not a string, check if it is a number (unix epoch seconds).
		var epoch int64
		if numErr := json.Unmarshal(data, &epoch); numErr == nil {
			t := time.Unix(epoch, 0).UTC()
			*d = DateTime{t: &t}
			return nil
		}
		return err
	}

	// Try RFC3339Nano first (superset of RFC3339, supports fractional seconds).
	parsedTime, err := time.Parse(time.RFC3339Nano, raw)
	if err == nil {
		*d = DateTime{t: &parsedTime}
		return nil
	}
	rfc3339NanoErr := err

	// Fall back to ISO 8601 with fractional seconds, without timezone (assume UTC).
	parsedTime, err = time.Parse("2006-01-02T15:04:05.999999999", raw)
	if err == nil {
		parsedTime = parsedTime.UTC()
		*d = DateTime{t: &parsedTime}
		return nil
	}

	// Fall back to ISO 8601 without timezone (assume UTC).
	parsedTime, err = time.Parse("2006-01-02T15:04:05", raw)
	if err == nil {
		parsedTime = parsedTime.UTC()
		*d = DateTime{t: &parsedTime}
		return nil
	}
	iso8601Err := err

	// Fall back to space-separated datetime with fractional seconds and timezone offset.
	parsedTime, err = time.Parse("2006-01-02 15:04:05.999999999Z07:00", raw)
	if err == nil {
		*d = DateTime{t: &parsedTime}
		return nil
	}

	// Fall back to space-separated datetime with timezone offset (e.g. "2025-02-15 10:30:00+00:00").
	parsedTime, err = time.Parse("2006-01-02 15:04:05Z07:00", raw)
	if err == nil {
		*d = DateTime{t: &parsedTime}
		return nil
	}
	spaceTzErr := err

	// Fall back to space-separated datetime with fractional seconds, no timezone (assume UTC).
	parsedTime, err = time.Parse("2006-01-02 15:04:05.999999999", raw)
	if err == nil {
		parsedTime = parsedTime.UTC()
		*d = DateTime{t: &parsedTime}
		return nil
	}

	// Fall back to space-separated datetime without timezone (assume UTC).
	parsedTime, err = time.Parse("2006-01-02 15:04:05", raw)
	if err == nil {
		parsedTime = parsedTime.UTC()
		*d = DateTime{t: &parsedTime}
		return nil
	}
	spaceNoTzErr := err

	// Fall back to date-only format.
	parsedTime, err = time.Parse("2006-01-02", raw)
	if err == nil {
		parsedTime = parsedTime.UTC()
		*d = DateTime{t: &parsedTime}
		return nil
	}
	dateOnlyErr := err

	return fmt.Errorf("unable to parse datetime string %q: tried RFC3339Nano (%v), ISO8601 (%v), space-separated with tz (%v), space-separated (%v), date-only (%v)", raw, rfc3339NanoErr, iso8601Err, spaceTzErr, spaceNoTzErr, dateOnlyErr)
}

// NewDateTimeList returns a slice of *DateTime for the given times. If the
// given slice is nil, nil will be returned.
func NewDateTimeList(times []time.Time) []*DateTime {
	if times == nil {
		return nil
	}
	dateTimes := make([]*DateTime, 0, len(times))
	for _, t := range times {
		dateTimes = append(dateTimes, NewDateTime(t))
	}
	return dateTimes
}

// NewDateTimeMap returns a map of *DateTime for the given times. If the
// given map is nil, nil will be returned.
func NewDateTimeMap(times map[string]time.Time) map[string]*DateTime {
	if times == nil {
		return nil
	}
	dateTimes := make(map[string]*DateTime, len(times))
	for key, t := range times {
		dateTimes[key] = NewDateTime(t)
	}
	return dateTimes
}

// TimesFromDateTimeList returns the underlying times of the given date-times.
// If the given slice is nil, nil will be returned.
func TimesFromDateTimeList(dateTimes []*DateTime) []time.Time {
	if dateTimes == nil {
		return nil
	}
	times := make([]time.Time, 0, len(dateTimes))
	for _, dateTime := range dateTimes {
		times = append(times, dateTime.Time())
	}
	return times
}

// TimesFromDateTimeMap returns the underlying times of the given date-times.
// If the given map is nil, nil will be returned.
func TimesFromDateTimeMap(dateTimes map[string]*DateTime) map[string]time.Time {
	if dateTimes == nil {
		return nil
	}
	times := make(map[string]time.Time, len(dateTimes))
	for key, dateTime := range dateTimes {
		times[key] = dateTime.Time()
	}
	return times
}

// NewDateTimeListFromPtr returns a slice of *DateTime for the given times. If
// the given pointer is nil, nil will be returned.
func NewDateTimeListFromPtr(times *[]time.Time) []*DateTime {
	if times == nil {
		return nil
	}
	return NewDateTimeList(*times)
}

// NewDateTimeMapFromPtr returns a map of *DateTime for the given times. If the
// given pointer is nil, nil will be returned.
func NewDateTimeMapFromPtr(times *map[string]time.Time) map[string]*DateTime {
	if times == nil {
		return nil
	}
	return NewDateTimeMap(*times)
}

// TimesPtrFromDateTimeList returns a pointer to the underlying times of the
// given date-times. If the given slice is nil, nil will be returned.
func TimesPtrFromDateTimeList(dateTimes []*DateTime) *[]time.Time {
	if dateTimes == nil {
		return nil
	}
	times := TimesFromDateTimeList(dateTimes)
	return &times
}

// TimesPtrFromDateTimeMap returns a pointer to the underlying times of the
// given date-times. If the given map is nil, nil will be returned.
func TimesPtrFromDateTimeMap(dateTimes map[string]*DateTime) *map[string]time.Time {
	if dateTimes == nil {
		return nil
	}
	times := TimesFromDateTimeMap(dateTimes)
	return &times
}
