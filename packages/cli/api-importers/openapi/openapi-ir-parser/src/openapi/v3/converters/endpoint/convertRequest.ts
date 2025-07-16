import { OpenAPIV3 } from "openapi-types"

import { MediaType } from "@fern-api/core-utils"
import {
    MultipartRequestProperty,
    MultipartRequestPropertyEncoding,
    MultipartSchema,
    NamedFullExample,
    RequestWithExample,
    SchemaWithExample,
    Source
} from "@fern-api/openapi-ir"

import { isAdditionalPropertiesAny } from "../../../../schema/convertAdditionalProperties"
import { SCHEMA_REFERENCE_PREFIX, convertSchema, getSchemaIdFromReference } from "../../../../schema/convertSchemas"
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject"
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext"
import { getApplicationJsonSchemaMediaObject, getExamples } from "./getApplicationJsonSchema"

function getApplicationUrlFormEncodedRequest(
    requestBody: OpenAPIV3.RequestBodyObject,
    context: AbstractOpenAPIV3ParserContext
):
    | {
          schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
          contentType: string
          examples: NamedFullExample[]
      }
    | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(requestBody.content)) {
        if (MediaType.parse(mediaType)?.isURLEncoded()) {
            return {
                schema: mediaTypeObject.schema,
                contentType: mediaType,
                examples: getExamples(mediaTypeObject, context)
            }
        }
    }
    return undefined
}

function getMultipartFormDataRequest(requestBody: OpenAPIV3.RequestBodyObject):
    | {
          schema: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
          encoding: Record<string, OpenAPIV3.EncodingObject> | undefined
      }
    | undefined {
    for (const [mediaType, mediaTypeObject] of Object.entries(requestBody.content)) {
        if (MediaType.parse(mediaType)?.isMultipart()) {
            return { schema: mediaTypeObject.schema, encoding: mediaTypeObject.encoding }
        }
    }
    return undefined
}

function isOctetStreamRequest(requestBody: OpenAPIV3.RequestBodyObject): boolean {
    for (const mediaType in requestBody.content) {
        if (MediaType.parse(mediaType)?.isOctetStream()) {
            return true
        }
    }
    return false
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
          }
    return (
        Object.entries(resolvedMultipartSchema.schema.properties ?? {}).find(([_, definition]) => {
            return !isReferenceObject(definition) && definition.type === "string" && definition.format === "binary"
        }) != null
    )
}

export function convertRequest({
    requestBody,
    document,
    context,
    requestBreadcrumbs,
    source,
    namespace
}: {
    requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
    document: OpenAPIV3.Document
    context: AbstractOpenAPIV3ParserContext
    requestBreadcrumbs: string[]
    source: Source
    namespace: string | undefined
}): RequestWithExample | undefined {
    const resolvedRequestBody = isReferenceObject(requestBody)
        ? context.resolveRequestBodyReference(requestBody)
        : requestBody

    const multipartFormData = getMultipartFormDataRequest(resolvedRequestBody)
    const multipartSchema = multipartFormData?.schema
    const multipartEncoding = multipartFormData?.encoding

    const urlEncodedRequest = getApplicationUrlFormEncodedRequest(resolvedRequestBody, context)

    const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedRequestBody.content, context)

    // convert as application/octet-stream
    if (isOctetStreamRequest(resolvedRequestBody)) {
        return RequestWithExample.octetStream({
            description: resolvedRequestBody.description,
            source
        })
    }

    // convert as multipart request
    if (
        (multipartSchema != null && jsonMediaObject == null) ||
        (multipartSchema != null && multipartRequestHasFile(multipartSchema, document))
    ) {
        const resolvedMultipartSchema = isReferenceObject(multipartSchema)
            ? resolveSchema(multipartSchema, document)
            : {
                  id: undefined,
                  schema: multipartSchema
              }
        const convertedMultipartSchema = convertSchema(
            resolvedMultipartSchema.schema,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace
        )
        const properties: MultipartRequestProperty[] = []
        if (convertedMultipartSchema.type === "object") {
            for (const property of convertedMultipartSchema.properties) {
                const { isFile, isOptional, isArray, description } = recursivelyCheckSchemaWithExampleIsFile({
                    schema: property.schema
                })
                if (isFile) {
                    const contentType = getContentType(property.key, multipartEncoding)
                    properties.push({
                        key: property.key,
                        schema: MultipartSchema.file({ isOptional, isArray, description }),
                        description,
                        contentType,
                        exploded: false,
                        encoding: contentType == null ? context.options.defaultFormParameterEncoding : undefined
                    })
                } else {
                    const contentType = getContentType(property.key, multipartEncoding)
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
                    })
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
            source
        })
    }

    // convert as application/json
    if (jsonMediaObject != null) {
        const requestSchema = convertSchema(
            jsonMediaObject.schema,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace,
            true
        )
        return RequestWithExample.json({
            description: undefined,
            schema: requestSchema,
            contentType: jsonMediaObject.contentType,
            fullExamples: jsonMediaObject.examples,
            additionalProperties:
                !isReferenceObject(jsonMediaObject.schema) &&
                isAdditionalPropertiesAny(jsonMediaObject.schema.additionalProperties, context.options),
            source
        })
    }

    // convert as application/x-www-form-urlencoded
    if (urlEncodedRequest != null && urlEncodedRequest.schema != null) {
        const convertedUrlEncodedSchema = convertSchema(
            urlEncodedRequest.schema,
            false,
            context,
            requestBreadcrumbs,
            source,
            namespace
        )
        return RequestWithExample.json({
            schema: convertedUrlEncodedSchema,
            description: resolvedRequestBody.description,
            contentType: urlEncodedRequest.contentType,
            source,
            fullExamples: urlEncodedRequest.examples,
            additionalProperties: false
        })
    }
    return undefined
}

