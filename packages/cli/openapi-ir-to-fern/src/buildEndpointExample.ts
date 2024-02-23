import { assertNever, isNonNullish } from "@fern-api/core-utils";
import {
    EndpointExample,
    FullExample,
    FullOneOfExample,
    KeyValuePair,
    LiteralExample,
    PrimitiveExample
} from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export function buildEndpointExample({
    endpointExample,
    context
}: {
    endpointExample: EndpointExample;
    context: OpenApiIrConverterContext;
}): RawSchemas.ExampleEndpointCallSchema {
    const example: RawSchemas.ExampleEndpointCallSchema = {};

    if (endpointExample.name != null) {
        example.name = endpointExample.name;
    }

    if (endpointExample.description != null) {
        example.docs = endpointExample.description;
    }

    if (endpointExample.pathParameters != null && endpointExample.pathParameters.length > 0) {
        example["path-parameters"] = convertNamedFullExamples(endpointExample.pathParameters);
    }

    if (endpointExample.queryParameters != null && endpointExample.queryParameters.length > 0) {
        example["query-parameters"] = convertQueryParameterExample(endpointExample.queryParameters);
    }

    if (endpointExample.headers != null && endpointExample.headers.length > 0) {
        example.headers = convertHeaderExamples({ context, namedFullExamples: endpointExample.headers });
    }

    if (endpointExample.request != null) {
        example.request = convertFullExample(endpointExample.request);
    }

    if (endpointExample.response != null) {
        example.response = { body: convertFullExample(endpointExample.response) };
    }

    if (endpointExample.response != null) {
        example.response = { body: convertFullExample(endpointExample.response) };
    }

    if (endpointExample.codeSamples.length > 0) {
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

function convertNamedFullExamples(
    namedFullExamples: NamedFullExample[]
): Record<string, RawSchemas.ExampleTypeReferenceSchema> {
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    namedFullExamples.map(
        (namedFullExample) => (result[namedFullExample.name] = convertFullExample(namedFullExample.value))
    );
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
    const globalHeaderNames = context.builder.getGlobalHeaderNames();
    const result: Record<string, RawSchemas.ExampleTypeReferenceSchema> = {};
    namedFullExamples.forEach((namedFullExample) => {
        const convertedExample = convertFullExample(namedFullExample.value);
        if (globalHeaderNames.has(namedFullExample.name)) {
            return;
        } else if (convertedExample != null) {
            result[namedFullExample.name] = convertedExample;
        }
    });
    return result;
}

function convertFullExample(fullExample: FullExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (fullExample.type) {
        case "primitive":
            return convertPrimitive(fullExample.value);
        case "object":
            return convertObject(fullExample.properties);
        case "array":
            return convertArrayExample(fullExample.value);
        case "map":
            return convertMapExample(fullExample.value);
        case "oneOf":
            return convertOneOfExample(fullExample.value);
        case "enum":
            return fullExample.value;
        case "literal":
            return convertLiteralExample(fullExample.value);
        case "unknown":
            return convertFullExample(fullExample.value);
        default:
            assertNever(fullExample);
    }
}

function convertPrimitive(primitiveExample: PrimitiveExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (primitiveExample.type) {
        case "int":
            return primitiveExample.value;
        case "int64":
            return primitiveExample.value;
        case "float":
            return primitiveExample.value;
        case "double":
            return primitiveExample.value;
        case "string": {
            if (primitiveExample.value.startsWith("$")) {
                return `${primitiveExample.value.slice(1)}`;
            }
            return primitiveExample.value;
        }
        case "datetime":
            try {
                // remove milliseconds from the datetime
                return primitiveExample.value.toISOString().replace(/\.\d{3}Z$/, "Z");
            } catch (e) {
                return "2024-01-15T09:30:00Z";
            }
        case "date":
            return primitiveExample.value;
        case "base64":
        case "boolean":
            return primitiveExample.value;
        default:
            assertNever(primitiveExample);
    }
}

function convertObject(object: Record<PropertyKey, FullExample>): RawSchemas.ExampleTypeReferenceSchema {
    return Object.fromEntries(
        Object.entries(object).map(([propertyKey, fullExample]) => {
            return [propertyKey, convertFullExample(fullExample)];
        })
    );
}

function convertArrayExample(fullExamples: FullExample[]): RawSchemas.ExampleTypeReferenceSchema {
    return fullExamples.map((fullExample) => {
        return convertFullExample(fullExample);
    });
}

function convertMapExample(pairs: KeyValuePair[]): RawSchemas.ExampleTypeReferenceSchema {
    return Object.fromEntries(
        pairs.map((pair) => {
            return [convertPrimitive(pair.key), convertFullExample(pair.value)];
        })
    );
}

function convertOneOfExample(oneOf: FullOneOfExample): RawSchemas.ExampleTypeReferenceSchema {
    if (oneOf.type === "discriminated") {
        return convertObject(oneOf.value);
    }
    return convertFullExample(oneOf.value);
}
function convertLiteralExample(literal: LiteralExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (literal.type) {
        case "string":
            return literal.value;
        case "boolean":
            return literal.value;
        default:
            assertNever(literal);
    }
}
