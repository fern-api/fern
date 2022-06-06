import { RawSchemas } from "@fern-api/syntax-analysis";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject, isSchemaObject, getTypeNameFromReferenceObject } from "./typeConverter";

export function convertToFernService(paths: OpenAPIV3.PathsObject): RawSchemas.HttpServiceSchema {
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
        auth: "none",
        endpoints: fernEndpoints,
    };
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
        fernHttpEndpoints[fernGetEndpoint.operationId] = fernGetEndpoint.convertedEndpoint;
    }
    if (pathItem.post !== undefined) {
        const fernPostEndpoint = getFernHttpEndpoint(pathName, pathItem.post, "POST");
        fernHttpEndpoints[fernPostEndpoint.operationId] = fernPostEndpoint.convertedEndpoint;
    }
    if (pathItem.put !== undefined) {
        const fernPutEndpoint = getFernHttpEndpoint(pathName, pathItem.put, "PUT");
        fernHttpEndpoints[fernPutEndpoint.operationId] = fernPutEndpoint.convertedEndpoint;
    }
    if (pathItem.delete !== undefined) {
        const fernDeleteEndpoint = getFernHttpEndpoint(pathName, pathItem.delete, "DELETE");
        fernHttpEndpoints[fernDeleteEndpoint.operationId] = fernDeleteEndpoint.convertedEndpoint;
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
    const openApiRequest = getRequestMaybe(httpOperation);
    request = openApiRequest === undefined ? undefined : convertToFernType(openApiRequest);

    return {
        convertedEndpoint: {
            method: httpMethod,
            path: pathName,
            parameters: getFernPathParameters(httpOperation),
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

function getRequestMaybe(httpOperation: OpenAPIV3.OperationObject) {
    return httpOperation.requestBody;
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

function getFernPathParameters(
    pathOperation: OpenAPIV3.OperationObject
): Record<string, RawSchemas.HttpParameterSchema> {
    const pathParameters: Record<string, RawSchemas.HttpParameterSchema> = {};
    pathOperation.parameters?.forEach((parameter) => {
        if (isReferenceObject(parameter)) {
            throw new Error("Converting reference type parameters is unsupported. Ref=" + parameter.$ref);
        }
        pathParameters[parameter.name] = convertToFernParameter(parameter);
    });
    return pathParameters;
}

function convertToFernParameter(parameter: OpenAPIV3.ParameterObject): RawSchemas.HttpParameterSchema {
    if (parameter.in !== "path") {
        throw new Error("Converting non path parameters is unsupported. Parameter=" + parameter.name);
    }
    if (parameter.schema !== undefined) {
        if (isSchemaObject(parameter.schema)) {
            return convertSchemaToFernParameter(parameter.schema, parameter.name);
        } else {
            throw new Error("Converting reference type parameters are unsupported. Parameter=" + parameter.in);
        }
    }
    throw new Error("Failed to convert parameter. Parameter=" + parameter.name);
}

function convertSchemaToFernParameter(
    schemaObject: OpenAPIV3.SchemaObject,
    parameterName: string
): RawSchemas.HttpParameterSchema {
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
