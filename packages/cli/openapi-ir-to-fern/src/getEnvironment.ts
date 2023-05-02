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
        defaultUrls[server.name] = maybeSanitizeUpgradedServerUrl(server.url);
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
            overrideUrls[server.name] = maybeSanitizeUpgradedServerUrl(server.url);
        }
    }

    if (Object.keys(defaultUrls).length === 0 && Object.keys(overrideUrls).length === 0) {
        // if a single url without name then name it default
        if (openApiFile.servers.length === 1 && openApiFile.servers[0] != null) {
            return {
                type: "single",
                environmentToUrl: {
                    default: maybeSanitizeUpgradedServerUrl(openApiFile.servers[0].url),
                },
            };
        }
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

function maybeSanitizeUpgradedServerUrl(url: string): string {
    return url.replace("//https", "https");
}
