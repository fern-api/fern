import { mapValues } from "@fern-api/core-utils";
import { dynamic } from "@fern-api/ir-sdk";

export type Endpoint = Omit<dynamic.Endpoint, "examples" | "location" | "auth"> & {
    location: EndpointLocation;
    examples: EndpointExample[] | undefined;
    auth: Auth | undefined;
};

export type EndpointExample = Omit<dynamic.EndpointExample, "baseUrl" | "endpoint" | "auth"> & {
    baseURL: string | undefined;
    endpoint: EndpointLocation;
    auth: AuthValues | undefined;
};

export type EndpointLocation = Omit<dynamic.EndpointLocation, "method"> & {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

export type Auth = dynamic.Auth.Basic | dynamic.Auth.Bearer | dynamic.Auth.Header | dynamic.Auth.Oauth;

export type AuthValues =
    | dynamic.AuthValues.Basic
    | dynamic.AuthValues.Bearer
    | dynamic.AuthValues.Header
    | dynamic.AuthValues.Oauth;

export function convertEndpoints(endpoints: Record<string, dynamic.Endpoint>): Record<string, Endpoint> {
    return Object.fromEntries(
        Object.entries(endpoints)
            .map(([key, endpoint]) => [key, convertEndpoint(endpoint)])
            .filter(([_, endpoint]) => endpoint != null)
    );
}

function convertEndpoint(endpoint: dynamic.Endpoint): Endpoint | undefined {
    const method = endpoint.location.method;
    if (method === "HEAD") {
        return undefined;
    }
    return {
        ...endpoint,
        location: {
            // TODO: Temporary workaround; remove this once we release IR v57.16.
            ...endpoint.location,
            method
        },
        examples: endpoint.examples != null ? convertExamples(endpoint.examples) : undefined,
        auth: convertEndpointAuth(endpoint.auth)
    };
}

function convertExamples(examples: dynamic.EndpointExample[]): EndpointExample[] {
    return examples.map((example) => convertExample(example)).filter((example) => example != null);
}

function convertExample(example: dynamic.EndpointExample): EndpointExample | undefined {
    const method = example.endpoint.method;
    if (method === "HEAD") {
        return undefined;
    }
    return {
        ...example,
        baseURL: example.baseUrl,
        endpoint: {
            // TODO: Temporary workaround; remove this once we release IR v57.16.
            ...example.endpoint,
            method
        },
        auth: convertExampleAuth(example.auth)
    };
}

function convertExampleAuth(auth: dynamic.AuthValues | undefined): AuthValues | undefined {
    if (auth == null) {
        return undefined;
    }
    if (auth.type === "inferred") {
        return undefined;
    }

    return auth as AuthValues;
}

function convertEndpointAuth(auth: dynamic.Auth | undefined): Auth | undefined {
    if (auth == null) {
        return undefined;
    }
    if (auth.type === "inferred") {
        return undefined;
    }

    return auth as Auth;
}
