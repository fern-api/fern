import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import {
    FullExample,
    FullOneOfExample,
    KeyValuePair,
    LiteralExample,
    PrimitiveExample,
    WebsocketSessionExample
} from "@fern-api/openapi-ir";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export function buildWebsocketSessionExample({
    websocketExample,
    context
}: {
    websocketExample: WebsocketSessionExample;
    context: OpenApiIrConverterContext;
}): RawSchemas.ExampleWebSocketSession {
    const example: RawSchemas.ExampleWebSocketSession = {
        messages: []
    };

    if (websocketExample.name != null) {
        example.name = websocketExample.name;
    }

    if (websocketExample.description != null) {
        example.docs = websocketExample.description;
    }

    if (websocketExample.queryParameters != null && websocketExample.queryParameters.length > 0) {
        example["query-parameters"] = convertQueryParameterExample(websocketExample.queryParameters);
    }

    if (websocketExample.headers != null && websocketExample.headers.length > 0) {
        example.headers = convertHeaderExamples({ context, namedFullExamples: websocketExample.headers });
    }

    for (const message of websocketExample.messages) {
        const convertedMessage = convertFullExample(message.payload);
        if (convertedMessage != null) {
            example.messages.push({
                type: message.messageType,
                body: convertedMessage
            });
        }
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
