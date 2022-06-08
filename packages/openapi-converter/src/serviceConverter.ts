import { RawSchemas } from "@fern-api/syntax-analysis";
import { OpenAPIV3 } from "openapi-types";
import { lowerFirst } from "lodash";
import { getTypeNameFromReferenceObject } from "./typeConverter";
import { isReferenceObject, isSchemaObject } from "./utils";
import { OpenApiSecuritySchemes } from "./types";

export function convertToFernService(
    paths: OpenAPIV3.PathsObject,
    securitySchemes: undefined | OpenApiSecuritySchemes
): RawSchemas.HttpServiceSchema {
    const fernEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
    for (const pathName of Object.keys(paths)) {
        const pathEndpoints = paths[pathName];
        if (pathEndpoints === undefined) {
            continue;
        }
        const convertedEndponts = convertToFernEndpoint(pathName, pathEndpoints);
        Object.entries(convertedEndponts).forEach((convertedEndpoint) => {
            fernEndpoints[convertedEndpoint[0]] = convertedEndpoint[1];
        });
    }
    return {
        auth: convertToFernAuth(securitySchemes),
        endpoints: fernEndpoints,
    };
}

function convertToFernAuth(securitySchemes: undefined | OpenApiSecuritySchemes) {
    if (securitySchemes !== undefined) {
        for (const key of Object.keys(securitySchemes)) {
            const securitySchemeValue = securitySchemes[key];
            if (
                securitySchemeValue !== undefined &&
                !isReferenceObject(securitySchemeValue) &&
                (securitySchemeValue.type === "oauth2" || securitySchemeValue.type === "http")
            ) {
                return "bearer";
            }
        }
    }
    return "none";
}

function convertToFernEndpoint(
    pathName: string,
    pathItem: OpenAPIV3.PathItemObject
): Record<string, RawSchemas.HttpEndpointSchema> {
    const fernHttpEndpoints: Record<string, RawSchemas.HttpEndpointSchema> = {};
    if (pathItem === undefined) {
        return fernHttpEndpoints;
    }
    if (pathItem.get !== undefined) {
        const fernGetEndpoint = getFernHttpEndpoint(pathName, pathItem.get, "GET");
        fernHttpEndpoints[lowerFirst(fernGetEndpoint.operationId)] = fernGetEndpoint.convertedEndpoint;
    }
    if (pathItem.post !== undefined) {
        const fernPostEndpoint = getFernHttpEndpoint(pathName, pathItem.post, "POST");
        fernHttpEndpoints[lowerFirst(fernPostEndpoint.operationId)] = fernPostEndpoint.convertedEndpoint;
    }
    if (pathItem.put !== undefined) {
        const fernPutEndpoint = getFernHttpEndpoint(pathName, pathItem.put, "PUT");
        fernHttpEndpoints[lowerFirst(fernPutEndpoint.operationId)] = fernPutEndpoint.convertedEndpoint;
    }
    if (pathItem.delete !== undefined) {
        const fernDeleteEndpoint = getFernHttpEndpoint(pathName, pathItem.delete, "DELETE");
        fernHttpEndpoints[lowerFirst(fernDeleteEndpoint.operationId)] = fernDeleteEndpoint.convertedEndpoint;
    }
    // TODO(dsinghvi): handle patch endpoints
    // if (pathItem.patch !== undefined) {
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

    let response: RawSchemas.TypeDefinitionSchema | string | undefined = undefined;
    const openApiResponse = getResponseMaybe(httpOperation);
    response = openApiResponse === undefined ? undefined : convertToFernType(openApiResponse);

    let request: RawSchemas.TypeDefinitionSchema | string | undefined = undefined;
    const openApiRequest = httpOperation.requestBody;
    request = openApiRequest === undefined ? undefined : convertToFernType(openApiRequest);

    const convertedParameters = getFernPathParameters(httpOperation);
    return {
        convertedEndpoint: {
            method: httpMethod,
            path: pathName,
            parameters: convertedParameters.pathParameters,
            queryParameters: convertedParameters.queryParameters,
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
    if (httpOperation.responses["200"] !== undefined) {
        return httpOperation.responses["200"];
    } else if (httpOperation.responses["201"] !== undefined) {
        return httpOperation.responses["201"];
    }
    return undefined;
}

function getOperationIdOrThrow(httpOperation: OpenAPIV3.OperationObject): string {
    if (httpOperation.operationId === undefined) {
        throw new Error("Failed to retrieve operationId for path.");
    }
    return httpOperation.operationId;
}

function convertToFernType(
    response: OpenAPIV3.ResponseObject | OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): RawSchemas.TypeDefinitionSchema | string {
    if (isReferenceObject(response)) {
        return getTypeNameFromReferenceObject(response);
    } else if (response.content !== undefined) {
        for (const contentType in response.content) {
            if (contentType.includes("json")) {
                const responseMediaInfo = response.content[contentType];
                if (responseMediaInfo !== undefined && responseMediaInfo.schema !== undefined) {
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
    pathParameters: Record<string, RawSchemas.HttpParameterSchema>;
    queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema>;
}

function getFernPathParameters(pathOperation: OpenAPIV3.OperationObject): ConvertedParameters {
    const pathParameters: Record<string, RawSchemas.HttpParameterSchema> = {};
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
    if (parameter.schema !== undefined) {
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
