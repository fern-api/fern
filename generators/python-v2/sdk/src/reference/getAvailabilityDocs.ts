import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Return a description prefix for the endpoint's reference.md entry.
 *
 * The v2 generator writes to markdown reference.md files, so in-development
 * and pre-release endpoints use GitHub-flavored alert callouts (`> [!WARNING]`)
 * which render as styled callouts on GitHub and in markdown viewers that
 * support the syntax. Deprecated endpoints keep the Sphinx `.. deprecated::`
 * directive, which matches v1 behavior and is already idiomatic.
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
            const base = "This endpoint is in development and may change.";
            const body = message != null ? `${base} ${message}` : base;
            return `> [!WARNING]\n> ${body}`;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const base = "This endpoint is in pre-release and may change.";
            const body = message != null ? `${base} ${message}` : base;
            return `> [!WARNING]\n> ${body}`;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
}
