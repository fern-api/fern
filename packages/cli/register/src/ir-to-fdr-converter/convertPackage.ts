import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry";
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
            docs: irEndpoint.docs ?? undefined,
            id: irEndpoint.name.originalName,
            name: irEndpoint.displayName ?? undefined,
            path: {
                pathParameters: [...irService.pathParameters, ...irEndpoint.pathParameters].map((pathParameter) => ({
                    docs: pathParameter.docs ?? undefined,
                    key: convertPathParameterKey(pathParameter.name.originalName),
                    type: convertTypeReference(pathParameter.valueType),
                })),
                parts: [...convertHttpPath(irService.basePath), ...convertHttpPath(irEndpoint.path)],
            },
            queryParameters: irEndpoint.queryParameters.map((queryParameter) => ({
                docs: queryParameter.docs ?? undefined,
                key: queryParameter.name.wireValue,
                type: convertTypeReference(queryParameter.valueType),
            })),
            headers: [...irService.headers, ...irEndpoint.headers].map((header) => ({
                docs: header.docs ?? undefined,
                key: header.name.wireValue,
                type: convertTypeReference(header.valueType),
            })),
            request: irEndpoint.requestBody != null ? convertRequestBody(irEndpoint.requestBody) : undefined,
            response: irEndpoint.response.type != null ? convertTypeReference(irEndpoint.response.type) : undefined,
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

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): FernRegistry.Type {
    return Ir.http.HttpRequestBody._visit<FernRegistry.Type>(irRequest, {
        inlinedRequestBody: (inlinedRequestBody) => {
            return FernRegistry.Type.object({
                extends: inlinedRequestBody.extends.map((extension) => convertTypeId(extension.typeId)),
                properties: inlinedRequestBody.properties.map((property) => ({
                    docs: property.docs ?? undefined,
                    key: property.name.wireValue,
                    valueType: convertTypeReference(property.valueType),
                })),
            });
        },
        reference: (reference) => {
            return convertTypeReference(reference.requestBodyType);
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
        docs: irExample.docs ?? undefined,
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
