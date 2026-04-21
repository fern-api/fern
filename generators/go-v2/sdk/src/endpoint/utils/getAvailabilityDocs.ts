import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns the doc comment line to emit for the given availability, or undefined
 * if nothing extra should be emitted.
 *
 * For DEPRECATED, this returns a "Deprecated:" paragraph — the canonical Go
 * convention recognized by `go doc` and staticcheck's SA1019. Callers are
 * responsible for emitting a preceding blank comment line so the marker is
 * treated as its own paragraph.
 *
 * For IN_DEVELOPMENT and PRE_RELEASE, this returns an "Experimental:" paragraph
 * that mirrors the shape of Go's native "Deprecated:" convention. Go has no
 * standard "experimental" doc convention, but the structural parallel with
 * Deprecated: is the most idiomatic option available and avoids JSDoc-style
 * `@beta` noise.
 *
 * Any embedded newline in `availability.message` is collapsed to a single
 * space as defence in depth against comment break-out injection. Callers
 * writing the result into a line-oriented comment writer (like ast/Comment)
 * already split on `\n`, but sanitizing here keeps the helper safe in
 * isolation.
 *
 * GENERAL_AVAILABILITY and nullish availability produce no extra docs.
 */
export function getAvailabilityDocs(availability: FernIr.Availability | undefined): string | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const message = sanitizeAvailabilityMessage(availability.message);
            return message != null ? `Deprecated: ${message}` : "Deprecated: This endpoint is deprecated.";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "Experimental: This endpoint is in development and may change.";
            const message = sanitizeAvailabilityMessage(availability.message);
            return message != null ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "Experimental: This endpoint is in pre-release and may change.";
            const message = sanitizeAvailabilityMessage(availability.message);
            return message != null ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
}

function sanitizeAvailabilityMessage(message: string | undefined): string | undefined {
    if (message == null || message.length === 0) {
        return undefined;
    }
    return message.replace(/\r\n|\r|\n/g, " ");
}

/**
 * Combines an endpoint's existing doc string with its availability annotation,
 * returning a single doc string suitable for passing to `go.Method`'s `docs`
 * field. When both are present, the availability paragraph is separated from
 * the existing docs by a blank comment line so that `go doc` and staticcheck
 * recognize markers like `Deprecated:` as their own paragraph.
 */
export function combineDocsWithAvailability(
    docs: string | undefined,
    availability: FernIr.Availability | undefined
): string | undefined {
    const availabilityLine = getAvailabilityDocs(availability);
    if (availabilityLine == null) {
        return docs;
    }
    if (docs == null || docs.length === 0) {
        return availabilityLine;
    }
    return `${docs}\n\n${availabilityLine}`;
}
