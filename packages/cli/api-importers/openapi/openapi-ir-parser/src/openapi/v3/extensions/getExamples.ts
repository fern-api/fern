import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";

export function getExamples(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject): unknown[] {
    const examples = getExtension<unknown[] | Record<string, unknown>>(schema, "examples");
    if (examples != null) {
        // Handle array-style examples (OpenAPI 3.0 style)
        if (Array.isArray(examples)) {
            return examples;
        }
        // Handle object-style examples (OpenAPI 3.1 style)
        if (typeof examples === "object" && examples !== null) {
            return Object.values(examples).map((example) => {
                // If the example has a 'value' property, extract it
                if (typeof example === "object" && example !== null && "value" in example) {
                    return (example as { value: unknown }).value;
                }
                return example;
            });
        }
    }
    return [];
}
