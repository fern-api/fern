import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { ROOT_PREFIX } from "../convert";
import { convertPathParameter } from "./convertPathParameter";
import { convertQueryParameter } from "./convertQueryParameter";
import { convertToHttpMethod } from "./convertToHttpMethod";
import { convertToTypeReference } from "./convertToTypeReference";

export function convertEndpoint({
    endpoint,
    isPackageYml,
}: {
    endpoint: Endpoint;
    isPackageYml: boolean;
}): RawSchemas.HttpEndpointSchema {
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
        const responseTypeReference = convertToTypeReference({
            schema: endpoint.response.schema,
            prefix: isPackageYml ? undefined : ROOT_PREFIX,
        });
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
