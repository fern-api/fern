import { MediaType } from "@fern-api/core-utils";
import {
    MultipartRequestProperty,
    MultipartRequestPropertyEncoding,
    MultipartSchema,
    NamedFullExample,
    RequestWithExample,
    SchemaWithExample,
    Source
} from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { isAdditionalPropertiesAny } from "../../../../schema/convertAdditionalProperties";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../../../../schema/convertSchemas";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import {
    findApplicationJsonRequest,
    getApplicationJsonSchemaMediaObject,
    getExamples
} from "./getApplicationJsonSchema";

function findApplicationUrlFormEncodedRequest({
    content,
    context
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
    context: AbstractOpenAPIV3ParserContext;
}): [string, OpenAPIV3.MediaTypeObject] | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
        const result = getApplicationUrlFormEncodedRequest({ mediaType, mediaTypeObject, context });
        if (result) {
            return [mediaType, mediaTypeObject];
        }
    }
    return undefined;
}

function getApplicationUrlFormEncodedRequest({
    mediaType,
    mediaTypeObject,
    context
}: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    context: AbstractOpenAPIV3ParserContext;
}):
    | {
          schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
          contentType: string;
          examples: NamedFullExample[];
      }
    | undefined {
    if (MediaType.parse(mediaType)?.isURLEncoded()) {
        return {
            schema: mediaTypeObject.schema,
            contentType: mediaType,
            examples: getExamples(mediaTypeObject, context)
        };
    }
    return undefined;
}

function findMultipartFormDataRequest({
    content
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
}): [string, OpenAPIV3.MediaTypeObject] | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
        const result = getMultipartFormDataRequest({ mediaType, mediaTypeObject });
        if (result) {
            return [mediaType, mediaTypeObject];
        }
    }
    return undefined;
}

function getMultipartFormDataRequest({
    mediaType,
    mediaTypeObject
}: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
}):
    | {
          schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined;
          encoding: Record<string, OpenAPIV3.EncodingObject> | undefined;
      }
    | undefined {
    if (MediaType.parse(mediaType)?.isMultipart()) {
        return { schema: mediaTypeObject.schema, encoding: mediaTypeObject.encoding };
    }
    return undefined;
}

function isOctetStreamRequest({ mediaType }: { mediaType: string }): boolean {
    return MediaType.parse(mediaType)?.isBinary() ?? false;
}

function findOctetStreamRequest({
    content
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
}): [string, OpenAPIV3.MediaTypeObject] | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
        const result = isOctetStreamRequest({ mediaType });
        if (result) {
            return [mediaType, mediaTypeObject];
        }
    }
    return undefined;
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

export function convertToSingleRequest({
    content,
    description,
    document,
    context,
    requestBreadcrumbs,
    source,
    namespace
}: {
    content: Record<string, OpenAPIV3.MediaTypeObject>;
    description: string | undefined;
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
}): RequestWithExample | undefined {
    const octetStreamRequest = findOctetStreamRequest({ content });

    // convert as application/octet-stream
    if (octetStreamRequest) {
        const [mediaType, mediaTypeObject] = octetStreamRequest;
        return convertRequest({
            mediaType: mediaType,
            mediaTypeObject: mediaTypeObject,
            description,
            document,
            context,
            requestBreadcrumbs,
            source,
            namespace
        });
    }

    const multipartFormDataRequest = findMultipartFormDataRequest({ content });
    const jsonRequest = findApplicationJsonRequest({ content, context });

    // convert as application/json
    const jsonOrMultipartOrNone = multipartOrJsonOrNone({
        json: jsonRequest,
        multipart: multipartFormDataRequest,
        document,
        visitor: {
            json: ([mediaType, mediaTypeObject]) =>
                convertRequest({
                    mediaType,
                    mediaTypeObject,
                    description,
                    document,
                    context,
                    requestBreadcrumbs,
                    source,
                    namespace
                }),
            multipart: ([mediaType, mediaTypeObject]) =>
                convertRequest({
                    mediaType,
                    mediaTypeObject,
                    description,
                    document,
                    context,
                    requestBreadcrumbs,
                    source,
                    namespace
                }),
            neither: () => undefined
        }
    });
    if (jsonOrMultipartOrNone) {
        return jsonOrMultipartOrNone;
    }

    const urlEncodedRequest = findApplicationUrlFormEncodedRequest({ content, context });
    // convert as application/x-www-form-urlencoded
    if (urlEncodedRequest) {
        const [mediaType, mediaTypeObject] = urlEncodedRequest;
        return convertRequest({
            mediaType,
            mediaTypeObject,
            description,
            document,
            context,
            requestBreadcrumbs,
            source,
            namespace
        });
    }
    return undefined;
}

