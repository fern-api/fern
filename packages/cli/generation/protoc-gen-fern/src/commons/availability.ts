import { Availability, AvailabilityStatus } from "@fern-api/ir-sdk";

export interface ProtoAvailabilityOptions {
    deprecated?: boolean;
}

export function getAvailability(schema: ProtoAvailabilityOptions | undefined): Availability | undefined {
    if (schema?.deprecated) {
        return { status: AvailabilityStatus.Deprecated, message: "DEPRECATED" };
    }
    return undefined;
}