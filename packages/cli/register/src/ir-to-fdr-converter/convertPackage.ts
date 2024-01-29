import { assertNever } from "@fern-api/core-utils";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { FernIr as Ir } from "@fern-fern/ir-sdk";
import { startCase } from "lodash-es";
import { convertTypeReference } from "./convertTypeShape";

export function convertPackage(
    irPackage: Ir.ir.Package,
    ir: Ir.ir.IntermediateRepresentation
): APIV1Write.ApiDefinitionPackage {
    const service = irPackage.service != null ? ir.services[irPackage.service] : undefined;
    const webhooks = irPackage.webhooks != null ? ir.webhookGroups[irPackage.webhooks] : undefined;
    return {
        endpoints: service != null ? convertService(service, ir) : [],
        webhooks: webhooks != null ? convertWebhookGroup(webhooks) : [],
        types: irPackage.types.map((typeId) => typeId),
        subpackages: irPackage.subpackages.map((subpackageId) => subpackageId),
        pointsTo: irPackage.navigationConfig != null ? irPackage.navigationConfig.pointsTo : undefined
    };
}

function convertWebhookGroup(webhookGroup: Ir.webhooks.WebhookGroup): APIV1Write.WebhookDefinition[] {
    return webhookGroup.map((webhook) => {
        return {
            description: webhook.docs ?? undefined,
            id: webhook.name.originalName,
            path: [],
            method: webhook.method,
            name: webhook.displayName ?? startCase(webhook.name.originalName),
            headers: webhook.headers.map(
                (header): APIV1Write.Header => ({
                    description: header.docs ?? undefined,
                    key: header.name.wireValue,
                    type: convertTypeReference(header.valueType)
                })
            ),
            payload: convertWebhookPayload(webhook.payload),
            examples: []
        };
    });
}

function convertService(
    irService: Ir.http.HttpService,
    ir: Ir.ir.IntermediateRepresentation
): APIV1Write.EndpointDefinition[] {
    return irService.endpoints.map(
        (irEndpoint): APIV1Write.EndpointDefinition => ({
            availability:
                irEndpoint.availability != null
                    ? convertIrAvailability({ availability: irEndpoint.availability })
                    : irService.availability != null
                    ? convertIrAvailability({ availability: irService.availability })
                    : undefined,
            auth: irEndpoint.auth,
            description: irEndpoint.docs ?? undefined,
            method: convertHttpMethod(irEndpoint.method),
            defaultEnvironment:
                ir.environments?.defaultEnvironment != null ? ir.environments.defaultEnvironment : undefined,
            environments:
                ir.environments != null
                    ? convertIrEnvironments({ environmentsConfig: ir.environments, endpoint: irEndpoint })
                    : undefined,
            id: irEndpoint.name.originalName,
            name: irEndpoint.displayName ?? startCase(irEndpoint.name.originalName),
            path: {
                pathParameters: [...irService.pathParameters, ...irEndpoint.pathParameters].map(
                    (pathParameter): APIV1Write.PathParameter => ({
                        description: pathParameter.docs ?? undefined,
                        key: pathParameter.name.originalName,
                        type: convertTypeReference(pathParameter.valueType)
                    })
                ),
                parts: [...convertHttpPath(irService.basePath), ...convertHttpPath(irEndpoint.path)]
            },
            queryParameters: irEndpoint.queryParameters.map(
                (queryParameter): APIV1Write.QueryParameter => ({
                    description: queryParameter.docs ?? undefined,
                    key: queryParameter.name.wireValue,
                    type: convertTypeReference(queryParameter.valueType),
                    availability:
                        queryParameter.availability != null
                            ? convertIrAvailability({ availability: queryParameter.availability })
                            : undefined
                })
            ),
            headers: [...irService.headers, ...irEndpoint.headers].map(
                (header): APIV1Write.Header => ({
                    description: header.docs ?? undefined,
                    key: header.name.wireValue,
                    type: convertTypeReference(header.valueType),
                    availability:
                        header.availability != null
                            ? convertIrAvailability({ availability: header.availability })
                            : undefined
                })
            ),
            request: irEndpoint.requestBody != null ? convertRequestBody(irEndpoint.requestBody) : undefined,
            response: irEndpoint.response != null ? convertResponse(irEndpoint.response) : undefined,
            errors: convertResponseErrors(irEndpoint.errors, ir),
            errorsV2: convertResponseErrorsV2(irEndpoint.errors, ir),
            examples: irEndpoint.examples.map((example) => convertExampleEndpointCall(example, ir))
        })
    );
}

