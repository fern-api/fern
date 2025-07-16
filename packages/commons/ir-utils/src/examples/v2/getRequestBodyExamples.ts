import { assertNever } from '@fern-api/core-utils'
import { HttpEndpoint, IntermediateRepresentation, V2HttpEndpointRequest } from '@fern-api/ir-sdk'

import { getParameterExamples } from './getParameterExamples'
import { getFirstExamples, getV2Examples } from './getV2Examples'

export function getRequestBodyExamples({
    endpoint,
    ir,
    skipOptionalRequestProperties
}: {
    endpoint: HttpEndpoint
    ir: Omit<IntermediateRepresentation, 'sdkConfig' | 'subpackages' | 'rootPackage'>
    skipOptionalRequestProperties: boolean
}): {
    userRequestExamples: Record<string, V2HttpEndpointRequest>
    autoRequestExamples: Record<string, V2HttpEndpointRequest>
    baseExample: V2HttpEndpointRequest
} {
    const { pathParameters, queryParameters, headers } = getParameterExamples({
        endpoint,
        ir,
        skipOptionalRequestProperties
    })
    const userRequestExamples: Record<string, V2HttpEndpointRequest> = {}
    const autoRequestExamples: Record<string, V2HttpEndpointRequest> = {}
    const baseExampleRequest: V2HttpEndpointRequest = {
        endpoint: {
            method: endpoint.method,
            path: getUrlForExample(endpoint)
        },
        baseUrl: undefined,
        environment: endpoint.baseUrl,
        auth: undefined,
        pathParameters,
        queryParameters,
        headers,
        requestBody: undefined,
        docs: undefined
    }
    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.type) {
            case 'bytes':
                break
            case 'fileUpload': {
                const { userExamples, autoExamples } = getV2Examples(endpoint.requestBody.v2Examples)
                for (const [key, example] of Object.entries(userExamples)) {
                    userRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                for (const [key, example] of Object.entries(autoExamples)) {
                    autoRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                break
            }
            case 'inlinedRequestBody': {
                const { userExamples, autoExamples } = getV2Examples(endpoint.requestBody.v2Examples)
                for (const [key, example] of Object.entries(userExamples)) {
                    userRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                for (const [key, example] of Object.entries(autoExamples)) {
                    autoRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                break
            }
            case 'reference': {
                const { userExamples, autoExamples } = getV2Examples(endpoint.requestBody.v2Examples)
                for (const [key, example] of Object.entries(userExamples)) {
                    userRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                for (const [key, example] of Object.entries(autoExamples)) {
                    autoRequestExamples[key] = {
                        ...baseExampleRequest,
                        requestBody: example
                    }
                }
                break
            }
            default: {
                assertNever(endpoint.requestBody)
            }
        }
    }
    return {
        userRequestExamples,
        autoRequestExamples,
        baseExample: baseExampleRequest
    }
}

function getUrlForExample(endpoint: HttpEndpoint): string {
    const pathParameters: Record<string, string> = {}
    ;[...endpoint.pathParameters, ...endpoint.allPathParameters].forEach((pathParameter) => {
        const { userExample, autoExample } = getFirstExamples(pathParameter.v2Examples)
        const value = userExample ?? autoExample
        let stringValue: string
        if (value == null) {
            stringValue = pathParameter.name.originalName
        } else {
            stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        }
        pathParameters[pathParameter.name.originalName] = stringValue
    })
    const url =
        endpoint.fullPath.head +
        endpoint.fullPath.parts
            .map((pathPart) => encodeURIComponent(`${pathParameters[pathPart.pathParameter]}`) + pathPart.tail)
            .join('')
    return url.startsWith('/') || url === '' ? url : `/${url}`
}