// JSON is preferred, unless there's a file property inside of the JSON, then multipart is preferred
// if no multipart is present, prefer JSON
// if multipart is present, and no JSON, use multipart
function multipartOrJsonOrNone<TResult, TNone>({
    json,
    multipart,
    document,
    visitor
}: {
    json: [string, OpenAPIV3.MediaTypeObject] | undefined;
    multipart: [string, OpenAPIV3.MediaTypeObject] | undefined;
    document: OpenAPIV3.Document;
    visitor: {
        json: (media: [string, OpenAPIV3.MediaTypeObject]) => TResult;
        multipart: (media: [string, OpenAPIV3.MediaTypeObject]) => TResult;
        neither: () => TNone;
    };
}) {
    if (!json && !multipart) {
        return visitor.neither();
    }
    const [, jsonMediaTypeObject] = json ?? [undefined, undefined];
    const [, multipartMediaTypeObject] = multipart ?? [undefined, undefined];

    if (!jsonMediaTypeObject?.schema && !multipartMediaTypeObject?.schema) {
        return visitor.neither();
    }

    if (jsonMediaTypeObject?.schema && multipartMediaTypeObject?.schema) {
        if (jsonMediaTypeObject.schema && multipartRequestHasFile(jsonMediaTypeObject.schema, document)) {
            return visitor.multipart(multipart as [string, OpenAPIV3.MediaTypeObject]);
        }

        return visitor.json(json as [string, OpenAPIV3.MediaTypeObject]);
    }
    if (jsonMediaTypeObject?.schema) {
        return visitor.json(json as [string, OpenAPIV3.MediaTypeObject]);
    }
    if (multipartMediaTypeObject?.schema) {
        return visitor.multipart(multipart as [string, OpenAPIV3.MediaTypeObject]);
    }

    return visitor.neither();
}

export function convertRequest({
    mediaType,
    mediaTypeObject,
    description,
    document,
    context,
    requestBreadcrumbs,
    source,
    namespace
}: {
    mediaType: string;
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
    description: string | undefined;
    document: OpenAPIV3.Document;
    context: AbstractOpenAPIV3ParserContext;
    requestBreadcrumbs: string[];
    source: Source;
    namespace: string | undefined;
}): RequestWithExample | undefined {
    const sdkMethodName = getRequestSdkMethodName({ mediaTypeObject });

    // convert as application/octet-stream
    if (isOctetStreamRequest({ mediaType })) {
        return RequestWithExample.octetStream({
            description: description,
            source,
            sdkMethodName,
            contentType: mediaType
        });
    }

    const multipartFormData = getMultipartFormDataRequest({ mediaType, mediaTypeObject });
    const multipartSchema = multipartFormData?.schema;
    const multipartEncoding = multipartFormData?.encoding;

    // convert as multipart request
    if (multipartSchema) {
        const resolvedMultipartSchema = isReferenceObject(multipartSchema)
            ? resolveSchema(multipartSchema, document)
            : {
                  id: undefined,
                  schema: multipartSchema
              };
        const convertedMultipartSchema = convertSchema(
            resolvedMultipartSchema.schema,
            false,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace,
            false
        );
        const properties: MultipartRequestProperty[] = [];
        if (convertedMultipartSchema.type === "object") {
            const requiredProperties = new Set(resolvedMultipartSchema.schema.required ?? []);
            for (const property of convertedMultipartSchema.properties) {
                const isPropertyRequired = requiredProperties.has(property.key);
                const { isFile, isOptional, isArray, description } = recursivelyCheckSchemaWithExampleIsFile({
                    schema: property.schema,
                    isOptional: !isPropertyRequired
                });
                if (isFile) {
                    const contentType = getContentType(property.key, multipartEncoding);
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional, isArray, description }),
                        description,
                        contentType,
                        exploded: false,
                        encoding: contentType == null ? context.options.defaultFormParameterEncoding : undefined
                    });
                } else {
                    const contentType = getContentType(property.key, multipartEncoding);
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.json(property.schema),
                        description: undefined,
                        contentType,
                        exploded: multipartEncoding != null ? multipartEncoding[property.key]?.explode : undefined,
                        encoding:
                            contentType == null
                                ? context.options.defaultFormParameterEncoding
                                : getMultipartPartEncodingFromContentType(contentType)
                    });
                }
            }
        }

        return RequestWithExample.multipart({
            name:
                isReferenceObject(multipartSchema) && context.getNumberOfOccurrencesForRef(multipartSchema) === 1
                    ? resolvedMultipartSchema.id
                    : undefined,
            description: resolvedMultipartSchema.schema.description,
            properties,
            source,
            sdkMethodName
        });
    }

    // convert as application/json
    const jsonMediaObject = getApplicationJsonSchemaMediaObject({ mediaType, mediaTypeObject, context });
    if (jsonMediaObject) {
        const requestSchema = convertSchema(
            jsonMediaObject.schema,
            false,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace,
            true
        );
        return RequestWithExample.json({
            description: undefined,
            schema: requestSchema,
            contentType: jsonMediaObject.contentType,
            fullExamples: jsonMediaObject.examples,
            additionalProperties:
                !isReferenceObject(jsonMediaObject.schema) &&
                isAdditionalPropertiesAny(jsonMediaObject.schema.additionalProperties, context.options),
            source,
            sdkMethodName
        });
    }

    const urlEncodedRequest = getApplicationUrlFormEncodedRequest({ mediaType, mediaTypeObject, context });
    // convert as application/x-www-form-urlencoded
    if (urlEncodedRequest != null && urlEncodedRequest.schema != null) {
        const convertedUrlEncodedSchema = convertSchema(
            urlEncodedRequest.schema,
            false,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace,
            false
        );
        return RequestWithExample.formUrlEncoded({
            schema: convertedUrlEncodedSchema,
            description,
            contentType: urlEncodedRequest.contentType,
            source,
            fullExamples: urlEncodedRequest.examples,
            additionalProperties: false,
            sdkMethodName
        });
    }
    return undefined;
}

