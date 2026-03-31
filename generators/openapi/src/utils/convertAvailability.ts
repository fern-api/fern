import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Converts an IR AvailabilityStatus to the corresponding x-fern-availability string value.
 */
export function convertAvailabilityStatus(status: FernIr.AvailabilityStatus): string | undefined {
    return FernIr.AvailabilityStatus._visit<string | undefined>(status, {
        inDevelopment: () => "in-development",
        preRelease: () => "pre-release",
        generalAvailability: () => "generally-available",
        deprecated: () => "deprecated",
        _other: () => undefined
    });
}
