import { mapValues, pickBy } from 'lodash-es'

import {
    ExampleType,
    IntermediateRepresentation,
    ServiceId,
    ServiceTypeReferenceInfo,
    Type,
    TypeId
} from '@fern-api/ir-sdk'

import { FilteredIr } from './FilteredIr'
import { filterEndpointExample, filterExampleType } from './filterExamples'

export function filterIntermediateRepresentationForAudiences(
    intermediateRepresentation: Omit<IntermediateRepresentation, 'sdkConfig' | 'subpackages' | 'rootPackage'>,
    filteredIr: FilteredIr | undefined
): Omit<IntermediateRepresentation, 'sdkConfig' | 'subpackages' | 'rootPackage'> {
    if (filteredIr == null) {
        return intermediateRepresentation
    }

    const filteredTypes = pickBy(intermediateRepresentation.types, (type) => filteredIr.hasType(type))
    const filteredTypesAndProperties = Object.fromEntries(
        Object.entries(filteredTypes).map(([typeId, typeDeclaration]) => {
            const filteredProperties = []
            typeDeclaration.userProvidedExamples = typeDeclaration.userProvidedExamples
                .map((example) => filterExampleType({ filteredIr, exampleType: example }))
                .filter((ex) => ex !== undefined) as ExampleType[]
            if (typeDeclaration.shape.type === 'object') {
                for (const property of typeDeclaration.shape.properties) {
                    const hasProperty = filteredIr.hasProperty(typeId, property.name.wireValue)
                    if (hasProperty) {
                        filteredProperties.push(property)
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
                ]
            }
            return [typeId, typeDeclaration]
        })
    )

    const filteredWebhookGroups = Object.fromEntries(
        Object.entries(intermediateRepresentation.webhookGroups).map(([webhookGroupId, webhookGroup]) => {
            const filteredWebhooks = webhookGroup
                .filter((webhook) => filteredIr.hasWebhook(webhook))
                .map((webhook) => {
                    const webhookId = webhook.id
                    if (webhook.payload.type === 'inlinedPayload' && webhookId != null) {
                        webhook.payload = {
                            ...webhook.payload,
                            properties: webhook.payload.properties.filter((property) => {
                                return filteredIr.hasWebhookPayloadProperty(webhookId, property.name.wireValue)
                            })
                        }
                    }
                    return webhook
                })
            return [webhookGroupId, filteredWebhooks]
        })
    )
    const filteredChannels =
        intermediateRepresentation.websocketChannels != null
            ? Object.fromEntries(
                  Object.entries(intermediateRepresentation.websocketChannels)
                      .filter(([channelId]) => {
                          return filteredIr.hasChannel(channelId)
                      })
                      .map(([channelId, channel]) => {
                          return [
                              channelId,
                              {
                                  ...channel
                              }
                          ]
                      })
              )
            : {}

    const filteredEnvironmentsConfig = intermediateRepresentation.environments
    if (filteredEnvironmentsConfig) {
        switch (filteredEnvironmentsConfig.environments.type) {
            case 'singleBaseUrl': {
                filteredEnvironmentsConfig.environments.environments =
                    filteredEnvironmentsConfig.environments.environments.filter((environment) =>
                        filteredIr.hasEnvironmentId(environment.id)
                    )
                break
            }
            case 'multipleBaseUrls': {
                filteredEnvironmentsConfig.environments.environments =
                    filteredEnvironmentsConfig.environments.environments.filter((environment) =>
                        filteredIr.hasEnvironmentId(environment.id)
                    )
                break
            }
        }

        // If default environment does not exist in audience, set to undefined
        if (filteredEnvironmentsConfig.defaultEnvironment) {
            if (!filteredIr.hasEnvironmentId(filteredEnvironmentsConfig.defaultEnvironment)) {
                filteredEnvironmentsConfig.defaultEnvironment = undefined
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
                    .map((httpEndpoint) => {
                        httpEndpoint.autogeneratedExamples = httpEndpoint.autogeneratedExamples.map((autogenerated) => {
                            return {
                                ...autogenerated,
                                example: filterEndpointExample({ filteredIr, example: autogenerated.example })
                            }
                        })
                        httpEndpoint.userSpecifiedExamples = httpEndpoint.userSpecifiedExamples.map((userSpecified) => {
                            return {
                                ...userSpecified,
                                example:
                                    userSpecified.example != null
                                        ? filterEndpointExample({ filteredIr, example: userSpecified.example })
                                        : undefined
                            }
                        })
                        if (httpEndpoint.queryParameters.length > 0) {
                            httpEndpoint.queryParameters = httpEndpoint.queryParameters.filter((queryParameter) => {
                                return filteredIr.hasQueryParameter(httpEndpoint.id, queryParameter.name.wireValue)
                            })
                        }
                        if (httpEndpoint.requestBody?.type === 'inlinedRequestBody') {
                            return {
                                ...httpEndpoint,
                                requestBody: {
                                    ...httpEndpoint.requestBody,
                                    properties: httpEndpoint.requestBody.properties.filter((property) => {
                                        return filteredIr.hasRequestProperty(httpEndpoint.id, property.name.wireValue)
                                    })
                                }
                            }
                        }
                        return httpEndpoint
                    })
            })
        ),
        websocketChannels: filteredChannels,
        webhookGroups: filteredWebhookGroups,
        serviceTypeReferenceInfo: filterServiceTypeReferenceInfoForAudiences(
            intermediateRepresentation.serviceTypeReferenceInfo,
            filteredIr
        )
    }
}

function filterServiceTypeReferenceInfoForAudiences(
    serviceTypeReferenceInfo: ServiceTypeReferenceInfo,
    filteredIr: FilteredIr | undefined
): ServiceTypeReferenceInfo {
    if (filteredIr == null) {
        return serviceTypeReferenceInfo
    }
    const filteredTypesReferencedOnlyByService: Record<ServiceId, TypeId[]> = {}
    Object.entries(serviceTypeReferenceInfo.typesReferencedOnlyByService).forEach(([key, values]) => {
        if (filteredIr.hasServiceId(key)) {
            filteredTypesReferencedOnlyByService[key] = values.filter((value) => filteredIr.hasTypeId(value))
        }
    })

    return {
        sharedTypes: serviceTypeReferenceInfo.sharedTypes.filter((typeId) => filteredIr.hasTypeId(typeId)),
        typesReferencedOnlyByService: filteredTypesReferencedOnlyByService
    }
}
