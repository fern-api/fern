import { assertNever } from "@fern-api/core-utils";
import * as Ir from "@fern-fern/ir-model";
import { FernRegistry } from "@fern-fern/registry-node";
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
        pointsTo:
            irPackage.navigationConfig != null ? convertSubpackageId(irPackage.navigationConfig.pointsTo) : undefined,
    };
}

function convertService(
    irService: Ir.http.HttpService,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.api.v1.register.EndpointDefinition[] {
    return irService.endpoints.map(
        (irEndpoint): FernRegistry.api.v1.register.EndpointDefinition => ({
            auth: irEndpoint.auth,
            description: irEndpoint.docs ?? undefined,
            method: convertHttpMethod(irEndpoint.method),
            defaultEnvironment:
                ir.environments?.defaultEnvironment != null
                    ? FernRegistry.api.v1.register.EnvironmentId(ir.environments.defaultEnvironment)
                    : undefined,
            environments:
                ir.environments != null
                    ? convertIrEnvironments({ environmentsConfig: ir.environments, endpoint: irEndpoint })
                    : undefined,
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
            response: irEndpoint.response != null ? convertResponse(irEndpoint.response) : undefined,
            errors: convertResponseErrors(irEndpoint.errors, ir),
            examples: irEndpoint.examples.map((example) => convertExampleEndpointCall(example, ir)),
        })
    );
}

function convertIrEnvironments({
    environmentsConfig,
    endpoint,
}: {
    environmentsConfig: Ir.environment.EnvironmentsConfig;
    endpoint: Ir.http.HttpEndpoint;
}): FernRegistry.api.v1.register.Environment[] {
    const environmentsConfigValue = environmentsConfig.environments;
    const endpointBaseUrlId = endpoint.baseUrl;
    switch (environmentsConfigValue.type) {
        case "singleBaseUrl":
            return environmentsConfigValue.environments.map((singleBaseUrlEnvironment) => {
                return {
                    id: FernRegistry.api.v1.register.EnvironmentId(singleBaseUrlEnvironment.id),
                    baseUrl: singleBaseUrlEnvironment.url,
                };
            });
        case "multipleBaseUrls":
            if (endpointBaseUrlId == null) {
                throw new Error(`Expected endpoint ${endpoint.name.originalName} to have base url.`);
            }
            return environmentsConfigValue.environments.map((singleBaseUrlEnvironment) => {
                const endpointBaseUrl = singleBaseUrlEnvironment.urls[endpointBaseUrlId];
                if (endpointBaseUrl == null) {
                    throw new Error(
                        `Expected environment ${singleBaseUrlEnvironment.id} to contain url for ${endpointBaseUrlId}`
                    );
                }
                return {
                    id: FernRegistry.api.v1.register.EnvironmentId(singleBaseUrlEnvironment.id),
                    baseUrl: endpointBaseUrl,
                };
            });
        default:
            assertNever(environmentsConfigValue);
    }
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

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): FernRegistry.api.v1.register.HttpRequest | undefined {
    const requestBodyShape = Ir.http.HttpRequestBody._visit<
        FernRegistry.api.v1.register.HttpRequestBodyShape | undefined
    >(irRequest, {
        inlinedRequestBody: (inlinedRequestBody) => {
            return FernRegistry.api.v1.register.HttpRequestBodyShape.json({
                contentType: inlinedRequestBody.contentType ?? "application/json",
                shape: FernRegistry.api.v1.register.JsonRequestBodyShape.object(
                    FernRegistry.api.v1.register.HttpRequestBodyShape.object({
                        extends: inlinedRequestBody.extends.map((extension) => convertTypeId(extension.typeId)),
                        properties: inlinedRequestBody.properties.map(
                            (property): FernRegistry.api.v1.register.ObjectProperty => ({
                                description: property.docs ?? undefined,
                                key: property.name.wireValue,
                                valueType: convertTypeReference(property.valueType),
                            })
                        ),
                    })
                ),
            });
        },
        reference: (reference) => {
            return FernRegistry.api.v1.register.HttpRequestBodyShape.json({
                contentType: reference.contentType ?? "application/json",
                shape: FernRegistry.api.v1.register.JsonRequestBodyShape.reference(
                    convertTypeReference(reference.requestBodyType)
                ),
            });
        },
        fileUpload: () => FernRegistry.api.v1.register.HttpRequestBodyShape.fileUpload(),
        bytes: () => {
            return undefined;
        },
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + irRequest.type);
        },
    });
    return requestBodyShape != null ? { type: requestBodyShape } : undefined;
}

function convertResponse(irResponse: Ir.http.HttpResponse): FernRegistry.api.v1.register.HttpResponse | undefined {
    const type = Ir.http.HttpResponse._visit<FernRegistry.api.v1.register.HttpResponseBodyShape | undefined>(
        irResponse,
        {
            fileDownload: () => FernRegistry.api.v1.register.HttpResponseBodyShape.fileDownload(),
            json: (jsonResponse) =>
                FernRegistry.api.v1.register.HttpResponseBodyShape.reference(
                    convertTypeReference(jsonResponse.responseBodyType)
                ),
            streaming: (streamingResponse) => {
                if (streamingResponse.dataEventType.type === "text") {
                    return FernRegistry.api.v1.register.HttpResponseBodyShape.streamingText();
                }
                return undefined;
            },
            _unknown: () => {
                throw new Error("Unknown HttpResponse: " + irResponse.type);
            },
        }
    );
    if (type != null) {
        return { type };
    } else {
        return undefined;
    }
}

function convertResponseErrors(
    irResponseErrors: Ir.http.ResponseErrors,
    ir: Ir.ir.IntermediateRepresentation
): FernRegistry.api.v1.register.ErrorDeclaration[] {
    const errors: FernRegistry.api.v1.register.ErrorDeclaration[] = [];
    for (const irResponseError of irResponseErrors) {
        const errorDeclaration = ir.errors[irResponseError.error.errorId];
        if (errorDeclaration) {
            errors.push({
                type: errorDeclaration.type == null ? undefined : convertTypeReference(errorDeclaration.type),
                statusCode: errorDeclaration.statusCode,
                description: errorDeclaration.docs ?? undefined,
            });
        }
    }
    return errors;
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
