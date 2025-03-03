import { mapValues } from "@fern-api/core-utils";
import { dynamic } from "@fern-api/ir-sdk";
import { convertAuthValues } from "./convertAuthValues";
import { Auth, convertAuth } from "./convertAuth";

export type Endpoint = Omit<dynamic.Endpoint, "auth"> & {
    auth: Auth | undefined;
};

export function convertEndpoints(endpoints: Record<string, dynamic.Endpoint>): Record<string, Endpoint> {
    return mapValues(endpoints, (endpoint) => convertEndpoint(endpoint));
}

function convertEndpoint(endpoint: dynamic.Endpoint): Endpoint {
    return {
        ...endpoint,
        auth: endpoint.auth != null ? convertAuth(endpoint.auth) : undefined,
        examples: endpoint.examples != null ? convertExamples(endpoint.examples) : undefined,
    };
}

function convertExamples(examples: dynamic.EndpointExample[]): dynamic.EndpointExample[] {
    return examples.map((example) => convertExample(example));
}

function convertExample(example: dynamic.EndpointExample): dynamic.EndpointExample {
    return {
        ...example,
        auth: example.auth != null ? convertAuthValues(example.auth) : undefined,
    };
}