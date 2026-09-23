package internal

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDateTimeMarshalJSONWholeSecondsUnchanged(t *testing.T) {
	tests := []time.Time{
		time.Date(2025, 2, 15, 10, 30, 0, 0, time.UTC),
		time.Date(2025, 2, 15, 10, 30, 0, 0, time.FixedZone("EST", -5*60*60)),
		time.Date(2025, 2, 15, 0, 0, 0, 0, time.UTC),
	}
	for _, tt := range tests {
		t.Run(tt.String(), func(t *testing.T) {
			want, err := json.Marshal(tt.Format(time.RFC3339))
			require.NoError(t, err)

			got, err := json.Marshal(NewDateTime(tt))
			require.NoError(t, err)
			assert.Equal(t, string(want), string(got))
		})
	}
}

func TestDateTimeRoundTripPreservesPrecision(t *testing.T) {
	tests := []struct {
		desc   string
		give   string
		wantNs int
	}{
		{desc: "whole seconds", give: `"2025-02-15T10:30:00Z"`, wantNs: 0},
		{desc: "milliseconds", give: `"2025-02-15T10:30:00.123Z"`, wantNs: 123000000},
		{desc: "microseconds", give: `"2025-02-15T10:30:00.123456Z"`, wantNs: 123456000},
		{desc: "nanoseconds", give: `"2025-02-15T10:30:00.123456789Z"`, wantNs: 123456789},
		{desc: "negative offset with fraction", give: `"2025-02-15T10:30:00.5-05:00"`, wantNs: 500000000},
		{desc: "positive offset with microseconds", give: `"2025-02-15T10:30:00.123456+09:00"`, wantNs: 123456000},
	}
	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			var dt DateTime
			require.NoError(t, json.Unmarshal([]byte(tt.give), &dt))
			assert.Equal(t, tt.wantNs, dt.Time().Nanosecond())

			got, err := json.Marshal(&dt)
			require.NoError(t, err)
			assert.Equal(t, tt.give, string(got))
		})
	}
}

func TestDateUnmarshalJSON(t *testing.T) {
	tests := []struct {
		desc string
		give string
		want string
	}{
		{desc: "date only", give: `"2025-02-15"`, want: "2025-02-15"},
		{desc: "rfc3339 utc", give: `"2025-02-15T10:30:00Z"`, want: "2025-02-15"},
		{desc: "rfc3339 midnight with millis", give: `"2025-02-15T00:00:00.000Z"`, want: "2025-02-15"},
		{desc: "rfc3339 nanos", give: `"2025-02-15T10:30:00.123456789Z"`, want: "2025-02-15"},
		{desc: "negative offset preserves calendar date", give: `"2025-02-15T23:00:00-05:00"`, want: "2025-02-15"},
		{desc: "positive offset preserves calendar date", give: `"2025-02-15T01:00:00+09:00"`, want: "2025-02-15"},
		{desc: "iso8601 no timezone", give: `"2025-02-15T10:30:00"`, want: "2025-02-15"},
		{desc: "iso8601 no timezone with fraction", give: `"2025-02-15T10:30:00.123"`, want: "2025-02-15"},
		{desc: "space separated with offset", give: `"2025-02-15 10:30:00+00:00"`, want: "2025-02-15"},
		{desc: "space separated with fraction and offset", give: `"2025-02-15 10:30:00.123+00:00"`, want: "2025-02-15"},
		{desc: "space separated no timezone", give: `"2025-02-15 10:30:00"`, want: "2025-02-15"},
		{desc: "space separated no timezone with fraction", give: `"2025-02-15 10:30:00.123"`, want: "2025-02-15"},
	}
	for _, tt := range tests {
		t.Run(tt.desc, func(t *testing.T) {
			var d Date
			require.NoError(t, json.Unmarshal([]byte(tt.give), &d))
			assert.Equal(t, tt.want, d.Time().Format(dateFormat))

			got, err := json.Marshal(&d)
			require.NoError(t, err)
			assert.Equal(t, `"`+tt.want+`"`, string(got))
		})
	}
}

func TestDateUnmarshalJSONNegativeOffsetDoesNotShiftDate(t *testing.T) {
	var d Date
	require.NoError(t, json.Unmarshal([]byte(`"2025-02-15T23:00:00-05:00"`), &d))
	assert.Equal(t, time.Date(2025, 2, 15, 0, 0, 0, 0, time.UTC), d.Time())
	assert.NotEqual(t, "2025-02-16", d.Time().Format(dateFormat))
}

func TestDateUnmarshalJSONInvalid(t *testing.T) {
	var d Date
	err := json.Unmarshal([]byte(`"not-a-date"`), &d)
	require.Error(t, err)
	assert.Contains(t, err.Error(), `parsing time "not-a-date" as "2006-01-02"`)
}
