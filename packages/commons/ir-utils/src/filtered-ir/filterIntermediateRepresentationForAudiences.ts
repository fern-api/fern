import {
    ExampleType,
    HttpEndpoint,
    IntermediateRepresentation,
    ServiceId,
    ServiceTypeReferenceInfo,
    Type,
    TypeId
} from "@fern-api/ir-sdk";
import { mapValues, pickBy } from "lodash-es";

import { IdGenerator } from "../utils/IdGenerator.js";
import { getWireValue } from "../utils/namesUtils.js";
import { FilteredIr } from "./FilteredIr.js";
import {
    filterEndpointExample,
    filterExampleType,
    filterWebhookExamplePayload,
    getNamedTypeIdFromTypeReference,
    scrubV2HttpEndpointExamples,
    scrubV2SchemaExamples,
    scrubV2WebhookExamples
} from "./filterExamples.js";

export function filterIntermediateRepresentationForAudiences(
    intermediateRepresentation: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">,
    filteredIr: FilteredIr | undefined
): Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage"> {
    if (filteredIr == null) {
        return intermediateRepresentation;
    }

    const filteredTypes = pickBy(intermediateRepresentation.types, (type) => filteredIr.hasType(type));
    const filteredTypesAndProperties = Object.fromEntries(
        Object.entries(filteredTypes).map(([typeId, typeDeclaration]) => {
            // `ir.types` keys differ across importers (Fern uses generated ids, V3 OpenAPI uses
            // namespaced schema ids), but `IrGraph` always keys by `IdGenerator.generateTypeId`.
            const propertyLookupTypeId = IdGenerator.generateTypeId(typeDeclaration.name);
            const isPropertyAllowed = (wireName: string) => filteredIr.hasProperty(propertyLookupTypeId, wireName);
            const filteredProperties = [];
            typeDeclaration.userProvidedExamples = typeDeclaration.userProvidedExamples
                .map((example) => filterExampleType({ filteredIr, exampleType: example }))
                .filter((ex) => ex !== undefined) as ExampleType[];
            typeDeclaration.v2Examples = scrubV2SchemaExamples(typeDeclaration.v2Examples, isPropertyAllowed);
            if (typeDeclaration.shape.type === "object") {
                for (const property of typeDeclaration.shape.properties) {
                    const hasProperty = isPropertyAllowed(getWireValue(property.name));
                    if (hasProperty) {
                        filteredProperties.push(property);
                    }
                }

                return [
                    typeId,
                    {
                        ...typeDeclaration,
                        shape: Type.object({
                            ...typeDeclaration.shape,
                            properties: filteredProperties
                        })
                    }
                ];
            }
            return [typeId, typeDeclaration];
        })
    );

    const filteredWebhookGroups = Object.fromEntries(
        Object.entries(intermediateRepresentation.webhookGroups).map(([webhookGroupId, webhookGroup]) => {
            const filteredWebhooks = webhookGroup
                .filter((webhook) => filteredIr.hasWebhook(webhook))
                .map((webhook) => {
                    const webhookId = webhook.id;
                    // Inline payloads → webhook-scoped exclusions; reference payloads → referenced
                    // type's exclusions; unknown shapes → allow all keys.
                    let payloadKeyIsAllowed: (key: string) => boolean = () => true;
                    if (webhook.payload.type === "inlinedPayload" && webhookId != null) {
                        payloadKeyIsAllowed = (key) => filteredIr.hasWebhookPayloadProperty(webhookId, key);
                        webhook.payload = {
                            ...webhook.payload,
                            properties: webhook.payload.properties.filter((property) => {
                                return payloadKeyIsAllowed(getWireValue(property.name));
                            })
                        };
                    } else if (webhook.payload.type === "reference") {
                        const referencedTypeId = getNamedTypeIdFromTypeReference(webhook.payload.payloadType);
                        if (referencedTypeId != null) {
                            payloadKeyIsAllowed = (key) => filteredIr.hasProperty(referencedTypeId, key);
                        }
                    }
                    if (webhook.examples != null && webhookId != null) {
                        webhook.examples = webhook.examples.map((example) => ({
                            ...example,
                            payload: filterWebhookExamplePayload({
                                filteredIr,
                                payload: example.payload,
                                webhookId
                            })
                        }));
                    }
                    webhook.v2Examples = scrubV2WebhookExamples(webhook.v2Examples, payloadKeyIsAllowed);
                    return webhook;
                });
            return [webhookGroupId, filteredWebhooks];
        })
    );
    const filteredChannels =
        intermediateRepresentation.websocketChannels != null
            ? Object.fromEntries(
                  Object.entries(intermediateRepresentation.websocketChannels)
                      .filter(([channelId]) => {
                          return filteredIr.hasChannel(channelId);
                      })
                      .map(([channelId, channel]) => {
                          return [
                              channelId,
                              {
                                  ...channel
                              }
                          ];
                      })
              )
            : {};

    const filteredEnvironmentsConfig = intermediateRepresentation.environments;
    if (filteredEnvironmentsConfig) {
        switch (filteredEnvironmentsConfig.environments.type) {
            case "singleBaseUrl": {
                filteredEnvironmentsConfig.environments.environments =
                    filteredEnvironmentsConfig.environments.environments.filter((environment) =>
                        filteredIr.hasEnvironmentId(environment.id)
                    );
                break;
            }
            case "multipleBaseUrls": {
                filteredEnvironmentsConfig.environments.environments =
                    filteredEnvironmentsConfig.environments.environments.filter((environment) =>
                        filteredIr.hasEnvironmentId(environment.id)
                    );
                break;
            }
        }

        // If default environment does not exist in audience, set to undefined
        if (filteredEnvironmentsConfig.defaultEnvironment) {
            if (!filteredIr.hasEnvironmentId(filteredEnvironmentsConfig.defaultEnvironment)) {
                filteredEnvironmentsConfig.defaultEnvironment = undefined;
            }
        }
    }

    return {
        ...intermediateRepresentation,
        environments: filteredEnvironmentsConfig,
        types: filteredTypesAndProperties,
        errors: pickBy(intermediateRepresentation.errors, (error) => filteredIr.hasError(error)),
        services: mapValues(
            pickBy(intermediateRepresentation.services, (httpService) => filteredIr.hasService(httpService)),
            (httpService) => ({
                ...httpService,
                endpoints: httpService.endpoints
                    .filter((httpEndpoint) => filteredIr.hasEndpoint(httpEndpoint))
                    .map((httpEndpoint) => filterHttpEndpoint(httpEndpoint, filteredIr))
            })
        ),
        websocketChannels: filteredChannels,
        webhookGroups: filteredWebhookGroups,
        serviceTypeReferenceInfo: filterServiceTypeReferenceInfoForAudiences(
            intermediateRepresentation.serviceTypeReferenceInfo,
            filteredIr
        )
    };
}

