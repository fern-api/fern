import { mapValues } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

export type Endpoint = Omit<FernIr.dynamic.Endpoint, "examples"> & {
    examples: EndpointExample[] | undefined;
};

export type EndpointExample = Omit<FernIr.dynamic.EndpointExample, "baseUrl"> & {
    baseURL: string | undefined;
};

export function convertEndpoints(endpoints: Record<string, FernIr.dynamic.Endpoint>): Record<string, Endpoint> {
    return mapValues(endpoints, (endpoint) => convertEndpoint(endpoint));
}

function convertEndpoint(endpoint: FernIr.dynamic.Endpoint): Endpoint {
    return {
        ...endpoint,
        examples: endpoint.examples != null ? convertExamples(endpoint.examples) : undefined
    };
}

function convertExamples(examples: FernIr.dynamic.EndpointExample[]): EndpointExample[] {
    return examples.map((example) => convertExample(example));
}

function convertExample(example: FernIr.dynamic.EndpointExample): EndpointExample {
    return {
        ...example,
        baseURL: example.baseUrl
    };
}
