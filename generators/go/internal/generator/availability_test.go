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
			name: "in-development without message falls back to @beta note",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusInDevelopment,
			},
			expected: "@beta This endpoint is in development and may change.",
		},
		{
			name: "in-development with message appends the message",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusInDevelopment,
				Message: stringPtr("Expected Q3 release"),
			},
			expected: "@beta This endpoint is in development and may change. Expected Q3 release",
		},
		{
			name: "pre-release without message falls back to @beta note",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusPreRelease,
			},
			expected: "@beta This endpoint is in pre-release and may change.",
		},
		{
			name: "pre-release with message appends the message",
			availability: &ir.Availability{
				Status:  ir.AvailabilityStatusPreRelease,
				Message: stringPtr("Beta 2"),
			},
			expected: "@beta This endpoint is in pre-release and may change. Beta 2",
		},
		{
			name: "general-availability returns empty string",
			availability: &ir.Availability{
				Status: ir.AvailabilityStatusGeneralAvailability,
			},
			expected: "",
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
