import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Return a docstring prefix describing the endpoint's availability.
 *
 * Mirrors the `get_availability_docs` helper in the v1 Python generator so
 * both the Python docstrings (v1) and the `reference.md` description (v2)
 * surface the same annotation wording. The v2 generator ultimately emits
 * markdown into `reference.md`, but the wording is intentionally shared with
 * v1 so developers see consistent annotations regardless of which surface
 * they look at.
 */
export function getAvailabilityDocs(endpoint: FernIr.HttpEndpoint): string | undefined {
    const availability = endpoint.availability;
    if (availability == null) {
        return undefined;
    }
    const message = availability.message;
    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            if (message != null) {
                return `.. deprecated::\n    ${message}`;
            }
            return "@deprecated";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@beta This endpoint is in development and may change.";
            return message != null ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@beta This endpoint is in pre-release and may change.";
            return message != null ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
}
