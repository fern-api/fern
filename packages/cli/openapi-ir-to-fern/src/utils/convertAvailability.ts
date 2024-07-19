import { Availability } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";

export function convertAvailability(availability: Availability | undefined): RawSchemas.AvailabilityUnionSchema {
    switch (availability) {
        case Availability.Deprecated:
            return "deprecated";
        case Availability.Beta:
            return "pre-release";
        case Availability.GenerallyAvailable:
            return "generally-available";
        default:
            return;
    }
}
