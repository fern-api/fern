import { RawSchemas, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiV3Context } from "./OpenApiV3Context";

export const APPLICATION_JSON_CONTENT = "application/json";
export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

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
    if (schemaObject === "boolean" || schemaObject.type === "boolean") {
        return "boolean";
    } else if (schemaObject === "number" || schemaObject.type === "number") {
        return "double";
    } else if (schemaObject === "integer" || schemaObject.type === "integer") {
        return "integer";
    } else if (schemaObject === "string" || schemaObject.type === "string") {
        return "string";
    }
    return undefined;
}

export const COMMONS_SERVICE_FILE_NAME = "commons";

export function getFernReferenceForSchema(
    schemaReference: OpenAPIV3.ReferenceObject,
    context: OpenApiV3Context,
    tag: string
): string {
    const tags = context.getTagForSchema(schemaReference);
    let serviceFileName = COMMONS_SERVICE_FILE_NAME;
    if (tags.length === 1 && tags[0] != null) {
        serviceFileName = tags[0];
    }
    const typeName = schemaReference.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
    if (tag === serviceFileName) {
        return typeName;
    }
    return `${serviceFileName}.${typeName}`;
}

export function maybeGetAliasReference(typeDeclaration: RawSchemas.TypeDeclarationSchema): string | undefined {
    return visitRawTypeDeclaration(typeDeclaration, {
        alias: (schema) => {
            if (typeof schema === "string") {
                return schema;
            }
            return schema.type;
        },
        object: () => undefined,
        union: () => undefined,
        enum: () => undefined,
    });
}