export function convertIrAvailability({
    availability
}: {
    availability: Ir.Availability;
}): APIV1Write.Availability | undefined {
    switch (availability.status) {
        case "DEPRECATED":
            return APIV1Write.Availability.Deprecated;
        case "PRE_RELEASE":
            return APIV1Write.Availability.Beta;
        case "GENERAL_AVAILABILITY":
            return APIV1Write.Availability.GenerallyAvailable;
        case "IN_DEVELOPMENT":
            return APIV1Write.Availability.Beta;
        default:
            assertNever(availability.status);
    }
}

function convertIrEnvironments({
    environmentsConfig,
    endpoint
}: {
    environmentsConfig: Ir.environment.EnvironmentsConfig;
    endpoint: Ir.http.HttpEndpoint;
}): APIV1Write.Environment[] {
    const environmentsConfigValue = environmentsConfig.environments;
    const endpointBaseUrlId = endpoint.baseUrl;
    switch (environmentsConfigValue.type) {
        case "singleBaseUrl":
            return environmentsConfigValue.environments.map((singleBaseUrlEnvironment) => {
                return {
                    id: singleBaseUrlEnvironment.id,
                    baseUrl: singleBaseUrlEnvironment.url
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
                    id: singleBaseUrlEnvironment.id,
                    baseUrl: endpointBaseUrl
                };
            });
        default:
            assertNever(environmentsConfigValue);
    }
}

function convertHttpMethod(method: Ir.http.HttpMethod): APIV1Write.HttpMethod {
    return Ir.http.HttpMethod._visit<APIV1Write.HttpMethod>(method, {
        get: () => APIV1Write.HttpMethod.Get,
        post: () => APIV1Write.HttpMethod.Post,
        put: () => APIV1Write.HttpMethod.Put,
        patch: () => APIV1Write.HttpMethod.Patch,
        delete: () => APIV1Write.HttpMethod.Delete,
        _other: () => {
            throw new Error("Unknown http method: " + method);
        }
    });
}

function convertHttpPath(irPath: Ir.http.HttpPath): APIV1Write.EndpointPathPart[] {
    const endpointPaths: APIV1Write.EndpointPathPart[] = irPath.parts.flatMap((part) => [
        {
            type: "pathParameter",
            value: part.pathParameter
        },
        {
            type: "literal",
            value: part.tail
        }
    ]);
    return [
        {
            type: "literal",
            value: irPath.head
        },
        ...endpointPaths
    ];
}

function convertRequestBody(irRequest: Ir.http.HttpRequestBody): APIV1Write.HttpRequest | undefined {
    const requestBodyShape = Ir.http.HttpRequestBody._visit<APIV1Write.HttpRequestBodyShape | undefined>(irRequest, {
        inlinedRequestBody: (inlinedRequestBody) => {
            return {
                type: "json",
                contentType: inlinedRequestBody.contentType ?? "application/json",
                shape: {
                    type: "object",
                    extends: inlinedRequestBody.extends.map((extension) => extension.typeId),
                    properties: inlinedRequestBody.properties.map(
                        (property): APIV1Write.ObjectProperty => ({
                            description: property.docs ?? undefined,
                            key: property.name.wireValue,
                            valueType: convertTypeReference(property.valueType)
                        })
                    )
                }
            };
        },
        reference: (reference) => {
            return {
                type: "json",
                contentType: reference.contentType ?? "application/json",
                shape: {
                    type: "reference",
                    value: convertTypeReference(reference.requestBodyType)
                }
            };
        },
        fileUpload: () => {
            return {
                type: "fileUpload"
            };
        },
        bytes: () => {
            return undefined;
        },
        _other: () => {
            throw new Error("Unknown HttpRequestBody: " + irRequest.type);
        }
    });
    return requestBodyShape != null ? { type: requestBodyShape } : undefined;
}

function convertResponse(irResponse: Ir.http.HttpResponse): APIV1Write.HttpResponse | undefined {
    const type = Ir.http.HttpResponse._visit<APIV1Write.HttpResponseBodyShape | undefined>(irResponse, {
        fileDownload: () => {
            return {
                type: "fileDownload"
            };
        },
        json: (jsonResponse) => {
            return {
                type: "reference",
                value: convertTypeReference(jsonResponse.responseBodyType)
            };
        },
        text: () => undefined, // TODO: support text/plain in FDR
        streaming: (streamingResponse) => {
            if (streamingResponse.dataEventType.type === "text") {
                return {
                    type: "streamingText"
                };
            } else {
                return {
                    type: "stream",
                    shape: { type: "reference", value: convertTypeReference(streamingResponse.dataEventType.json) }
                };
            }
        },
        _other: () => {
            throw new Error("Unknown HttpResponse: " + irResponse.type);
        }
    });
    if (type != null) {
        return { type };
    } else {
        return undefined;
    }
}

