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
 * For IN_DEVELOPMENT and PRE_RELEASE, this returns a free-form "@beta" note
 * matching the wording used by the TypeScript SDK generator.
 *
 * GENERAL_AVAILABILITY and nullish availability produce no extra docs.
 */
export function getAvailabilityDocs(availability: FernIr.Availability | undefined): string | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const message = availability.message;
            return message != null ? `Deprecated: ${message}` : "Deprecated: This endpoint is deprecated.";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@beta This endpoint is in development and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@beta This endpoint is in pre-release and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
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
