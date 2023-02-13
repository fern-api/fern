import { FernOpenapiIr } from "@fern-fern/openapi-ir-sdk";
import { OpenAPIV3 } from "openapi-types";
import { convertRequest } from "./convertRequest";
import { convertSchema } from "./convertSchema";
import { resolveParameterReference } from "./resolvers";
import { getSchemaIdFromReference, isReferenceObject } from "./utils";

export interface ConvertedEndpoint {
    endpoint: FernOpenapiIr.Endpoint;
    referencedSchemas: FernOpenapiIr.SchemaId[];
}

export function convertEndpoint({
    path,
    httpMethod,
    operationObject,
    document,
}: {
    path: string;
    httpMethod: FernOpenapiIr.HttpMethod;
    operationObject: OpenAPIV3.OperationObject;
    document: OpenAPIV3.Document;
}): ConvertedEndpoint {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestName = (operationObject as any)["x-request-name"] as string | undefined;
    const convertedParameters = convertParameters({ document, operationObject });

    return {
        endpoint: {
            method: httpMethod,
            operationId: operationObject.operationId,
            path,
            requestName,
            summary: operationObject.summary,
            tags: operationObject.tags ?? [],
            request: {
                ...convertedParameters,
                requestBody: convertRequest({ document, requestBody: operationObject.requestBody }),
            },
            response: undefined,
        },
        referencedSchemas: [],
    };
}

interface ConvertedParameters {
    queryParameters: FernOpenapiIr.QueryParameter[];
    pathParameters: FernOpenapiIr.PathParameter[];
    headers: FernOpenapiIr.Header[];
}

function convertParameters({
    document,
    operationObject,
}: {
    document: OpenAPIV3.Document;
    operationObject: OpenAPIV3.OperationObject;
}): ConvertedParameters {
    const convertedParameters: ConvertedParameters = {
        queryParameters: [],
        pathParameters: [],
        headers: [],
    };
    for (const parameterObject of operationObject.parameters ?? []) {
        const resolvedParameterObject = isReferenceObject(parameterObject)
            ? resolveParameterReference({ parameter: parameterObject, document })
            : parameterObject;
        if (resolvedParameterObject == null) {
            continue;
        }
        const schema = resolvedParameterObject.schema;
        let parameterSchema;
        if (schema == null) {
            parameterSchema = FernOpenapiIr.Schema.primitive({ schema: FernOpenapiIr.PrimitiveSchemaValue.string() });
        } else if (isReferenceObject(schema)) {
            const schemaId = getSchemaIdFromReference(schema);
            if (schemaId != null) {
                parameterSchema = FernOpenapiIr.Schema.reference({
                    reference: schemaId,
                });
            } else {
                //TODO(dsinghvi): log that we failed to read parameterSchema
            }
        } else {
            const convertedSchema = convertSchema({ schema });
            if (convertedSchema != null) {
                parameterSchema = convertedSchema;
            } else {
                //TODO(dsinghvi): log that we skipped a property
            }
        }

        if (parameterSchema == null) {
            continue;
        }

        if (resolvedParameterObject.in === "query") {
            convertedParameters.queryParameters.push({
                name: resolvedParameterObject.name,
                schema: parameterSchema,
            });
        } else if (resolvedParameterObject.in === "path") {
            convertedParameters.queryParameters.push({
                name: resolvedParameterObject.name,
                schema: parameterSchema,
            });
        } else if (resolvedParameterObject.in === "header") {
            convertedParameters.headers.push({
                name: resolvedParameterObject.name,
                schema: parameterSchema,
            });
        }
    }

    return convertedParameters;
}
