import { isNonNullish } from "@fern-api/core-utils";
import { EndpointExample, FullExample } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { convertFullExample } from "./utils/convertFullExample";

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
