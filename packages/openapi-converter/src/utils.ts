import { OpenAPIV3 } from "openapi-types";

export function isSchemaObject(
    typeDefinition: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDefinition is OpenAPIV3.SchemaObject {
    return (typeDefinition as OpenAPIV3.ReferenceObject).$ref === undefined;
}

export function isReferenceObject(
    typeDefinition:
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.ResponseObject
        | OpenAPIV3.RequestBodyObject
        | OpenAPIV3.SecuritySchemeObject
): typeDefinition is OpenAPIV3.ReferenceObject {
    return (typeDefinition as OpenAPIV3.ReferenceObject).$ref !== undefined;
}
