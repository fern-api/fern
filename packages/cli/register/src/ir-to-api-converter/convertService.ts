import * as ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";
import { convertTypeReference } from "./convertType";
import { convertTypeNameToId } from "./convertTypeNameToId";

export function convertService(irService: ir.http.HttpService): FernRegistry.ServiceDefinition {
    return {
        name: irService.displayName ?? "My Service",
        endpoints: irService.endpoints.map((endpoint) => convertEndpoint(endpoint)),
    };
}

function convertEndpoint(irEndpoint: ir.http.HttpEndpoint): FernRegistry.Endpoint {
    return {
        path: {
            parts: [
                FernRegistry.EndpointPathPart.literal(irEndpoint.path.head),
                ...irEndpoint.path.parts.flatMap((part) => {
                    const pathParameterDefinition = irEndpoint.pathParameters.find(
                        (pathParameter) => part.pathParameter === pathParameter.name.originalName
                    );
                    if (pathParameterDefinition == null) {
                        throw new Error("Path parameter does not exist: " + part.pathParameter);
                    }
                    return [
                        FernRegistry.EndpointPathPart.pathParameter({
                            name: part.pathParameter,
                            parameterType: convertTypeReference(pathParameterDefinition.valueType),
                        }),
                        FernRegistry.EndpointPathPart.literal(part.tail),
                    ];
                }),
            ],
        },
        request: irEndpoint.requestBody != null ? convertRequest(irEndpoint.requestBody) : undefined,
        response: irEndpoint.response.type != null ? convertTypeReference(irEndpoint.response.type) : undefined,
    };
}

function convertRequest(irRequestBody: ir.http.HttpRequestBody): FernRegistry.TypeReference {
    return ir.http.HttpRequestBody._visit(irRequestBody, {
        inlinedRequestBody: (inlinedRequestBody) =>
            FernRegistry.TypeReference.definition(
                FernRegistry.TypeDefinition.object({
                    extends: inlinedRequestBody.extends.map((extension) => convertTypeNameToId(extension)),
                    properties: inlinedRequestBody.properties.map((property) => ({
                        key: property.name.wireValue,
                        valueType: convertTypeReference(property.valueType),
                    })),
                })
            ),
        reference: ({ requestBodyType }) => convertTypeReference(requestBodyType),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + irRequestBody.type);
        },
    });
}
