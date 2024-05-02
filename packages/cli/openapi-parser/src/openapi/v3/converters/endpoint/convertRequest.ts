import { MultipartRequestProperty, MultipartSchema, RequestWithExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../../../../schema/convertSchemas";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { getApplicationJsonSchemaMediaObject } from "./getApplicationJsonSchema";

export const APPLICATION_JSON_CONTENT = "application/json";
export const APPLICATION_JSON_REGEX = /^application.*json$/;

export const MULTIPART_CONTENT = "multipart/form-data";

export const OCTET_STREAM = "application/octet-stream";

function getMultipartFormDataRequest(requestBody: OpenAPIV3.RequestBodyObject): OpenAPIV3.MediaTypeObject | undefined {
    return requestBody.content[MULTIPART_CONTENT];
}

function isOctetStreamRequest(requestBody: OpenAPIV3.RequestBodyObject): boolean {
    return requestBody.content[OCTET_STREAM] != null;
}

function multipartRequestHasFile(
    multipartSchema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject,
    document: OpenAPIV3.Document
): boolean {
    const resolvedMultipartSchema = isReferenceObject(multipartSchema)
        ? resolveSchema(multipartSchema, document)
        : {
              id: undefined,
              schema: multipartSchema
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
    requestBreadcrumbs
}: {
    requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
}): RequestWithExample | undefined {
    const resolvedRequestBody = isReferenceObject(requestBody)
        ? context.resolveRequestBodyReference(requestBody)
        : requestBody;

    const multipart = getMultipartFormDataRequest(resolvedRequestBody);
    const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedRequestBody.content, context);

    // convert as application/octet-stream
    if (isOctetStreamRequest(resolvedRequestBody)) {
        return RequestWithExample.octetStream({
            description: undefined
        });
    }

    // convert as multipart request
    if (
        (multipart?.schema != null && jsonMediaObject == null) ||
        (multipart?.schema != null && multipartRequestHasFile(multipart.schema, document))
    ) {
        const resolvedMultipartSchema = isReferenceObject(multipart.schema)
            ? resolveSchema(multipart.schema, document)
            : {
                  id: undefined,
                  schema: multipart.schema
              };

        const convertedMultipartSchema = convertSchema(
            resolvedMultipartSchema.schema,
            false,
            context,
            requestBreadcrumbs
        );
        const properties: MultipartRequestProperty[] = [];
        if (convertedMultipartSchema.type === "object") {
            for (const property of convertedMultipartSchema.properties) {
                if (
                    property.schema.type === "primitive" &&
                    property.schema.schema.type === "string" &&
                    property.schema.schema.format === "binary"
                ) {
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional: false, isArray: false }),
                        description: property.schema.description,
                        contentType: multipart.encoding?.[property.key]?.contentType
                    });
                    continue;
                }

                if (
                    property.schema.type === "optional" &&
                    property.schema.value.type === "primitive" &&
                    property.schema.value.schema.type === "string" &&
                    property.schema.value.schema.format === "binary"
                ) {
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional: true, isArray: false }),
                        description: property.schema.description,
                        contentType: multipart.encoding?.[property.key]?.contentType
                    });
                    continue;
                }

                if (
                    property.schema.type === "array" &&
                    property.schema.value.type === "primitive" &&
                    property.schema.value.schema.type === "string" &&
                    property.schema.value.schema.format === "binary"
                ) {
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional: false, isArray: true }),
                        description: property.schema.description,
                        contentType: multipart.encoding?.[property.key]?.contentType
                    });
                    continue;
                }

                if (
                    property.schema.type === "optional" &&
                    property.schema.value.type === "array" &&
                    property.schema.value.value.type === "primitive" &&
                    property.schema.value.value.schema.type === "string" &&
                    property.schema.value.value.schema.format === "binary"
                ) {
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional: true, isArray: true }),
                        description: property.schema.description,
                        contentType: multipart.encoding?.[property.key]?.contentType
                    });
                    continue;
                }

                properties.push({
                    key: property.key,
                    schema: MultipartSchema.json(property.schema),
                    description: undefined,
                    contentType: multipart.encoding?.[property.key]?.contentType
                });
            }
        }

        return RequestWithExample.multipart({
            name:
                isReferenceObject(multipart.schema) && context.getNumberOfOccurrencesForRef(multipart.schema) === 1
                    ? resolvedMultipartSchema.id
                    : undefined,
            description: undefined,
            properties
        });
    }

    // otherwise, convert as json request.
    if (jsonMediaObject == null) {
        return undefined;
    }
    const requestSchema = convertSchema(jsonMediaObject.schema, false, context, requestBreadcrumbs, true);
    return RequestWithExample.json({
        description: undefined,
        schema: requestSchema,
        contentType: undefined,
        fullExamples: jsonMediaObject.examples
    });
}

interface ResolvedSchema {
    id: string;
    schema: OpenAPIV3.SchemaObject;
}

// Hack: update to call context.resolveSchema()
function resolveSchema(schema: OpenAPIV3.ReferenceObject, document: OpenAPIV3.Document): ResolvedSchema {
    if (!schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve schema reference because of unsupported prefix: ${schema.$ref}`);
    }
    const schemaId = getSchemaIdFromReference(schema);
    if (schemaId == null) {
        throw new Error(`Failed to resolve schema reference because missing schema id: ${schema.$ref}`);
    }
    const resolvedSchema = document.components?.schemas?.[schemaId];
    if (resolvedSchema == null) {
        throw new Error(`Failed to resolve schema reference because missing: ${schema.$ref}`);
    }
    if (isReferenceObject(resolvedSchema)) {
        return resolveSchema(resolvedSchema, document);
    }
    return {
        id: schemaId,
        schema: resolvedSchema
    };
}