function getRequestSdkMethodName({
    mediaTypeObject
}: {
    mediaTypeObject: OpenAPIV3.MediaTypeObject;
}): string | undefined {
    return getExtension<string>(mediaTypeObject, FernOpenAPIExtension.SDK_METHOD_NAME);
}

const CONTENT_TYPE_TO_ENCODING_MAP: Record<string, MultipartRequestPropertyEncoding> = {
    "application/json": "json"
};
function getMultipartPartEncodingFromContentType(
    contentType: string | undefined
): MultipartRequestPropertyEncoding | undefined {
    if (!contentType) {
        return undefined;
    }
    const encoding = CONTENT_TYPE_TO_ENCODING_MAP[contentType];
    return encoding;
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

function recursivelyCheckSchemaWithExampleIsFile({
    schema,
    isOptional,
    isArray,
    description
}: {
    schema: SchemaWithExample;
    isOptional?: boolean;
    isArray?: boolean;
    description?: string;
}): { isFile: boolean; isOptional: boolean; isArray: boolean; description: string | undefined } {
    if (checkSchemaWithExampleIsOptional(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional: true,
            isArray,
            description: schema.description
        });
    }
    if (checkSchemaWithExampleIsNullable(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional,
            isArray,
            description: schema.description
        });
    }
    if (checkSchemaWithExampleIsArray(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional,
            isArray: true,
            description: schema.description
        });
    }
    if (checkSchemaWithExampleIsFile(schema)) {
        return {
            isFile: true,
            isOptional: isOptional ?? false,
            isArray: isArray ?? false,
            description: description ?? schema.description
        };
    } else {
        return {
            isFile: false,
            isOptional: isOptional ?? false,
            isArray: isArray ?? false,
            description: undefined
        };
    }
}

function checkSchemaWithExampleIsFile(schema: SchemaWithExample): schema is SchemaWithExample.Primitive {
    return schema.type === "primitive" && schema.schema.type === "string" && schema.schema.format === "binary";
}

function checkSchemaWithExampleIsOptional(schema: SchemaWithExample): schema is SchemaWithExample.Optional {
    return schema.type === "optional";
}

function checkSchemaWithExampleIsNullable(schema: SchemaWithExample): schema is SchemaWithExample.Nullable {
    return schema.type === "nullable";
}

function checkSchemaWithExampleIsArray(schema: SchemaWithExample): schema is SchemaWithExample.Array {
    return schema.type === "array";
}

function getContentType(key: string, multipartEncoding: Record<string, OpenAPIV3.EncodingObject> | undefined) {
    return multipartEncoding != null ? multipartEncoding[key]?.contentType : undefined;
}
