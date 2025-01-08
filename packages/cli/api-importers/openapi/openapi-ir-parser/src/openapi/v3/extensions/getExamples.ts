import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension";

export function getExamples(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ParameterObject): unknown[] {
    const examples = getExtension<unknown[]>(schema, "examples");
    if (examples != null && Array.isArray(examples)) {
        return examples;
    }
    return [];
}
