import { RawSchemas } from "@fern-api/fern-definition-schema";
import { Availability } from "@fern-api/openapi-ir";
import { convertAvailability } from "./convertAvailability";

/**
 * Helper function to build a type reference with common metadata fields.
 * This reduces code duplication across enum, object, and oneOf type references.
 */
export function buildTypeReferenceWithMetadata({
    type,
    docs,
    defaultValue,
    availability,
    title,
    displayName
}: {
    type: string;
    docs?: string;
    defaultValue?: unknown;
    availability?: Availability;
    title?: string;
    displayName?: string;
}): RawSchemas.TypeReferenceSchema {
    if (docs == null && defaultValue == null && availability == null && title == null && displayName == null) {
        return type;
    }

    // Build result with explicit type checking
    const result: {
        type: string;
        "display-name"?: string;
        docs?: string;
        default?: unknown;
        availability?: RawSchemas.AvailabilityUnionSchema;
    } = { type };

    if (displayName != null) {
        result["display-name"] = displayName;
    }
    if (docs != null) {
        result.docs = docs;
    }
    if (defaultValue !== undefined) {
        result.default = defaultValue;
    }
    if (availability != null) {
        const convertedAvailability = convertAvailability(availability);
        if (convertedAvailability != null) {
            result.availability = convertedAvailability;
        }
    }

    return result;
}
