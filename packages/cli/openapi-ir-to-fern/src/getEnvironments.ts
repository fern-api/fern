import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { mapValues } from "lodash-es";

export type Environments = SingleUrlEnvironments | MultiUrlEnvironments;

export interface SingleUrlEnvironments {
    type: "single";
    environmentToUrl: Record<string, string>;
    endpointPathPrefix: string;
}

export interface MultiUrlEnvironments {
    type: "multi";
    serviceToUrl: Record<string, string>;
    defaultUrl: string;
}

export function getEnvironments(openApiFile: OpenAPIIntermediateRepresentation): Environments | undefined {
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
                endpointPathPrefix: "",
            };
        }
        return undefined;
    }

    if (!endpointUrlOverrides) {
        const sharedSuffix = getSharedSuffix(Object.values(defaultUrls).map(getPathname));
        return {
            type: "single",
            environmentToUrl: mapValues(defaultUrls, (url) => url.slice(0, url.length - sharedSuffix.length)),
            endpointPathPrefix: sharedSuffix,
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

function getPathname(url: string): string {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    if (pathname.endsWith("/")) {
        return pathname.slice(0, -1);
    } else {
        return pathname;
    }
}

function getSharedSuffix(strings: string[]): string {
    let suffix = "";

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
    while (true) {
        const chars = strings.map((s) => s[s.length - suffix.length - 1]);
        const char = chars[0];
        if (char == null || chars.some((c) => c !== char)) {
            break;
        }
        suffix = char + suffix;
    }

    return suffix;
}
