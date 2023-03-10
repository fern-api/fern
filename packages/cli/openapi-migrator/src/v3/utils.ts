import { TaskContext } from "@fern-api/task-context";
import { RawSchemas, visitRawTypeDeclaration, visitRawTypeReference } from "@fern-api/yaml-schema";
import { OpenAPIV3 } from "openapi-types";
import { OpenApiV3Context, OpenAPIV3Endpoint } from "./OpenApiV3Context";

export const APPLICATION_JSON_CONTENT = "application/json";
export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";
export const RESPONSE_REFERENCE_PREFIX = "#/components/responses/";
export const REQUEST_REFERENCE_PREFIX = "#/components/requestBodies/";

export function isReferenceObject(
    parameter:
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
        | OpenAPIV3.SchemaObject
        | OpenAPIV3.RequestBodyObject
        | OpenAPIV3.SecuritySchemeObject
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

export function isPrimitive(typeReference: RawSchemas.TypeReferenceSchema): boolean {
    const rawTypeReference = typeof typeReference === "string" ? typeReference : typeReference.type;
    return visitRawTypeReference(rawTypeReference, {
        primitive: () => true,
        map: () => false,
        list: () => false,
        set: () => false,
        optional: (valueType) => isPrimitive(valueType),
        literal: () => false,
        named: () => false,
        unknown: () => false,
    });
}

export const UNTAGGED_FILE_NAME = "__package__";
export const COMMONS_SERVICE_FILE_NAME = "commons";

// adds imports to import array
export function getFernReferenceForSchema(
    schemaReference: OpenAPIV3.ReferenceObject,
    context: OpenApiV3Context,
    tag: string,
    imports: Record<string, string>,
    referencePrefix = SCHEMA_REFERENCE_PREFIX
): string {
    const tags = context.getTagForReference(schemaReference);

    let definitionFileName = UNTAGGED_FILE_NAME;
    const [firstTag, ...remainingTags] = tags;
    if (firstTag != null) {
        if (remainingTags.length === 0) {
            definitionFileName = firstTag;
        } else {
            definitionFileName = COMMONS_SERVICE_FILE_NAME;
        }
    }

    const typeName = schemaReference.$ref.replace(referencePrefix, "");
    if (tag !== definitionFileName) {
        imports[
            definitionFileName === UNTAGGED_FILE_NAME ? "__package__" : definitionFileName
        ] = `${definitionFileName}.yml`;
    }

    return tag === definitionFileName ? typeName : `${definitionFileName}.${typeName}`;
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
        discriminatedUnion: () => undefined,
        undiscriminatedUnion: () => undefined,
        enum: () => undefined,
    });
}

export function convertParameterSchema(
    parameter: OpenAPIV3.ParameterObject,
    context: OpenApiV3Context,
    taskContext: TaskContext,
    endpoint: OpenAPIV3Endpoint
): string | undefined {
    if (parameter.schema == null) {
        return undefined;
    }

    const resolvedSchema = isReferenceObject(parameter.schema)
        ? context.maybeResolveReference(parameter.schema)?.schemaObject
        : parameter.schema;
    if (resolvedSchema == null) {
        return undefined;
    }

    const convertedPrimitive = maybeConvertSchemaToPrimitive(resolvedSchema);
    if (convertedPrimitive == null) {
        taskContext.logger.warn(
            `${endpoint.httpMethod} ${endpoint.path} parameter ${
                parameter.name
            } has non primitive schema: ${JSON.stringify(resolvedSchema, undefined, 2)}`
        );
    }
    const parameterType =
        parameter.required != null && parameter.required ? convertedPrimitive : `optional<${convertedPrimitive}>`;
    return parameterType;
}

export function diff(a: string[], b: string[]): string[] {
    return a.filter((x) => !b.includes(x));
}
