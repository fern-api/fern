import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { convertPathParameter } from "./convertPathParameter";
import { convertQueryParameter } from "./convertQueryParameter";
import { convertToHttpMethod } from "./convertToHttpMethod";
import { convertToTypeReference } from "./convertToTypeReference";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export function convertToServices(endpoints: Endpoint[]): Record<RelativeFilePath, RawSchemas.HttpServiceSchema> {
    const services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema> = {};
    for (const endpoint of endpoints) {
        const { endpointId, file } = getEndpointLocation(endpoint);
        if (!(file in services)) {
            services[file] = getEmptyService();
        }
        const service = services[file];
        if (service != null) {
            if (endpointId in service.endpoints) {
                throw new Error(`Encountered duplicate endpoint id ${endpointId} in file ${file}`);
            }
            service.endpoints[endpointId] = convertToEndpoint(endpoint);
        }
    }
    return services;
}

function convertToEndpoint(endpoint: Endpoint): RawSchemas.HttpEndpointSchema {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};

    const pathParameters: Record<string, RawSchemas.HttpPathParameterSchema> = {};
    for (const pathParameter of endpoint.pathParameters) {
        const convertedPathParameter = convertPathParameter(pathParameter);
        pathParameters[pathParameter.name] = convertedPathParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedPathParameter.additionalTypeDeclarations,
        };
    }

    const queryParameters: Record<string, RawSchemas.HttpQueryParameterSchema> = {};
    for (const queryParameter of endpoint.queryParameters) {
        const convertedQueryParameter = convertQueryParameter(queryParameter);
        pathParameters[queryParameter.name] = convertedQueryParameter.value;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...convertedQueryParameter.additionalTypeDeclarations,
        };
    }

    const convertedEndpoint: RawSchemas.HttpEndpointSchema = {
        path: endpoint.path,
        method: convertToHttpMethod(endpoint.method),
    };

    if (Object.keys(pathParameters).length > 0) {
        convertedEndpoint["path-parameters"] = pathParameters;
    }

    if (Object.keys(queryParameters).length > 0) {
        convertedEndpoint.request = {
            "query-parameters": queryParameters,
        };
    }

    if (endpoint.response != null) {
        const responseTypeReference = convertToTypeReference(endpoint.response.schema);
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...responseTypeReference.additionalTypeDeclarations,
        };
        convertedEndpoint.response = {
            docs: endpoint.response.description ?? undefined,
            type: responseTypeReference.typeReference,
        };
    }

    return convertedEndpoint;
}

function getEmptyService(): RawSchemas.HttpServiceSchema {
    return {
        auth: false,
        "base-path": "",
        endpoints: {},
    };
}
