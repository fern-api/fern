import { SchemaWithExample, isSchemaEqual } from "@fern-api/openapi-ir";

import { convertSchemaWithExampleToSchema } from "./convertSchemaWithExampleToSchema";

// only diffs the schema, not the example
export function isSchemaWithExampleEqual(a: SchemaWithExample, b: SchemaWithExample): boolean {
    return isSchemaEqual(convertSchemaWithExampleToSchema(a), convertSchemaWithExampleToSchema(b));
}
