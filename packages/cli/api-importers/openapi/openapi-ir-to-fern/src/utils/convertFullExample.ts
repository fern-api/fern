import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    EndpointResponseExample,
    FullExample,
    FullOneOfExample,
    KeyValuePair,
    LiteralExample,
    PrimitiveExample
} from "@fern-api/openapi-ir";

export function convertFullExample(fullExample: FullExample): RawSchemas.ExampleTypeReferenceSchema {
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

export function convertEndpointResponseExample(
    endpointResponseExample: EndpointResponseExample
): RawSchemas.ExampleStreamResponseSchema | RawSchemas.ExampleBodyResponseSchema {
    switch (endpointResponseExample.type) {
        case "withStreaming": {
            if (endpointResponseExample.sse) {
                return {
                    stream: convertSseExample(endpointResponseExample.events)
                };
            } else {
                return {
                    stream: convertArrayExample(endpointResponseExample.events)
                };
            }
        }
        case "withoutStreaming":
            return {
                body: convertFullExample(endpointResponseExample.value)
            };
        default:
            assertNever(endpointResponseExample);
    }
}

function convertPrimitive(primitiveExample: PrimitiveExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (primitiveExample.type) {
        case "int":
            return primitiveExample.value;
        case "int64":
            return primitiveExample.value;
        case "uint":
            return primitiveExample.value;
        case "uint64":
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
                if (!primitiveExample.value.endsWith("Z") && !primitiveExample.value.includes("+")) {
                    primitiveExample.value += "Z";
                }
                return new Date(primitiveExample.value).toISOString().replace(/\.\d{3}Z$/, "Z");
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

function convertSseExample(fullExamples: FullExample[]): RawSchemas.ExampleSseEventSchema[] {
    return fullExamples.map((fullExample) => {
        return { event: "", data: convertFullExample(fullExample) };
    });
}

function convertArrayExample(fullExamples: FullExample[]): RawSchemas.ExampleTypeReferenceSchema[] {
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
