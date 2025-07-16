import { isNonNullish } from '@fern-api/core-utils'
import { RawSchemas } from '@fern-api/fern-definition-schema'
import { EndpointExample, FullExample, PathParameterExample, PrimitiveExample } from '@fern-api/openapi-ir'
import { Schema } from '@fern-api/openapi-ir'

import { OpenApiIrConverterContext } from './OpenApiIrConverterContext'
import { convertEndpointResponseExample, convertFullExample } from './utils/convertFullExample'

export function buildEndpointExample({
    endpointExample,
    context
}: {
    endpointExample: EndpointExample
    context: OpenApiIrConverterContext
}): RawSchemas.ExampleEndpointCallSchema {
    const example: RawSchemas.ExampleEndpointCallSchema = {}
    if (endpointExample.type !== 'full') {
        return endpointExample.value as RawSchemas.ExampleEndpointCallSchema
    }

    if (endpointExample.name != null) {
        example.name = endpointExample.name
    }

    if (endpointExample.description != null) {
        example.docs = endpointExample.description
    }

    if (endpointExample.pathParameters != null && endpointExample.pathParameters.length > 0) {
        example['path-parameters'] = convertPathParameterExample(endpointExample.pathParameters)
    }

    if (endpointExample.queryParameters != null && endpointExample.queryParameters.length > 0) {
        example['query-parameters'] = convertQueryParameterExample(endpointExample.queryParameters)
    }

    const hasEndpointHeaders = endpointExample.headers != null && endpointExample.headers.length > 0
    const hasGlobalHeaders = Object.keys(context.builder.getGlobalHeaders()).length > 0

    const endpointHeaderNames = new Set(endpointExample.headers?.map((header) => header.name) ?? [])

    if (hasEndpointHeaders || hasGlobalHeaders) {
        const namedFullExamples: NamedFullExample[] = [
            ...(endpointExample.headers ?? []),
            ...(Object.entries(context.builder.getGlobalHeaders())
                .filter(([header]) => !endpointHeaderNames.has(header))
                .map(([header, schema]) => ({
                    name: header,
                    value: FullExample.primitive(PrimitiveExample.string(header))
                })) ?? [])
        ]

        example.headers = convertHeaderExamples({
            context,
            namedFullExamples
        })
    }

    if (endpointExample.request != null) {
        example.request = convertFullExample(endpointExample.request)
    }

    if (endpointExample.response != null) {
        example.response = convertEndpointResponseExample(endpointExample.response)
    }

    if (endpointExample.codeSamples != null && endpointExample.codeSamples.length > 0) {
        example['code-samples'] = endpointExample.codeSamples
            .map((codeSample) => {
                if (codeSample.type === 'language') {
                    return {
                        name: codeSample.name ?? undefined,
                        docs: codeSample.description ?? undefined,
                        language: codeSample.language,
                        code: codeSample.code,
                        install: codeSample.install ?? undefined
                    }
                } else {
                    return {
                        name: codeSample.name ?? undefined,
                        docs: codeSample.description ?? undefined,
                        sdk: codeSample.sdk,
                        code: codeSample.code
                    }
                }
            })
            .filter(isNonNullish)
    }

    return example
}

interface NamedFullExample {
    name: string
    value: FullExample
}

function convertPathParameterExample(
    pathParameterExamples: PathParameterExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {}
    pathParameterExamples.forEach((pathParameterExample) => {
        const convertedExample = convertFullExample(pathParameterExample.value)
        if (convertedExample != null) {
            result[pathParameterExample.parameterNameOverride ?? pathParameterExample.name] = convertedExample
        }
    })
    return result
}

function convertQueryParameterExample(
    namedFullExamples: NamedFullExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {}
    namedFullExamples.forEach((namedFullExample) => {
        const convertedExample = convertFullExample(namedFullExample.value)
        if (Array.isArray(convertedExample)) {
            result[namedFullExample.name] = convertedExample[0]
        } else if (convertedExample != null) {
            result[namedFullExample.name] = convertedExample
        }
    })
    return result
}

function convertHeaderExamples({
    context,
    namedFullExamples
}: {
    context: OpenApiIrConverterContext
    namedFullExamples: NamedFullExample[]
}): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {}
    namedFullExamples.forEach((namedFullExample) => {
        const convertedExample = convertFullExample(namedFullExample.value)
        if (convertedExample != null) {
            result[namedFullExample.name] = convertedExample
        }
    })
    return result
}
