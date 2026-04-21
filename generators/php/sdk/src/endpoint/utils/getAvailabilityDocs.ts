import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns PHPDoc lines for the endpoint's availability status.
 * - DEPRECATED -> @deprecated tag (with optional message)
 * - IN_DEVELOPMENT -> @experimental warning
 * - PRE_RELEASE -> @experimental warning
 * - GENERAL_AVAILABILITY or undefined -> no additional docs
 */
export function getAvailabilityDocs(endpoint: FernIr.HttpEndpoint): string | undefined {
    const availability = endpoint.availability;
    if (availability == null) {
        return undefined;
    }

    const message = availability.message?.trim();

    switch (availability.status) {
        case FernIr.AvailabilityStatus.Deprecated: {
            return message ? `@deprecated ${message}` : "@deprecated";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "@experimental This endpoint is in development and may change.";
            return message ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "@experimental This endpoint is in pre-release and may change.";
            return message ? `${warning} ${message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            assertNever(availability.status);
    }
}

/**
 * Returns the endpoint's documentation string with availability-based PHPDoc annotations
 * prepended. Combines the endpoint's existing docs with availability docs when present.
 */
export function getEndpointDocs(endpoint: FernIr.HttpEndpoint): string | undefined {
    const availabilityDocs = getAvailabilityDocs(endpoint);
    if (availabilityDocs == null) {
        return endpoint.docs;
    }
    if (endpoint.docs == null) {
        return availabilityDocs;
    }
    return `${endpoint.docs}\n\n${availabilityDocs}`;
}
