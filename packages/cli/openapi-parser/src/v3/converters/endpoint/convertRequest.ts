import { MultipartSchema, Request } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../convertSchemas";

export const APPLICATION_JSON_CONTENT = "application/json";
export const APPLICATION_JSON_UTF_8_CONTENT = "application/json; charset=utf-8";

export const MULTIPART_CONTENT = "multipart/form-data";

export const OCTET_STREAM = "application/octet-stream";

function getMultipartFormDataRequest(
    requestBody: OpenAPIV3.RequestBodyObject
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return requestBody.content[MULTIPART_CONTENT]?.schema;
}

function getOctetStreamRequest(
    requestBody: OpenAPIV3.RequestBodyObject
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return requestBody.content[OCTET_STREAM]?.schema;
}

interface ParsedApplicationJsonRequest {
    schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
    // populated if the content type is not application/json
    overridenContentType?: string;
}

function getApplicationJsonRequest(requestBody: OpenAPIV3.RequestBodyObject): ParsedApplicationJsonRequest | undefined {
    const applicationJsonSchema = getSchemaForContentType({
        contentType: APPLICATION_JSON_CONTENT,
        media: requestBody.content,
    });
    if (applicationJsonSchema != null) {
        return {
            schema: applicationJsonSchema,
        };
    }

    const applicationJsonUtf8Schema = getSchemaForContentType({
        contentType: APPLICATION_JSON_UTF_8_CONTENT,
        media: requestBody.content,
    });
    if (applicationJsonUtf8Schema != null) {
        return {
            schema: applicationJsonUtf8Schema,
        };
    }
    return undefined;
}

function getSchemaForContentType({
    contentType,
    media,
}: {
    contentType: string;
    media: Record<string, OpenAPIV3.MediaTypeObject>;
}): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return media[contentType]?.schema;
}

function multipartRequestHasFile(
    multipartSchema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
    document: OpenAPIV3.Document
): boolean {
    const resolvedMultipartSchema = isReferenceObject(multipartSchema)
        ? resolveSchema(multipartSchema, document)
        : {
              id: undefined,
              schema: multipartSchema,
          };
    return (
        Object.entries(resolvedMultipartSchema.schema.properties ?? {}).find(([_, definition]) => {
            return !isReferenceObject(definition) && definition.type === "string" && definition.format === "binary";
        }) != null
    );
}

export function convertRequest({
    requestBody,
    document,
    context,
    requestBreadcrumbs,
}: {
    requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
}): Request | undefined {
    const resolvedRequestBody = isReferenceObject(requestBody)
        ? context.resolveRequestBodyReference(requestBody)
        : requestBody;

    const multipartSchema = getMultipartFormDataRequest(resolvedRequestBody);
    const octetStreamSchema = getOctetStreamRequest(resolvedRequestBody);
    const jsonSchema = getApplicationJsonRequest(resolvedRequestBody);

    // convert as application/octet-stream
    if (octetStreamSchema != null) {
        return Request.octetStream({
            description: undefined,
        });
    }

    // convert as multipart request
    if (
        (multipartSchema != null && jsonSchema == null) ||
        (multipartSchema != null && multipartRequestHasFile(multipartSchema, document))
    ) {
        const resolvedMultipartSchema = isReferenceObject(multipartSchema)
            ? resolveSchema(multipartSchema, document)
            : {
                  id: undefined,
                  schema: multipartSchema,
              };

        return Request.multipart({
            name:
                isReferenceObject(multipartSchema) && context.getNumberOfOccurrencesForRef(multipartSchema) === 1
                    ? resolvedMultipartSchema.id
                    : undefined,
            description: undefined,
            properties: Object.entries(resolvedMultipartSchema.schema.properties ?? {}).map(([key, definition]) => {
                if (!isReferenceObject(definition) && definition.type === "string" && definition.format === "binary") {
                    return {
                        key,
                        schema: MultipartSchema.file(),
                        description: undefined,
                    };
                }
                return {
                    key,
                    schema: MultipartSchema.json(convertSchema(definition, false, context, [])),
                    description: undefined,
                };
            }),
        });
    }

    // otherwise, convert as json request.
    if (jsonSchema == null) {
        return undefined;
    }
    const requestSchema = convertSchema(jsonSchema.schema, false, context, requestBreadcrumbs, true);
    return Request.json({
        description: undefined,
        schema: requestSchema,
        contentType: jsonSchema.overridenContentType,
    });
}

interface ResolvedSchema {
    id: string;
    schema: OpenAPIV3.SchemaObject;
}

function resolveSchema(schema: OpenAPIV3.ReferenceObject, document: OpenAPIV3.Document): ResolvedSchema {
    if (!schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve schema reference because of unsupported prefix: ${schema.$ref}`);
    }
    const schemaId = getSchemaIdFromReference(schema);
    const resolvedSchema = document.components?.schemas?.[schemaId];
    if (resolvedSchema == null) {
        throw new Error(`Failed to resolve schema reference because missing: ${schema.$ref}`);
    }
    if (isReferenceObject(resolvedSchema)) {
        return resolveSchema(resolvedSchema, document);
    }
    return {
        id: schemaId,
        schema: resolvedSchema,
    };
}
