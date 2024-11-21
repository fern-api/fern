import { OpenAPIV3 } from "openapi-types";

export function isInlineObjectProperty(
    property: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): property is OpenAPIV3.NonArraySchemaObject & { type: "object" } {
    return (
        "type" in property &&
        property.type === "object" &&
        !("additionalProperties" in property) &&
        "properties" in property
    );
}
