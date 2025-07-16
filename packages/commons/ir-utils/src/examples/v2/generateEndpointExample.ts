import { camelCase } from 'lodash-es'

import { HttpEndpoint, IntermediateRepresentation, V2HttpEndpointExample } from '@fern-api/ir-sdk'

import { getRequestBodyExamples } from './getRequestBodyExamples'
import { getResponseExamples } from './getResponseExamples'

export declare namespace generateEndpointExample {
    interface Args {
        endpoint: HttpEndpoint
        ir: Omit<IntermediateRepresentation, 'sdkConfig' | 'subpackages' | 'rootPackage'>
        skipOptionalRequestProperties: boolean
    }

    interface Result {
        userFullExamples: Record<string, V2HttpEndpointExample>
        autoFullExamples: Record<string, V2HttpEndpointExample>
    }
}

export function generateEndpointExample({
    endpoint,
    ir,
    skipOptionalRequestProperties
}: generateEndpointExample.Args): generateEndpointExample.Result {
    const userResults: Record<string, V2HttpEndpointExample> = {}
    const autoResults: Record<string, V2HttpEndpointExample> = {}
    const {
        userRequestExamples,
        autoRequestExamples,
        baseExample: baseRequestExample
    } = getRequestBodyExamples({
        endpoint,
        ir,
        skipOptionalRequestProperties
    })
    const {
        userResponseExamples,
        autoResponseExamples,
        baseExample: baseResponseExample
    } = getResponseExamples({
        endpoint
    })

    const firstAutoRequestName = Object.keys(autoRequestExamples)[0]
    const firstAutoRequestExample = Object.values(autoRequestExamples)[0]
    const firstAutoResponseExample = Object.values(autoResponseExamples)[0]

    for (const [name, requestExample] of Object.entries(userRequestExamples)) {
        userResults[name] = {
            request: requestExample,
            response: userResponseExamples[name] ?? firstAutoResponseExample ?? baseResponseExample,
            codeSamples: undefined
        }
    }
    for (const [name, responseExample] of Object.entries(userResponseExamples)) {
        userResults[name] = {
            request: userRequestExamples[name] ?? firstAutoRequestExample ?? baseRequestExample,
            response: responseExample,
            codeSamples: undefined
        }
    }

    if (Object.keys(userResults).length === 0) {
        autoResults[firstAutoRequestName ?? camelCase(`${endpoint.name.originalName}_example`)] = {
            request: firstAutoRequestExample ?? baseRequestExample,
            response: firstAutoResponseExample ?? baseResponseExample,
            codeSamples: undefined
        }
    }

    return {
        userFullExamples: userResults,
        autoFullExamples: autoResults
    }
}
