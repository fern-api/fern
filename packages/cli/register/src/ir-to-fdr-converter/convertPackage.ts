import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";
import { HttpBodyShape } from "@fern-fern/registry/api";
import { startCase } from "lodash-es";
import { convertTypeId, convertTypeReference } from "./convertTypeShape";

export function convertPackage(
    irPackage: Ir.ir.Package,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.ApiDefinitionPackage {
    const service = irPackage.service != null ? ir.services[irPackage.service] : undefined;
    return {
        endpoints: service != null ? convertService(service, ir) : [],
        types: irPackage.types.map((typeId) => convertTypeId(typeId)),
        subpackages: irPackage.subpackages.map((subpackageId) => convertSubpackageId(subpackageId)),
    };
}

function convertService(
    irService: Ir.http.HttpService,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.EndpointDefinition[] {
    return irService.endpoints.map(
        (irEndpoint): FernRegistry.EndpointDefinition => ({
            description: irEndpoint.docs ?? undefined,
            id: irEndpoint.name.originalName,
            name: irEndpoint.displayName ?? startCase(irEndpoint.name.originalName),
            path: {
                pathParameters: [...irService.pathParameters, ...irEndpoint.pathParameters].map(
                    (pathParameter): FernRegistry.PathParameter => ({
                        description: pathParameter.docs ?? undefined,
                        key: convertPathParameterKey(pathParameter.name.originalName),
                        type: convertTypeReference(pathParameter.valueType),
                    })
                ),
                parts: [...convertHttpPath(irService.basePath), ...convertHttpPath(irEndpoint.path)],
            },
            queryParameters: irEndpoint.queryParameters.map(
                (queryParameter): FernRegistry.QueryParameter => ({
                    description: queryParameter.docs ?? undefined,
                    key: queryParameter.name.wireValue,
                    type: convertTypeReference(queryParameter.valueType),
                })
            ),
            headers: [...irService.headers, ...irEndpoint.headers].map(
                (header): FernRegistry.Header => ({
                    description: header.docs ?? undefined,
                    key: header.name.wireValue,
                    type: convertTypeReference(header.valueType),
                })
            ),
            request: irEndpoint.requestBody != null ? convertRequestBody(irEndpoint.requestBody) : undefined,
            response:
                irEndpoint.response != null
                    ? {
                          description: irEndpoint.response.docs ?? undefined,
                          type: HttpBodyShape.reference(convertTypeReference(irEndpoint.response.responseBodyType)),
                      }
                    : undefined,
            examples: irEndpoint.examples.map((example) => convertExampleEndpointCall(example, ir)),
        })
    );
}

function convertHttpPath(irPath: Ir.http.HttpPath): FernRegistry.EndpointPathPart[] {
    return [
        FernRegistry.EndpointPathPart.literal(irPath.head),
        ...irPath.parts.flatMap((part) => [
            FernRegistry.EndpointPathPart.pathParameter(convertPathParameterKey(part.pathParameter)),
            FernRegistry.EndpointPathPart.literal(part.tail),
        ]),
    ];
}

function convertPathParameterKey(irPathParameterKey: string): FernRegistry.PathParameterKey {
    return FernRegistry.PathParameterKey(irPathParameterKey);
}

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): FernRegistry.HttpBody {
    return Ir.http.HttpRequestBody._visit<FernRegistry.HttpBody>(irRequest, {
        inlinedRequestBody: (inlinedRequestBody) => {
            return {
                description: undefined,
                type: FernRegistry.HttpBodyShape.object({
                    extends: inlinedRequestBody.extends.map((extension) => convertTypeId(extension.typeId)),
                    properties: inlinedRequestBody.properties.map(
                        (property): FernRegistry.ObjectProperty => ({
                            description: property.docs ?? undefined,
                            key: property.name.wireValue,
                            valueType: convertTypeReference(property.valueType),
                        })
                    ),
                }),
            };
        },
        reference: (reference) => {
            return {
                description: reference.docs ?? undefined,
                type: FernRegistry.HttpBodyShape.reference(convertTypeReference(reference.requestBodyType)),
            };
        },
        fileUpload: () => {
            throw new Error("File upload is not supported: " + irRequest.type);
        },
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + irRequest.type);
        },
    });
}

function convertExampleEndpointCall(
    irExample: Ir.http.ExampleEndpointCall,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.ExampleEndpointCall {
    return {
        description: irExample.docs ?? undefined,
        url: irExample.url,
        pathParameters: [...irExample.servicePathParameters, ...irExample.endpointPathParameters].reduce<
            FernRegistry.ExampleEndpointCall["pathParameters"]
        >((pathParameters, irPathParameterExample) => {
            pathParameters[convertPathParameterKey(irPathParameterExample.key)] =
                irPathParameterExample.value.jsonExample;
            return pathParameters;
        }, {}),
        queryParameters: irExample.queryParameters.reduce<FernRegistry.ExampleEndpointCall["queryParameters"]>(
            (queryParameters, irQueryParameterExample) => {
                queryParameters[irQueryParameterExample.wireKey] = irQueryParameterExample.value.jsonExample;
                return queryParameters;
            },
            {}
        ),
        headers: [...irExample.serviceHeaders, ...irExample.endpointHeaders].reduce<
            FernRegistry.ExampleEndpointCall["headers"]
        >((headers, irHeaderExample) => {
            headers[irHeaderExample.wireKey] = irHeaderExample.value.jsonExample;
            return headers;
        }, {}),
        requestBody: irExample.request?.jsonExample,
        responseStatusCode: Ir.http.ExampleResponse._visit(irExample.response, {
            ok: ({ body }) => (body != null ? 200 : 204),
            error: ({ error: errorName }) => {
                const error = ir.errors[errorName.errorId];
                if (error == null) {
                    throw new Error("Cannot find error " + errorName.errorId);
                }
                return error.statusCode;
            },
            _unknown: () => {
                throw new Error("Unknown ExampleResponse: " + irExample.response.type);
            },
        }),
        responseBody: irExample.response.body?.jsonExample,
    };
}

export function convertSubpackageId(irSubpackageId: Ir.commons.SubpackageId): FernRegistry.SubpackageId {
    return FernRegistry.SubpackageId(irSubpackageId);
}
