import { Availability } from "@fern-api/openapi-ir";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { assertNever } from "@fern-api/core-utils";

export function convertAvailability(
    availability: Availability | undefined
): RawSchemas.AvailabilityUnionSchema | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case Availability.Deprecated:
            return "deprecated";
        case Availability.Beta:
            return "pre-release";
        case Availability.GenerallyAvailable:
            return "generally-available";
        default:
            assertNever(availability);
    }
}