const CONTENT_TYPE_TO_ENCODING_MAP: Record<string, MultipartRequestPropertyEncoding> = {
    "application/json": "json"
}
function getMultipartPartEncodingFromContentType(
    contentType: string | undefined
): MultipartRequestPropertyEncoding | undefined {
    if (!contentType) {
        return undefined
    }
    const encoding = CONTENT_TYPE_TO_ENCODING_MAP[contentType]
    return encoding
}

interface ResolvedSchema {
    id: string
    schema: OpenAPIV3.SchemaObject
}

// Hack: update to call context.resolveSchema()
function resolveSchema(schema: OpenAPIV3.ReferenceObject, document: OpenAPIV3.Document): ResolvedSchema {
    if (!schema.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Failed to resolve schema reference because of unsupported prefix: ${schema.$ref}`)
    }
    const schemaId = getSchemaIdFromReference(schema)
    if (schemaId == null) {
        throw new Error(`Failed to resolve schema reference because missing schema id: ${schema.$ref}`)
    }
    const resolvedSchema = document.components?.schemas?.[schemaId]
    if (resolvedSchema == null) {
        throw new Error(`Failed to resolve schema reference because missing: ${schema.$ref}`)
    }
    if (isReferenceObject(resolvedSchema)) {
        return resolveSchema(resolvedSchema, document)
    }
    return {
        id: schemaId,
        schema: resolvedSchema
    }
}

function recursivelyCheckSchemaWithExampleIsFile({
    schema,
    isOptional,
    isArray,
    description
}: {
    schema: SchemaWithExample
    isOptional?: boolean
    isArray?: boolean
    description?: string
}): { isFile: boolean; isOptional: boolean; isArray: boolean; description: string | undefined } {
    if (checkSchemaWithExampleIsOptional(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional: true,
            isArray,
            description: schema.description
        })
    }
    if (checkSchemaWithExampleIsNullable(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional,
            isArray,
            description: schema.description
        })
    }
    if (checkSchemaWithExampleIsArray(schema)) {
        return recursivelyCheckSchemaWithExampleIsFile({
            schema: schema.value,
            isOptional,
            isArray: true,
            description: schema.description
        })
    }
    if (checkSchemaWithExampleIsFile(schema)) {
        return {
            isFile: true,
            isOptional: isOptional ?? false,
            isArray: isArray ?? false,
            description: description ?? schema.description
        }
    } else {
        return {
            isFile: false,
            isOptional: isOptional ?? false,
            isArray: isArray ?? false,
            description: undefined
        }
    }
}

function checkSchemaWithExampleIsFile(schema: SchemaWithExample): schema is SchemaWithExample.Primitive {
    return schema.type === "primitive" && schema.schema.type === "string" && schema.schema.format === "binary"
}

function checkSchemaWithExampleIsOptional(schema: SchemaWithExample): schema is SchemaWithExample.Optional {
    return schema.type === "optional"
}

function checkSchemaWithExampleIsNullable(schema: SchemaWithExample): schema is SchemaWithExample.Nullable {
    return schema.type === "nullable"
}

function checkSchemaWithExampleIsArray(schema: SchemaWithExample): schema is SchemaWithExample.Array {
    return schema.type === "array"
}

function getContentType(key: string, multipartEncoding: Record<string, OpenAPIV3.EncodingObject> | undefined) {
    return multipartEncoding != null ? multipartEncoding[key]?.contentType : undefined
}
