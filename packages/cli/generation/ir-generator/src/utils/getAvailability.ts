import { Availability, AvailabilityStatus } from "@fern-api/ir-sdk";

import { convertAvailability } from "../converters/convertDeclaration";

type RawAvailabilityStatus = "in-development" | "pre-release" | "generally-available" | "deprecated";
interface RawAvailability {
    status: RawAvailabilityStatus;
    message?: string;
}

export function getAvailability(
    field: { availability?: RawAvailability | RawAvailabilityStatus } | string
): Availability | undefined {
    if (typeof field === "string" || field.availability == null) {
        return undefined;
    }

    const rawAvailability =
        typeof field.availability === "string" ? { status: field.availability } : field.availability;
    return convertAvailability(field.availability);
}
