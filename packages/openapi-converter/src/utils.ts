import { OpenAPIV3 } from "openapi-types";

export function isSchemaObject(
    typeDeclaration: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): typeDeclaration is OpenAPIV3.SchemaObject {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (typeDeclaration as OpenAPIV3.ReferenceObject).$ref == null;
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (typeDeclaration as OpenAPIV3.ReferenceObject).$ref != null;
}
