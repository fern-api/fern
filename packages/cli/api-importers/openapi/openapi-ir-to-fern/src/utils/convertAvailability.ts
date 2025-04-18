import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Availability } from "@fern-api/openapi-ir";

export function convertAvailability(
    availability: Availability | undefined
): RawSchemas.AvailabilityUnionSchema | undefined {
    switch (availability) {
        case Availability.Deprecated:
            return "deprecated";
        case Availability.Beta:
            return "pre-release";
        case Availability.GenerallyAvailable:
            return "generally-available";
        default:
            return undefined;
    }
}
