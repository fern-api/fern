import { Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { ObjectPropertyWithExample, SchemaWithExample } from "@fern-fern/openapi-ir-model/parseIr";

export function convertToSchema(schema: SchemaWithExample): Schema {
    switch (schema.type) {
        case "object":
        case "array":
        case "enum":
        case "literal":
        case "map":
            break;
    }
    if (schema.type === "object") {
        return Schema.object({
            allOf: schema.allOf,
            properties: [],
            allOfPropertyConflicts: [],
            description: undefined,
            generatedName: "",
            nameOverride: "",
        });
    }
}

function convertToObjectProperty(objectProperty: ObjectPropertyWithExample): Schema {}
