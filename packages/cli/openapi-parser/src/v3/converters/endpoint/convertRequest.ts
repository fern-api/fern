import { MultipartSchema, Request } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { AbstractOpenAPIV3ParserContext } from "../../AbstractOpenAPIV3ParserContext";
import { isReferenceObject } from "../../utils/isReferenceObject";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../convertSchemas";

const APPLICATION_JSON_CONTENT = "application/json";
const APPLICATION_JSON_UTF_8_CONTENT = "application/json; charset=utf-8";
const MULTIPART_CONTENT = "multipart/form-data";

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

    // convert as multipart request
    const multipartSchema = resolvedRequestBody.content[MULTIPART_CONTENT]?.schema;
    if (multipartSchema != null) {
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
    const requestBodySchema =
        resolvedRequestBody.content[APPLICATION_JSON_CONTENT]?.schema ??
        resolvedRequestBody.content[APPLICATION_JSON_UTF_8_CONTENT]?.schema;
    if (requestBodySchema == null) {
        return undefined;
    }
    const requestSchema = convertSchema(requestBodySchema, false, context, requestBreadcrumbs, true);
    return Request.json({
        description: undefined,
        schema: requestSchema,
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
