import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns YARD doc lines for the endpoint's availability status.
 * - DEPRECATED -> @deprecated tag (with optional message)
 * - IN_DEVELOPMENT -> @note warning
 * - PRE_RELEASE -> @note warning
 * - GENERAL_AVAILABILITY or undefined -> no additional docs
 */
export function getAvailabilityDocs(availability: FernIr.Availability | undefined): string | undefined {
    if (availability == null) {
        return undefined;
    }

    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            const message = availability.message?.trim();
            return message ? `@deprecated ${message}` : "@deprecated";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@note This endpoint is in development and may change.";
            const message = availability.message?.trim();
            return message ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@note This endpoint is in pre-release and may change.";
            const message = availability.message?.trim();
            return message ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            assertNever(availability.status);
    }
}
