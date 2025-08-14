import { isNonNullish, noop } from "@fern-api/core-utils";
import { RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import {
    EndpointExample,
    FullExample,
    LiteralExample,
    PathParameterExample,
    PrimitiveExample,
    Schema
} from "@fern-api/openapi-ir";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { convertEndpointResponseExample, convertFullExample } from "./utils/convertFullExample";

export function buildEndpointExample({
    endpointExample,
    context
}: {
    endpointExample: EndpointExample;
    context: OpenApiIrConverterContext;
}): RawSchemas.ExampleEndpointCallSchema {
    const example: RawSchemas.ExampleEndpointCallSchema = {};
    if (endpointExample.type !== "full") {
        return endpointExample.value as RawSchemas.ExampleEndpointCallSchema;
    }

    if (endpointExample.name != null) {
        example.name = endpointExample.name;
    }

    if (endpointExample.description != null) {
        example.docs = endpointExample.description;
    }

    if (endpointExample.pathParameters != null && endpointExample.pathParameters.length > 0) {
        example["path-parameters"] = convertPathParameterExample(endpointExample.pathParameters);
    }

    if (endpointExample.queryParameters != null && endpointExample.queryParameters.length > 0) {
        example["query-parameters"] = convertQueryParameterExample(endpointExample.queryParameters);
    }

    const hasEndpointHeaders = endpointExample.headers != null && endpointExample.headers.length > 0;
    const globalHeaders = context.builder.getGlobalHeaders();
    const hasGlobalHeaders = Object.keys(globalHeaders).length > 0;

    const endpointHeaderNames = new Set(endpointExample.headers?.map((header) => header.name) ?? []);

    // Generate examples for headers
    if (hasEndpointHeaders || hasGlobalHeaders) {
        const namedFullExamples: NamedFullExample[] = [];

        // Auth header handling
        if (endpointExample.headers != null) {
            for (const header of endpointExample.headers) {
                // ignore auth headers for example generation
                if (header.name !== context.builder.getAuthHeaderName()) {
                    namedFullExamples.push(header);
                }
            }
        }

        // Global header handling
        for (const [header, info] of Object.entries(globalHeaders)) {
            // ignore global headers that are already in the endpoint headers
            if (endpointHeaderNames.has(header)) {
                continue;
            }

            // set global header example value
            if (info != null && typeof info === "object" && info.type != null) {
                // handling header types
                const valueToUse = recursivelyVisitRawTypeReference<void | string>({
                    type: info.type,
                    _default: undefined,
                    validation: undefined,
                    // generic visitor to extract the string value from the literal
                    // todo: add handling for other types in this visitor
                    visitor: {
                        primitive: (primitive) => primitive.toString(),
                        map: (map) => map.toString(),
                        list: (list) => list,
                        optional: (optional) => optional,
                        nullable: (nullable) => nullable,
                        set: (set) => set,
                        named: (named) => named,
                        literal: (literal) => {
                            if (literal.type === "string") {
                                return literal.string;
                            } else if (literal.type === "boolean") {
                                return literal.boolean.toString();
                            }
                            return undefined;
                        },
                        unknown: noop
                    }
                });

                if (valueToUse != null) {
                    namedFullExamples.push({
                        name: header,
                        value: FullExample.literal(LiteralExample.string(valueToUse))
                    });
                }
            } else {
                // Adds a header example using the header name as the value when no type information is available
                namedFullExamples.push({
                    name: header,
                    value: FullExample.primitive(PrimitiveExample.string(header))
                });
            }
        }

        example.headers = convertHeaderExamples({
            context,
            namedFullExamples
        });
    }

    if (endpointExample.request != null) {
        example.request = convertFullExample(endpointExample.request);
    }

    if (endpointExample.response != null) {
        example.response = convertEndpointResponseExample(endpointExample.response);
    }

    if (endpointExample.codeSamples != null && endpointExample.codeSamples.length > 0) {
        example["code-samples"] = endpointExample.codeSamples
            .map((codeSample) => {
                if (codeSample.type === "language") {
                    return {
                        name: codeSample.name ?? undefined,
                        docs: codeSample.description ?? undefined,
                        language: codeSample.language,
                        code: codeSample.code,
                        install: codeSample.install ?? undefined
                    };
                } else {
                    return {
                        name: codeSample.name ?? undefined,
                        docs: codeSample.description ?? undefined,
                        sdk: codeSample.sdk,
                        code: codeSample.code
                    };
                }
            })
            .filter(isNonNullish);
    }

    return example;
}

interface NamedFullExample {
    name: string;
    value: FullExample;
}

function convertPathParameterExample(
    pathParameterExamples: PathParameterExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    pathParameterExamples.forEach((pathParameterExample) => {
        const convertedExample = convertFullExample(pathParameterExample.value);
        if (convertedExample != null) {
            result[pathParameterExample.parameterNameOverride ?? pathParameterExample.name] = convertedExample;
        }
    });
    return result;
}

function convertQueryParameterExample(
    namedFullExamples: NamedFullExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    namedFullExamples.forEach((namedFullExample) => {
        const convertedExample = convertFullExample(namedFullExample.value);
        if (Array.isArray(convertedExample)) {
            result[namedFullExample.name] = convertedExample[0];
        } else if (convertedExample != null) {
            result[namedFullExample.name] = convertedExample;
        }
    });
    return result;
}

function convertHeaderExamples({
    context,
    namedFullExamples
}: {
    context: OpenApiIrConverterContext;
    namedFullExamples: NamedFullExample[];
}): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    namedFullExamples.forEach((namedFullExample) => {
        const convertedExample = convertFullExample(namedFullExample.value);
        if (convertedExample != null) {
            result[namedFullExample.name] = convertedExample;
        }
    });
    return result;
}
