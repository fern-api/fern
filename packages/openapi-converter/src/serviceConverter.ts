import { RawSchemas } from "@fern-api/yaml-schema";
import lowerFirst from "lodash-es/lowerFirst";
import { OpenAPIV3 } from "openapi-types";
import { getTypeNameFromReferenceObject } from "./typeConverter";
import { OpenApiSecuritySchemes } from "./types";
import { isReferenceObject, isSchemaObject } from "./utils";

export function convertToFernService(
    paths: OpenAPIV3.PathsObject,
    securitySchemes: undefined | OpenApiSecuritySchemes
): RawSchemas.HttpServiceSchema {
    const fernEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
    for (const pathName of Object.keys(paths)) {
        const pathEndpoints = paths[pathName];
        if (pathEndpoints == null) {
            continue;
        }
        const convertedEndponts = convertToFernEndpoint(pathName, pathEndpoints);
        Object.entries(convertedEndponts).forEach((convertedEndpoint) => {
            fernEndpoints[convertedEndpoint[0]] = convertedEndpoint[1];
        });
    }
    return {
        auth: securitySchemes != null,
        endpoints: fernEndpoints,
    };
}

function convertToFernEndpoint(
    pathName: string,
    pathItem: OpenAPIV3.PathItemObject
): Record<string, RawSchemas.HttpEndpointSchema> {
    const fernHttpEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
    if (pathItem.get != null) {
        const fernGetEndpoint = getFernHttpEndpoint(pathName, pathItem.get, "GET");
        fernHttpEndpoints[lowerFirst(fernGetEndpoint.operationId)] = fernGetEndpoint.convertedEndpoint;
    }
    if (pathItem.post != null) {
        const fernPostEndpoint = getFernHttpEndpoint(pathName, pathItem.post, "POST");
        fernHttpEndpoints[lowerFirst(fernPostEndpoint.operationId)] = fernPostEndpoint.convertedEndpoint;
    }
    if (pathItem.put != null) {
        const fernPutEndpoint = getFernHttpEndpoint(pathName, pathItem.put, "PUT");
        fernHttpEndpoints[lowerFirst(fernPutEndpoint.operationId)] = fernPutEndpoint.convertedEndpoint;
    }
    if (pathItem.delete != null) {
        const fernDeleteEndpoint = getFernHttpEndpoint(pathName, pathItem.delete, "DELETE");
        fernHttpEndpoints[lowerFirst(fernDeleteEndpoint.operationId)] = fernDeleteEndpoint.convertedEndpoint;
    }
    // TODO(dsinghvi): handle patch endpoints
    // if (pathItem.patch != null) {
    // }
    return fernHttpEndpoints;
}

interface ConvertedHttpEndpointResponse {
    convertedEndpoint: RawSchemas.HttpEndpointSchema;
    operationId: string;
}

function getFernHttpEndpoint(
    pathName: string,
    httpOperation: OpenAPIV3.OperationObject,
    httpMethod: "GET" | "PUT" | "POST" | "DELETE"
): ConvertedHttpEndpointResponse {
    const operationId = getOperationIdOrThrow(httpOperation);

    let response: string | undefined = undefined;
    const openApiResponse = getResponseMaybe(httpOperation);
    response = openApiResponse == null ? undefined : convertToFernType(openApiResponse);

    let request: string | undefined = undefined;
    const openApiRequest = httpOperation.requestBody;
    request = openApiRequest == null ? undefined : convertToFernType(openApiRequest);

    const convertedParameters = getFernPathParameters(httpOperation);
    return {
        convertedEndpoint: {
            method: httpMethod,
            path: pathName,
            "path-parameters": convertedParameters.pathParameters,
            "query-parameters": convertedParameters.queryParameters,
            docs: httpOperation.description,
            response,
            request,
        },
        operationId,
    };
}

function getResponseMaybe(
    httpOperation: OpenAPIV3.OperationObject
): OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject | undefined {
    if (httpOperation.responses["200"] != null) {
        return httpOperation.responses["200"];
    } else if (httpOperation.responses["201"] != null) {
        return httpOperation.responses["201"];
    }
    return undefined;
}

function getOperationIdOrThrow(httpOperation: OpenAPIV3.OperationObject): string {
    if (httpOperation.operationId == null) {
        throw new Error("Failed to retrieve operationId for path.");
    }
    return httpOperation.operationId;
}

function convertToFernType(
    response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): string {
    if (isReferenceObject(response)) {
        return getTypeNameFromReferenceObject(response);
    } else if (response.content != null) {
        for (const contentType in response.content) {
            if (contentType.includes("json")) {
                const responseMediaInfo = response.content[contentType];
                if (responseMediaInfo?.schema != null) {
                    if (isReferenceObject(responseMediaInfo.schema)) {
                        return getTypeNameFromReferenceObject(responseMediaInfo.schema);
                    }
                }
            }
        }
    }
    throw new Error("Failed to convert response object to fern response");
}

interface ConvertedParameters {
    pathParameters: Record<string, RawSchemas.HttpPathParameterSchema>;
    queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema>;
}

function getFernPathParameters(pathOperation: OpenAPIV3.OperationObject): ConvertedParameters {
    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    pathOperation.parameters?.forEach((parameter) => {
        if (isReferenceObject(parameter)) {
            throw new Error("Converting reference type parameters is unsupported. Ref=" + parameter.$ref);
        }
        if (parameter.in === "path") {
            pathParameters[parameter.name] = convertToFernParameter(parameter);
        } else if (parameter.in === "query") {
            let convertedParameter = convertToFernParameter(parameter);
            if (!parameter.required) {
                convertedParameter = `optional<${convertedParameter}>`;
            }
            queryParameters[parameter.name] = convertedParameter;
        }
    });
    return {
        pathParameters,
        queryParameters,
    };
}

function convertToFernParameter(parameter: OpenAPIV3.ParameterObject): string {
    if (parameter.schema != null) {
        if (isSchemaObject(parameter.schema)) {
            return convertSchemaToFernParameter(parameter.schema, parameter.name);
        } else {
            throw new Error("Converting reference type parameters are unsupported. Parameter=" + parameter.in);
        }
    }
    throw new Error("Failed to convert parameter. Parameter=" + parameter.name);
}

function convertSchemaToFernParameter(schemaObject: OpenAPIV3.SchemaObject, parameterName: string): string {
    if (schemaObject.type == undefined) {
        throw new Error("Expected parameter schemas to have type. Parameter=" + parameterName);
    }
    if (schemaObject.type === "array") {
        throw new Error("List parameters are unsupported. Parameter=" + parameterName);
    } else if (schemaObject.type == "boolean") {
        return "boolean";
    } else if (schemaObject.type == "integer") {
        return "integer";
    } else if (schemaObject.type == "number") {
        return "double";
    } else if (schemaObject.type == "string") {
        return "string";
    }
    throw new Error("Failed to convert parameter. Parameter=" + parameterName);
}
