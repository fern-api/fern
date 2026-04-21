import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Returns a Markdown-formatted availability annotation for the endpoint's
 * availability status. Used by the reference.md builder, which writes Markdown
 * (not Javadoc), so the output uses human-readable Markdown phrasing rather
 * than Javadoc block tags like `@deprecated` / `@apiNote`.
 *
 * - DEPRECATED -> **Deprecated** (with optional message)
 * - IN_DEVELOPMENT -> **Note:** pre-release warning
 * - PRE_RELEASE -> **Note:** pre-release warning
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
            return message != null ? `**Deprecated:** ${message}` : "**Deprecated**";
        }
        case FernIr.AvailabilityStatus.InDevelopment: {
            const warning = "**Note:** This endpoint is in development and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.PreRelease: {
            const warning = "**Note:** This endpoint is in pre-release and may change.";
            return availability.message != null ? `${warning} ${availability.message}` : warning;
        }
        case FernIr.AvailabilityStatus.GeneralAvailability:
            return undefined;
        default:
            return undefined;
    }
}
