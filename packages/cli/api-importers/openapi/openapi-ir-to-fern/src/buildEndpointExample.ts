import { isNonNullish, noop } from "@fern-api/core-utils";
import { RawSchemas, recursivelyVisitRawTypeReference } from "@fern-api/fern-definition-schema";
import {
    EndpointExample,
    FullExample,
    LiteralExample,
    PathParameterExample,
    PrimitiveExample
} from "@fern-api/openapi-ir";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext.js";
import { convertEndpointResponseExample, convertFullExample } from "./utils/convertFullExample.js";

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
            // set global header example value
            if (info != null && typeof info === "object" && info.type != null) {
                // Extract the literal value from the type if it's a literal type.
                // Only literal types have a fixed, known value we can use for examples.
                const valueToUse = recursivelyVisitRawTypeReference<void | string>({
                    type: info.type,
                    _default: undefined,
                    validation: undefined,
                    visitor: {
                        primitive: noop,
                        map: noop,
                        list: noop,
                        optional: (inner) => inner,
                        nullable: (inner) => inner,
                        set: noop,
                        named: noop,
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
                    // If this header already exists from endpoint, override it; otherwise add it
                    const existingIdx = namedFullExamples.findIndex((e) => e.name === header);
                    const newExample = {
                        name: header,
                        value: FullExample.literal(LiteralExample.string(valueToUse))
                    };
                    if (existingIdx >= 0) {
                        namedFullExamples[existingIdx] = newExample;
                    } else {
                        namedFullExamples.push(newExample);
                    }
                    continue;
                }
            }

            // Skip if already in endpoint headers and no override value was found
            if (endpointHeaderNames.has(header)) {
                continue;
            }

            // Adds a header example using the header name as the value when no type information is available
            namedFullExamples.push({
                name: header,
                value: FullExample.primitive(PrimitiveExample.string(header))
            });
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
        if (convertedExample != null) {
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
