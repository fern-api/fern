import { OpenAPIV3 } from "openapi-types";

export function isSchemaObject(
    typeDeclaration: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDeclaration is OpenAPIV3.SchemaObject {
    return (typeDeclaration as OpenAPIV3.ReferenceObject).$ref === undefined;
}

export function isReferenceObject(
    typeDeclaration:
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.ResponseObject
        | OpenAPIV3.RequestBodyObject
        | OpenAPIV3.SecuritySchemeObject
): typeDeclaration is OpenAPIV3.ReferenceObject {
    return (typeDeclaration as OpenAPIV3.ReferenceObject).$ref !== undefined;
}
