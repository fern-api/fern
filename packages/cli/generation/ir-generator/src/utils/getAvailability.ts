import { Availability, AvailabilityStatus } from "@fern-api/ir-sdk";

type RawAvailabilityStatus = "in-development" | "pre-release" | "generally-available" | "deprecated";
type RawAvailability = {
    status: RawAvailabilityStatus;
    message?: string;
};

export function getAvailability(
    field: { availability?: RawAvailability | RawAvailabilityStatus } | string
): Availability | undefined {
    if (typeof field === "string" || field.availability == null) {
        return undefined;
    }

    const rawAvailability =
        typeof field.availability === "string" ? { status: field.availability } : field.availability;
    switch (rawAvailability.status) {
        case "in-development":
            return { status: AvailabilityStatus.InDevelopment, message: rawAvailability.message };
        case "pre-release":
            return { status: AvailabilityStatus.PreRelease, message: rawAvailability.message };
        case "generally-available":
            return { status: AvailabilityStatus.GeneralAvailability, message: rawAvailability.message };
        case "deprecated":
            return { status: AvailabilityStatus.Deprecated, message: rawAvailability.message };
    }
}
