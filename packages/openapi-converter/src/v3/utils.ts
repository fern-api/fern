import { OpenAPIV3 } from "openapi-types";

export function isReferenceObject(
    parameter:
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.RequestBodyObject
): parameter is OpenAPIV3.ReferenceObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (parameter as OpenAPIV3.ReferenceObject).$ref != null;
}

export function maybeConvertSchemaToPrimitive(schemaObject: OpenAPIV3.SchemaObject): string | undefined {
    if (schemaObject.type == null) {
        return undefined;
    } else if (schemaObject.type === "boolean") {
        return "boolean";
    } else if (schemaObject.type === "number") {
        return "double";
    } else if (schemaObject.type === "integer") {
        return "integer";
    } else if (schemaObject.type === "string") {
        return "string";
    }
    return undefined;
}