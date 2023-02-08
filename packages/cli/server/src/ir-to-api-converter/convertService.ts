import * as ir from "@fern-fern/ir-model";
import { FernApi } from "../generated";
import { convertTypeReference } from "./convertType";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertService(irService: ir.http.HttpService): FernApi.api.Service {
    return {
        endpoints: irService.endpoints.map((endpoint) => convertEndpoint(endpoint)),
    };
}

function convertEndpoint(irEndpoint: ir.http.HttpEndpoint): FernApi.api.Endpoint {
    return {
        path: {
            parts: [
                FernApi.api.EndpointPathPart.literal(irEndpoint.path.head),
                ...irEndpoint.path.parts.flatMap((part) => {
                    const pathParameterDefinition = irEndpoint.pathParameters.find(
                        (pathParameter) => part.pathParameter === pathParameter.name.originalName
                    );
                    if (pathParameterDefinition == null) {
                        throw new Error("Path parameter does not exist: " + part.pathParameter);
                    }
                    return [
                        FernApi.api.EndpointPathPart.pathParameter({
                            name: part.pathParameter,
                            parameterType: convertTypeReference(pathParameterDefinition.valueType),
                        }),
                        FernApi.api.EndpointPathPart.literal(part.tail),
                    ];
                }),
            ],
        },
        request: irEndpoint.requestBody != null ? convertRequest(irEndpoint.requestBody) : undefined,
        response: irEndpoint.response.type != null ? convertTypeReference(irEndpoint.response.type) : undefined,
    };
}

function convertRequest(irRequestBody: ir.http.HttpRequestBody): FernApi.api.TypeReference {
    return ir.http.HttpRequestBody._visit(irRequestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            FernApi.api.TypeReference.definition(
                FernApi.api.TypeDefinition.object({
                    extends: inlinedRequestBody.extends.map((extension) => convertTypeNameToId(extension)),
                    properties: inlinedRequestBody.properties.map((property) => ({
                        key: property.name.wireValue,
                        value: convertTypeReference(property.valueType),
                    })),
                })
            ),
        reference: ({ requestBodyType }) => convertTypeReference(requestBodyType),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + irRequestBody.type);
        },
    });
}
