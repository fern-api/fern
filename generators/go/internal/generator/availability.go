package generator

import (
	"github.com/fern-api/fern-go/internal/fern/ir"
)

// getAvailabilityDocs returns the doc comment line to emit for the given
// availability, or an empty string if nothing extra should be emitted.
//
// For DEPRECATED, this returns a "Deprecated:" paragraph, which is the
// canonical Go convention recognized by `go doc` and staticcheck's SA1019.
// Callers are responsible for emitting a preceding blank comment line so
// the marker is treated as its own paragraph.
//
// For IN_DEVELOPMENT and PRE_RELEASE, this returns a free-form "@beta"
// note matching the wording used by the TypeScript SDK generator.
//
// GENERAL_AVAILABILITY and nil availability produce no extra docs.
func getAvailabilityDocs(availability *ir.Availability) string {
	if availability == nil {
		return ""
	}
	switch availability.Status {
	case ir.AvailabilityStatusDeprecated:
		if availability.Message != nil && len(*availability.Message) > 0 {
			return "Deprecated: " + *availability.Message
		}
		return "Deprecated: This endpoint is deprecated."
	case ir.AvailabilityStatusInDevelopment:
		warning := "@beta This endpoint is in development and may change."
		if availability.Message != nil && len(*availability.Message) > 0 {
			return warning + " " + *availability.Message
		}
		return warning
	case ir.AvailabilityStatusPreRelease:
		warning := "@beta This endpoint is in pre-release and may change."
		if availability.Message != nil && len(*availability.Message) > 0 {
			return warning + " " + *availability.Message
		}
		return warning
	case ir.AvailabilityStatusGeneralAvailability:
		return ""
	}
	return ""
}
