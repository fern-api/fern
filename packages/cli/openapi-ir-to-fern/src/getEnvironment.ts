import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";

export type Environment = SingleUrlEnvironment | MultiUrlEnvironment;

export interface SingleUrlEnvironment {
    type: "single";
    environmentToUrl: Record<string, string>;
}

export interface MultiUrlEnvironment {
    type: "multi";
    serviceToUrl: Record<string, string>;
    defaultUrl: string;
}

export function getEnvironments(openApiFile: OpenAPIFile): Environment | undefined {
    let endpointUrlOverrides = false;

    const defaultUrls: Record<string, string> = {};
    for (const server of openApiFile.servers) {
        if (server.name == null) {
            // TODO(dsinghvi): log that we are ignoring server because no name
            continue;
        }
        defaultUrls[server.name] = server.url;
    }

    const overrideUrls: Record<string, string> = {};
    for (const endpoint of openApiFile.endpoints) {
        for (const server of endpoint.server) {
            if (!endpointUrlOverrides) {
                endpointUrlOverrides = true;
            }
            if (server.name == null) {
                throw new Error(`Server must have x-name: ${endpoint.method + " " + endpoint.path}`);
            }
            overrideUrls[server.name] = server.url;
        }
    }

    if (Object.keys(defaultUrls).length === 0 && Object.keys(overrideUrls).length === 0) {
        return undefined;
    }

    if (!endpointUrlOverrides) {
        return {
            type: "single",
            environmentToUrl: defaultUrls,
        };
    }

    const defaultUrl = Object.keys(defaultUrls)[0];
    if (defaultUrl == null) {
        throw new Error("Expected a server at the top-level");
    }
    return {
        type: "multi",
        defaultUrl,
        serviceToUrl: {
            ...defaultUrls,
            ...overrideUrls,
        },
    };
}
