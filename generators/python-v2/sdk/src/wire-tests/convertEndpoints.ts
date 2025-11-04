import { mapValues } from "@fern-api/core-utils";

import { dynamic } from "@fern-fern/ir-sdk/api";

export type Endpoint = Omit<dynamic.Endpoint, "examples"> & {
    examples: EndpointExample[] | undefined;
};

export type EndpointExample = Omit<dynamic.EndpointExample, "baseUrl"> & {
    baseURL: string | undefined;
};

export function convertEndpoints(endpoints: Record<string, dynamic.Endpoint>): Record<string, Endpoint> {
    return mapValues(endpoints, (endpoint: dynamic.Endpoint) => convertEndpoint(endpoint));
}

function convertEndpoint(endpoint: dynamic.Endpoint): Endpoint {
    return {
        ...endpoint,
        examples: endpoint.examples != null ? convertExamples(endpoint.examples) : undefined
    };
}

function convertExamples(examples: dynamic.EndpointExample[]): EndpointExample[] {
    return examples.map((example) => convertExample(example));
}

function convertExample(example: dynamic.EndpointExample): EndpointExample {
    return {
        ...example,
        baseURL: example.baseUrl
    };
}
