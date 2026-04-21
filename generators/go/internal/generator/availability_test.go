package generator

import (
	"testing"

	"github.com/fern-api/fern-go/internal/fern/ir"
)

func stringPtr(s string) *string {
	return &s
}

func TestGetAvailabilityDocs(t *testing.T) {
	tests := []struct {
		name         string
		availability *ir.Availability
		expected     string
	}{
		{
			name:         "nil availability returns empty string",
			availability: nil,
			expected:     "",
		},
		{
			name: "deprecated without message uses Go deprecation convention",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusDeprecated,
			},
			expected: "Deprecated: This endpoint is deprecated.",
		},
		{
			name: "deprecated with message includes the message",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusDeprecated,
				Message: stringPtr("Use v2 instead"),
			},
			expected: "Deprecated: Use v2 instead",
		},
		{
			name: "in-development without message falls back to Experimental: note",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusInDevelopment,
			},
			expected: "Experimental: This endpoint is in development and may change.",
		},
		{
			name: "in-development with message appends the message",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusInDevelopment,
				Message: stringPtr("Expected Q3 release"),
			},
			expected: "Experimental: This endpoint is in development and may change. Expected Q3 release",
		},
		{
			name: "pre-release without message falls back to Experimental: note",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusPreRelease,
			},
			expected: "Experimental: This endpoint is in pre-release and may change.",
		},
		{
			name: "pre-release with message appends the message",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusPreRelease,
				Message: stringPtr("Beta 2"),
			},
			expected: "Experimental: This endpoint is in pre-release and may change. Beta 2",
		},
		{
			name: "general-availability returns empty string",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusGeneralAvailability,
			},
			expected: "",
		},
		{
			name: "deprecated with multi-line message collapses newlines to spaces to prevent comment break-out",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusDeprecated,
				Message: stringPtr("Use v2.\n\nfunc init() { os.Exit(1) }\n// "),
			},
			expected: "Deprecated: Use v2.  func init() { os.Exit(1) } // ",
		},
		{
			name: "in-development with \\r\\n message collapses newlines to spaces",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusInDevelopment,
				Message: stringPtr("Line 1\r\nLine 2"),
			},
			expected: "Experimental: This endpoint is in development and may change. Line 1 Line 2",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := getAvailabilityDocs(tc.availability)
			if got != tc.expected {
				t.Errorf("getAvailabilityDocs() = %q, want %q", got, tc.expected)
			}
		})
	}
}
