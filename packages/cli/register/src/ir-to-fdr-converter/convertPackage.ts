import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";
import { startCase } from "lodash-es";
import { convertTypeId, convertTypeReference } from "./convertTypeShape";

export function convertPackage(
    irPackage: Ir.ir.Package,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.api.v1.register.ApiDefinitionPackage {
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
): FernRegistry.api.v1.register.EndpointDefinition[] {
    return irService.endpoints.map(
        (irEndpoint): FernRegistry.api.v1.register.EndpointDefinition => ({
            description: irEndpoint.docs ?? undefined,
            method: convertHttpMethod(irEndpoint.method),
            id: FernRegistry.api.v1.register.EndpointId(irEndpoint.name.originalName),
            name: irEndpoint.displayName ?? startCase(irEndpoint.name.originalName),
            path: {
                pathParameters: [...irService.pathParameters, ...irEndpoint.pathParameters].map(
                    (pathParameter): FernRegistry.api.v1.register.PathParameter => ({
                        description: pathParameter.docs ?? undefined,
                        key: convertPathParameterKey(pathParameter.name.originalName),
                        type: convertTypeReference(pathParameter.valueType),
                    })
                ),
                parts: [...convertHttpPath(irService.basePath), ...convertHttpPath(irEndpoint.path)],
            },
            queryParameters: irEndpoint.queryParameters.map(
                (queryParameter): FernRegistry.api.v1.register.QueryParameter => ({
                    description: queryParameter.docs ?? undefined,
                    key: queryParameter.name.wireValue,
                    type: convertTypeReference(queryParameter.valueType),
                })
            ),
            headers: [...irService.headers, ...irEndpoint.headers].map(
                (header): FernRegistry.api.v1.register.Header => ({
                    description: header.docs ?? undefined,
                    key: header.name.wireValue,
                    type: convertTypeReference(header.valueType),
                })
            ),
            request: irEndpoint.requestBody != null ? convertRequestBody(irEndpoint.requestBody) : undefined,
            response:
                irEndpoint.response != null ? convertResponseBody(irEndpoint.response.responseBodyType) : undefined,
            examples: irEndpoint.examples.map((example) => convertExampleEndpointCall(example, ir)),
        })
    );
}

function convertHttpMethod(method: Ir.http.HttpMethod): FernRegistry.api.v1.register.HttpMethod {
    return Ir.http.HttpMethod._visit<FernRegistry.api.v1.register.HttpMethod>(method, {
        get: () => FernRegistry.api.v1.register.HttpMethod.Get,
        post: () => FernRegistry.api.v1.register.HttpMethod.Post,
        put: () => FernRegistry.api.v1.register.HttpMethod.Put,
        patch: () => FernRegistry.api.v1.register.HttpMethod.Patch,
        delete: () => FernRegistry.api.v1.register.HttpMethod.Delete,
        _unknown: () => {
            throw new Error("Unknown http method: " + method);
        },
    });
}

function convertHttpPath(irPath: Ir.http.HttpPath): FernRegistry.api.v1.register.EndpointPathPart[] {
    return [
        FernRegistry.api.v1.register.EndpointPathPart.literal(irPath.head),
        ...irPath.parts.flatMap((part) => [
            FernRegistry.api.v1.register.EndpointPathPart.pathParameter(convertPathParameterKey(part.pathParameter)),
            FernRegistry.api.v1.register.EndpointPathPart.literal(part.tail),
        ]),
    ];
}

function convertPathParameterKey(irPathParameterKey: string): FernRegistry.api.v1.register.PathParameterKey {
    return FernRegistry.api.v1.register.PathParameterKey(irPathParameterKey);
}

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): FernRegistry.api.v1.register.HttpBody {
    return {
        type: Ir.http.HttpRequestBody._visit<FernRegistry.api.v1.register.HttpBodyShape>(irRequest, {
            inlinedRequestBody: (inlinedRequestBody) => {
                return FernRegistry.api.v1.register.HttpBodyShape.object({
                    extends: inlinedRequestBody.extends.map((extension) => convertTypeId(extension.typeId)),
                    properties: inlinedRequestBody.properties.map(
                        (property): FernRegistry.api.v1.register.ObjectProperty => ({
                            description: property.docs ?? undefined,
                            key: property.name.wireValue,
                            valueType: convertTypeReference(property.valueType),
                        })
                    ),
                });
            },
            reference: (reference) => {
                return FernRegistry.api.v1.register.HttpBodyShape.reference(
                    convertTypeReference(reference.requestBodyType)
                );
            },
            fileUpload: () => {
                throw new Error("File upload is not supported: " + irRequest.type);
            },
            _unknown: () => {
                throw new Error("Unknown HttpRequestBody: " + irRequest.type);
            },
        }),
    };
}

function convertResponseBody(irResponse: Ir.types.TypeReference): FernRegistry.api.v1.register.HttpBody {
    return {
        type: FernRegistry.api.v1.register.HttpBodyShape.reference(convertTypeReference(irResponse)),
    };
}

function convertExampleEndpointCall(
    irExample: Ir.http.ExampleEndpointCall,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.api.v1.register.ExampleEndpointCall {
    return {
        description: irExample.docs ?? undefined,
        path: irExample.url,
        pathParameters: [...irExample.servicePathParameters, ...irExample.endpointPathParameters].reduce<
            FernRegistry.api.v1.register.ExampleEndpointCall["pathParameters"]
        >((pathParameters, irPathParameterExample) => {
            pathParameters[convertPathParameterKey(irPathParameterExample.key)] =
                irPathParameterExample.value.jsonExample;
            return pathParameters;
        }, {}),
        queryParameters: irExample.queryParameters.reduce<
            FernRegistry.api.v1.register.ExampleEndpointCall["queryParameters"]
        >((queryParameters, irQueryParameterExample) => {
            queryParameters[irQueryParameterExample.wireKey] = irQueryParameterExample.value.jsonExample;
            return queryParameters;
        }, {}),
        headers: [...irExample.serviceHeaders, ...irExample.endpointHeaders].reduce<
            FernRegistry.api.v1.register.ExampleEndpointCall["headers"]
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

export function convertSubpackageId(
    irSubpackageId: Ir.commons.SubpackageId
): FernRegistry.api.v1.register.SubpackageId {
    return FernRegistry.api.v1.register.SubpackageId(irSubpackageId);
}
