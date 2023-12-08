import { assertNever } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import {
    FullExample,
    FullOneOfExample,
    KeyValuePair,
    LiteralExample,
    PrimitiveExample
} from "@fern-fern/openapi-ir-model/example";
import { EndpointExample } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";

export function buildEndpointExample({
    endpointExample,
    context
}: {
    endpointExample: EndpointExample;
    context: OpenApiIrConverterContext;
}): RawSchemas.ExampleEndpointCallSchema {
    return {
        "path-parameters":
            endpointExample.pathParameters != null && endpointExample.pathParameters.length > 0
                ? convertNamedFullExamples(endpointExample.pathParameters)
                : undefined,
        "query-parameters":
            endpointExample.queryParameters != null && endpointExample.queryParameters.length > 0
                ? convertQueryParameterExample(endpointExample.queryParameters)
                : undefined,
        headers:
            endpointExample.headers != null && endpointExample.headers.length > 0
                ? convertHeaderExamples({ context, namedFullExamples: endpointExample.headers })
                : undefined,
        request: endpointExample.request != null ? convertFullExample(endpointExample.request) : undefined,
        response: endpointExample.response != null ? { body: convertFullExample(endpointExample.response) } : undefined
    };
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
        } else {
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
        if (globalHeaderNames.has(namedFullExample.name)) {
            return;
        } else {
            result[namedFullExample.name] = convertFullExample(namedFullExample.value);
        }
    });
    return result;
}

function convertFullExample(fullExample: FullExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (fullExample.type) {
        case "primitive":
            return convertPrimitive(fullExample.primitive);
        case "object":
            return convertObject(fullExample.properties);
        case "array":
            return convertArrayExample(fullExample.array);
        case "map":
            return convertMapExample(fullExample.map);
        case "oneOf":
            return convertOneOfExample(fullExample.oneOf);
        case "enum":
            return fullExample.enum;
        case "literal":
            return convertLiteralExample(fullExample.literal);
        case "unknown":
            return convertFullExample(fullExample.unknown);
        default:
            assertNever(fullExample);
    }
}

function convertPrimitive(primitiveExample: PrimitiveExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (primitiveExample.type) {
        case "int":
            return primitiveExample.int;
        case "int64":
            return primitiveExample.int64;
        case "float":
            return primitiveExample.float;
        case "double":
            return primitiveExample.double;
        case "string":
            return primitiveExample.string;
        case "datetime":
            return primitiveExample.datetime;
        case "date":
            return primitiveExample.date;
        case "base64":
            return primitiveExample.base64;
        case "boolean":
            return primitiveExample.boolean;
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
        return convertObject(oneOf.discriminated);
    }
    return convertFullExample(oneOf.undisciminated);
}

function convertLiteralExample(literal: LiteralExample): RawSchemas.ExampleTypeReferenceSchema {
    switch (literal.type) {
        case "string":
            return literal.string;
        case "boolean":
            return literal.boolean;
        default:
            assertNever(literal);
    }
}