/**
 * Predicate for top-level JSON keys on the endpoint's request body example. Inline bodies use
 * endpoint-scoped exclusions; reference bodies use the referenced type's exclusions; anything
 * else (file uploads, bytes, no body) allows all keys.
 */
function getRequestBodyKeyPredicate(httpEndpoint: HttpEndpoint, filteredIr: FilteredIr): (key: string) => boolean {
    const body = httpEndpoint.requestBody;
    if (body == null) {
        return () => true;
    }
    if (body.type === "inlinedRequestBody") {
        return (key) => filteredIr.hasRequestProperty(httpEndpoint.id, key);
    }
    if (body.type === "reference") {
        const referencedTypeId = getNamedTypeIdFromTypeReference(body.requestBodyType);
        if (referencedTypeId != null) {
            return (key) => filteredIr.hasProperty(referencedTypeId, key);
        }
    }
    return () => true;
}

/**
 * Predicate for top-level JSON keys on the endpoint's response body example. Only typed JSON
 * responses with a (container-wrapped) named body type scrub anything; everything else allows all.
 */
function getResponseBodyKeyPredicate(httpEndpoint: HttpEndpoint, filteredIr: FilteredIr): (key: string) => boolean {
    const body = httpEndpoint.response?.body;
    if (body?.type !== "json") {
        return () => true;
    }
    const inner = body.value;
    const responseBodyType =
        inner.type === "response" || inner.type === "nestedPropertyAsResponse" ? inner.responseBodyType : undefined;
    if (responseBodyType == null) {
        return () => true;
    }
    const referencedTypeId = getNamedTypeIdFromTypeReference(responseBodyType);
    if (referencedTypeId == null) {
        return () => true;
    }
    return (key) => filteredIr.hasProperty(referencedTypeId, key);
}

/**
 * Applies every per-endpoint scrubbing step: V1 examples, query parameters, inline request body
 * properties (both `requestBody` and the V3 parallel `v2RequestBodies`), and every `v2Examples`
 * block attached to typed request/response bodies, the endpoint, and `v2Responses`.
 */
