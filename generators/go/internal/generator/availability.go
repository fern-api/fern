package generator

import (
	"strings"

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
// For IN_DEVELOPMENT and PRE_RELEASE, this returns an "Experimental:"
// paragraph that mirrors the shape of Go's native "Deprecated:" convention.
// Go has no standard "experimental" doc convention, but the structural
// parallel with Deprecated: is the most idiomatic option available and
// avoids JSDoc-style `@beta` noise.
//
// GENERAL_AVAILABILITY and nil availability produce no extra docs.
//
// Any embedded newline in availability.Message is collapsed to a single
// space so the result is always a single line. Callers writing the result
// into a line-oriented doc comment should still split on "\n" as defence
// in depth, matching the treatment fileWriter.WriteDocs already applies.
func getAvailabilityDocs(availability *ir.Availability) string {
	if availability == nil {
		return ""
	}
	switch availability.Status {
	case ir.AvailabilityStatusDeprecated:
		if availability.Message != nil && len(*availability.Message) > 0 {
			return "Deprecated: " + sanitizeAvailabilityMessage(*availability.Message)
		}
		return "Deprecated: This endpoint is deprecated."
	case ir.AvailabilityStatusInDevelopment:
		warning := "Experimental: This endpoint is in development and may change."
		if availability.Message != nil && len(*availability.Message) > 0 {
			return warning + " " + sanitizeAvailabilityMessage(*availability.Message)
		}
		return warning
	case ir.AvailabilityStatusPreRelease:
		warning := "Experimental: This endpoint is in pre-release and may change."
		if availability.Message != nil && len(*availability.Message) > 0 {
			return warning + " " + sanitizeAvailabilityMessage(*availability.Message)
		}
		return warning
	case ir.AvailabilityStatusGeneralAvailability:
		return ""
	}
	return ""
}

// sanitizeAvailabilityMessage collapses any embedded newline or carriage
// return into a single space. Without this, a message containing "\n"
// (sourced from a user-supplied API spec) could break out of the
// surrounding "// " comment prefix and inject arbitrary Go source into
// the generated file.
func sanitizeAvailabilityMessage(message string) string {
	replaced := strings.ReplaceAll(message, "\r\n", " ")
	replaced = strings.ReplaceAll(replaced, "\n", " ")
	replaced = strings.ReplaceAll(replaced, "\r", " ")
	return replaced
}
