import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns availability documentation lines for the endpoint's availability status.
 * Mirrors the behavior of the TypeScript SDK generator's getAvailabilityDocs.
 * - DEPRECATED -> @deprecated tag (with optional message)
 * - IN_DEVELOPMENT -> @apiNote warning (standard Javadoc block tag since Java 9)
 * - PRE_RELEASE -> @apiNote warning (standard Javadoc block tag since Java 9)
 * - GENERAL_AVAILABILITY or undefined -> no additional docs
 */
export function getAvailabilityDocs(endpoint: FernIr.HttpEndpoint): string | undefined {
    const availability = endpoint.availability;
    if (availability == null) {
        return undefined;
    }

    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const message = availability.message;
            return message != null ? `@deprecated ${message}` : "@deprecated";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@apiNote This endpoint is in development and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@apiNote This endpoint is in pre-release and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
}