function convertResponseErrors(
    irResponseErrors: Ir.http.ResponseErrors,
    ir: Ir.ir.IntermediateRepresentation
): APIV1Write.ErrorDeclaration[] {
    const errors: APIV1Write.ErrorDeclaration[] = [];
    for (const irResponseError of irResponseErrors) {
        const errorDeclaration = ir.errors[irResponseError.error.errorId];
        if (errorDeclaration) {
            errors.push({
                type: errorDeclaration.type == null ? undefined : convertTypeReference(errorDeclaration.type),
                statusCode: errorDeclaration.statusCode,
                description: errorDeclaration.docs ?? undefined
            });
        }
    }
    return errors;
}

function convertResponseErrorsV2(
    irResponseErrors: Ir.http.ResponseErrors,
    ir: Ir.ir.IntermediateRepresentation
): APIV1Write.ErrorDeclarationV2[] {
    const errors: APIV1Write.ErrorDeclarationV2[] = [];
    if (ir.errorDiscriminationStrategy.type === "statusCode") {
        for (const irResponseError of irResponseErrors) {
            const errorDeclaration = ir.errors[irResponseError.error.errorId];
            if (errorDeclaration) {
                errors.push({
                    type:
                        errorDeclaration.type == null
                            ? undefined
                            : {
                                  type: "alias",
                                  value: convertTypeReference(errorDeclaration.type)
                              },
                    statusCode: errorDeclaration.statusCode,
                    description: errorDeclaration.docs ?? undefined
                });
            }
        }
    } else {
        for (const irResponseError of irResponseErrors) {
            const errorDeclaration = ir.errors[irResponseError.error.errorId];
            if (errorDeclaration) {
                const properties: APIV1Write.ObjectProperty[] = [
                    {
                        key: ir.errorDiscriminationStrategy.discriminant.wireValue,
                        valueType: {
                            type: "literal",
                            value: {
                                type: "stringLiteral",
                                value: errorDeclaration.discriminantValue.name.originalName
                            }
                        }
                    }
                ];

                if (errorDeclaration.type != null) {
                    properties.push({
                        key: ir.errorDiscriminationStrategy.contentProperty.wireValue,
                        valueType: convertTypeReference(errorDeclaration.type)
                    });
                }

                errors.push({
                    type:
                        errorDeclaration.type == null
                            ? undefined
                            : {
                                  type: "object",
                                  extends: [],
                                  properties
                              },
                    statusCode: errorDeclaration.statusCode,
                    description: errorDeclaration.docs ?? undefined,
                    name: errorDeclaration.name.name.originalName
                });
            }
        }
    }
    return errors;
}

function convertExampleEndpointCall(
    irExample: Ir.http.ExampleEndpointCall,
    ir: Ir.ir.IntermediateRepresentation
): APIV1Write.ExampleEndpointCall {
    return {
        description: irExample.docs ?? undefined,
        path: irExample.url,
        pathParameters: [...irExample.servicePathParameters, ...irExample.endpointPathParameters].reduce<
            APIV1Write.ExampleEndpointCall["pathParameters"]
        >((pathParameters, irPathParameterExample) => {
            pathParameters[irPathParameterExample.name.originalName] = irPathParameterExample.value.jsonExample;
            return pathParameters;
        }, {}),
        queryParameters: irExample.queryParameters.reduce<APIV1Write.ExampleEndpointCall["queryParameters"]>(
            (queryParameters, irQueryParameterExample) => {
                queryParameters[irQueryParameterExample.name.wireValue] = irQueryParameterExample.value.jsonExample;
                return queryParameters;
            },
            {}
        ),
        headers: [...irExample.serviceHeaders, ...irExample.endpointHeaders].reduce<
            APIV1Write.ExampleEndpointCall["headers"]
        >((headers, irHeaderExample) => {
            headers[irHeaderExample.name.wireValue] = irHeaderExample.value.jsonExample;
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
            _other: () => {
                throw new Error("Unknown ExampleResponse: " + irExample.response.type);
            }
        }),
        responseBody: irExample.response.body?.jsonExample
    };
}

function convertWebhookPayload(irWebhookPayload: Ir.webhooks.WebhookPayload): APIV1Write.WebhookPayload {
    switch (irWebhookPayload.type) {
        case "inlinedPayload":
            return {
                type: {
                    type: "object",
                    extends: irWebhookPayload.extends.map((extension) => extension.typeId),
                    properties: irWebhookPayload.properties.map(
                        (property): APIV1Write.ObjectProperty => ({
                            description: property.docs ?? undefined,
                            key: property.name.wireValue,
                            valueType: convertTypeReference(property.valueType)
                        })
                    )
                }
            };
        case "reference":
            return {
                type: {
                    type: "reference",
                    value: convertTypeReference(irWebhookPayload.payloadType)
                }
            };
        default:
            assertNever(irWebhookPayload);
    }
}