function filterHttpEndpoint(httpEndpoint: HttpEndpoint, filteredIr: FilteredIr): HttpEndpoint {
    const endpointId = httpEndpoint.id;
    const requestBodyKeyIsAllowed = getRequestBodyKeyPredicate(httpEndpoint, filteredIr);
    const responseBodyKeyIsAllowed = getResponseBodyKeyPredicate(httpEndpoint, filteredIr);
    const queryParameterKeyIsAllowed = (key: string) => filteredIr.hasQueryParameter(endpointId, key);

    httpEndpoint.autogeneratedExamples = httpEndpoint.autogeneratedExamples.map((autogenerated) => ({
        ...autogenerated,
        example: filterEndpointExample({ filteredIr, example: autogenerated.example, endpointId })
    }));
    httpEndpoint.userSpecifiedExamples = httpEndpoint.userSpecifiedExamples.map((userSpecified) => ({
        ...userSpecified,
        example:
            userSpecified.example != null
                ? filterEndpointExample({ filteredIr, example: userSpecified.example, endpointId })
                : undefined
    }));
    if (httpEndpoint.queryParameters.length > 0) {
        httpEndpoint.queryParameters = httpEndpoint.queryParameters.filter((queryParameter) =>
            queryParameterKeyIsAllowed(getWireValue(queryParameter.name))
        );
    }
    httpEndpoint.v2Examples = scrubV2HttpEndpointExamples({
        v2Examples: httpEndpoint.v2Examples,
        requestBodyIsAllowed: requestBodyKeyIsAllowed,
        responseBodyIsAllowed: responseBodyKeyIsAllowed,
        queryParameterIsAllowed: queryParameterKeyIsAllowed
    });
    if (httpEndpoint.response?.body?.type === "json") {
        const inner = httpEndpoint.response.body.value;
        if (inner.type === "response" || inner.type === "nestedPropertyAsResponse") {
            inner.v2Examples = scrubV2SchemaExamples(inner.v2Examples, responseBodyKeyIsAllowed);
        }
    }
    if (httpEndpoint.v2Responses?.responses != null) {
        httpEndpoint.v2Responses = {
            ...httpEndpoint.v2Responses,
            responses: httpEndpoint.v2Responses.responses.map((resp) => {
                if (resp.body?.type !== "json") {
                    return resp;
                }
                const inner = resp.body.value;
                if (inner.type === "response" || inner.type === "nestedPropertyAsResponse") {
                    return {
                        ...resp,
                        body: {
                            ...resp.body,
                            value: {
                                ...inner,
                                v2Examples: scrubV2SchemaExamples(inner.v2Examples, responseBodyKeyIsAllowed)
                            }
                        }
                    };
                }
                return resp;
            })
        };
    }
    if (httpEndpoint.v2RequestBodies?.requestBodies != null) {
        // V3 OpenAPI parallel collection for multi-content-type endpoints; mirror primary scrubbing.
        httpEndpoint.v2RequestBodies = {
            ...httpEndpoint.v2RequestBodies,
            requestBodies: httpEndpoint.v2RequestBodies.requestBodies.map((body) => {
                if (body.type === "inlinedRequestBody") {
                    return {
                        ...body,
                        properties: body.properties.filter((property) =>
                            requestBodyKeyIsAllowed(getWireValue(property.name))
                        ),
                        v2Examples: scrubV2SchemaExamples(body.v2Examples, requestBodyKeyIsAllowed)
                    };
                }
                if (body.type === "reference") {
                    return { ...body, v2Examples: scrubV2SchemaExamples(body.v2Examples, requestBodyKeyIsAllowed) };
                }
                return body;
            })
        };
    }
    if (httpEndpoint.requestBody?.type === "inlinedRequestBody") {
        return {
            ...httpEndpoint,
            requestBody: {
                ...httpEndpoint.requestBody,
                properties: httpEndpoint.requestBody.properties.filter((property) =>
                    requestBodyKeyIsAllowed(getWireValue(property.name))
                ),
                v2Examples: scrubV2SchemaExamples(httpEndpoint.requestBody.v2Examples, requestBodyKeyIsAllowed)
            }
        };
    }
    if (httpEndpoint.requestBody?.type === "reference") {
        return {
            ...httpEndpoint,
            requestBody: {
                ...httpEndpoint.requestBody,
                v2Examples: scrubV2SchemaExamples(httpEndpoint.requestBody.v2Examples, requestBodyKeyIsAllowed)
            }
        };
    }
    return httpEndpoint;
}

function filterServiceTypeReferenceInfoForAudiences(
    serviceTypeReferenceInfo: ServiceTypeReferenceInfo,
    filteredIr: FilteredIr | undefined
): ServiceTypeReferenceInfo {
    if (filteredIr == null) {
        return serviceTypeReferenceInfo;
    }
    const filteredTypesReferencedOnlyByService: Record<ServiceId, TypeId[]> = {};
    Object.entries(serviceTypeReferenceInfo.typesReferencedOnlyByService).forEach(([key, values]) => {
        if (filteredIr.hasServiceId(key)) {
            filteredTypesReferencedOnlyByService[key] = values.filter((value) => filteredIr.hasTypeId(value));
        }
    });

    return {
        sharedTypes: serviceTypeReferenceInfo.sharedTypes.filter((typeId) => filteredIr.hasTypeId(typeId)),
        typesReferencedOnlyByService: filteredTypesReferencedOnlyByService
    };
}
