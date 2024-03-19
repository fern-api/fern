import { MultipartSchema, RequestWithExample } from "@fern-api/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { getExtension } from "../../../../getExtension";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../../../../schema/convertSchemas";
import {
    convertSchemaWithExampleToOptionalSchema,
    convertSchemaWithExampleToSchema
} from "../../../../schema/utils/convertSchemaWithExampleToSchema";
import { isReferenceObject } from "../../../../schema/utils/isReferenceObject";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { FernOpenAPIExtension } from "../../extensions/fernExtensions";
import { getApplicationJsonSchemaMediaObject } from "./getApplicationJsonSchema";

export const APPLICATION_JSON_CONTENT = "application/json";
export const APPLICATION_JSON_REGEX = /^application.*json$/;

export const MULTIPART_CONTENT = "multipart/form-data";

export const OCTET_STREAM = "application/octet-stream";

function getMultipartFormDataRequest(
    requestBody: OpenAPIV3.RequestBodyObject
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined {
    return requestBody.content[MULTIPART_CONTENT]?.schema;
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

    const multipartSchema = getMultipartFormDataRequest(resolvedRequestBody);
    const jsonMediaObject = getApplicationJsonSchemaMediaObject(resolvedRequestBody.content);

    // convert as application/octet-stream
    if (isOctetStreamRequest(resolvedRequestBody)) {
        return RequestWithExample.octetStream({
            description: undefined
        });
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
              };

        return RequestWithExample.multipart({
            name:
                isReferenceObject(multipartSchema) && context.getNumberOfOccurrencesForRef(multipartSchema) === 1
                    ? resolvedMultipartSchema.id
                    : undefined,
            description: undefined,
            properties: Object.entries(resolvedMultipartSchema.schema.properties ?? {}).map(([key, definition]) => {
                const required: string[] | undefined = resolvedMultipartSchema.schema.required;
                const isRequired = required !== undefined && required.includes(key);
                if (
                    !isReferenceObject(definition) &&
                    ((definition.type === "string" && definition.format === "binary") ||
                        (definition.type === "array" &&
                            !isReferenceObject(definition.items) &&
                            definition.items.type === "string" &&
                            definition.items.format === "binary"))
                ) {
                    return {
                        key,
                        schema: MultipartSchema.file({ isOptional: !isRequired, isArray: definition.type === "array" }),
                        description: undefined
                    };
                }
                const schemaWithExample = convertSchema(definition, false, context, [...requestBreadcrumbs, key]);
                const audiences = getExtension<string[]>(definition, FernOpenAPIExtension.AUDIENCES) ?? [];
                const schema = isRequired
                    ? convertSchemaWithExampleToSchema(schemaWithExample)
                    : convertSchemaWithExampleToOptionalSchema(schemaWithExample);
                return {
                    key,
                    audiences,
                    schema: MultipartSchema.json(schema),
                    description: undefined
                };
            })
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
        schema: resolvedSchema
    };
}
