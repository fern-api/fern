import { MultipartSchema, Request } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../../isReferenceObject";
import { convertSchema, getSchemaIdFromReference, SCHEMA_REFERENCE_PREFIX } from "../convertSchemas";

const APPLICATION_JSON_CONTENT = "application/json";
const MULTIPART_CONTENT = "multipart/form-data";

export interface ConvertedRequest {
    name?: string | undefined;
    value: Request;
}

export function convertRequest({
    requestBody,
    document,
}: {
    requestBody: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject;
    document: OpenAPIV3.Document;
}): ConvertedRequest | undefined {
    if (isReferenceObject(requestBody)) {
        throw new Error(`Converting referenced request body is unsupported: ${JSON.stringify(requestBody)}`);
    }

    // convert as multipart request
    const multipartSchema = requestBody.content[MULTIPART_CONTENT]?.schema;
    if (multipartSchema != null) {
        const resolvedMultipartSchema = isReferenceObject(multipartSchema)
            ? resolveSchema(multipartSchema, document)
            : {
                  id: undefined,
                  schema: multipartSchema,
              };

        return {
            name: resolvedMultipartSchema.id,
            value: Request.multipart({
                description: undefined,
                properties: Object.entries(resolvedMultipartSchema.schema.properties ?? {}).map(([key, definition]) => {
                    if (
                        !isReferenceObject(definition) &&
                        definition.type === "string" &&
                        definition.format === "binary"
                    ) {
                        return {
                            key,
                            schema: MultipartSchema.file(),
                            description: undefined,
                        };
                    }
                    return {
                        key,
                        schema: MultipartSchema.json(convertSchema(definition, false)),
                        description: undefined,
                    };
                }),
            }),
        };
    }

    // otherwise, convert as json request.
    const requestBodySchema = requestBody.content[APPLICATION_JSON_CONTENT]?.schema;
    if (requestBodySchema == null) {
        return undefined;
    }
    const requestSchema = convertSchema(requestBodySchema, false);
    return {
        value: Request.json({
            description: undefined,
            schema: requestSchema,
        }),
    };
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
