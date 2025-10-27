import { isRawMultipleBaseUrlsEnvironment, RawSchemas } from "@fern-api/fern-definition-schema";

import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { extractPathSegment, generateWebsocketUrlId, getProtocol } from "./utils/generateUrlId";

interface ApiServerConfig {
    url: string;
    audiences?: string[];
}

interface SingleApiServer {
    type?: "single";
    name?: string;
    description?: string;
    url: string;
    audiences?: string[];
}

interface GroupedMultiApiServer {
    type: "grouped";
    name?: string;
    description?: string;
    urls: Record<string, ApiServerConfig>;
}

type ServerType = SingleApiServer | GroupedMultiApiServer;

function isGroupedMultiApiServer(server: unknown): server is GroupedMultiApiServer {
    return (
        typeof server === "object" &&
        server !== null &&
        "type" in server &&
        (server as { type?: string }).type === "grouped"
    );
}

const DEFAULT_URL_NAME = "Base";
const DEFAULT_ENVIRONMENT_NAME = "Default";

/**
 * Extract the host from a URL (e.g., "https://api.com/foo" -> "api.com")
 */
function extractHost(url: string): string | undefined {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return undefined;
    }
}

/**
 * Get environment name from server name, or use default if not specified.
 * We rely on the OpenAPI/AsyncAPI server names (if provided) rather than
 * trying to infer from URL patterns.
 */
function getEnvironmentName(serverName: string | undefined): string {
    return serverName ?? DEFAULT_ENVIRONMENT_NAME;
}

/**
 * Group HTTP and WebSocket servers by host to merge them into unified environments.
 * All servers with the same host are grouped together.
 */
interface GroupedServers {
    environmentName: string;
    httpServers: Array<{ name: string | undefined; url: string; audiences?: string[] }>;
    websocketServers: Array<{ name: string | undefined; url: string; audiences?: string[] }>;
}

function groupServersByHost(
    httpServers: ServerType[],
    websocketServers: Array<{ name: string | undefined; url: string; audiences?: string[] }>
): Map<string, GroupedServers> {
    const grouped = new Map<string, GroupedServers>();

    // Process HTTP servers - group by host
    for (const server of httpServers) {
        if (isGroupedMultiApiServer(server)) {
            // Handle grouped multi-API servers separately - these define their own structure
            continue;
        }

        if (!("url" in server) || !server.url) {
            continue;
        }

        const host = extractHost(server.url) ?? server.url;
        if (!grouped.has(host)) {
            grouped.set(host, {
                environmentName: getEnvironmentName(server.name),
                httpServers: [],
                websocketServers: []
            });
        }
        grouped.get(host)?.httpServers.push({
            name: server.name,
            url: server.url,
            audiences: server.audiences
        });
    }

    // Process WebSocket servers - group by host
    for (const server of websocketServers) {
        const host = extractHost(server.url) ?? server.url;
        if (!grouped.has(host)) {
            grouped.set(host, {
                environmentName: getEnvironmentName(server.name),
                httpServers: [],
                websocketServers: []
            });
        }
        grouped.get(host)?.websocketServers.push(server);
    }

    return grouped;
}

function extractUrlsFromEnvironmentSchema(
    record: Record<string, RawSchemas.EnvironmentSchema>
): Record<string, string> {
    return Object.entries(record).reduce<Record<string, string>>((acc, [name, schemaOrUrl]) => {
        if (isRawMultipleBaseUrlsEnvironment(schemaOrUrl)) {
            Object.entries(schemaOrUrl.urls).forEach(([urlsName, urlsValue]) => {
                acc[urlsName] = urlsValue;
            });
        } else {
            acc[name] = typeof schemaOrUrl === "string" ? schemaOrUrl : schemaOrUrl.url;
        }

        return acc;
    }, {});
}

export function buildEnvironments(context: OpenApiIrConverterContext): void {
    if (context.environmentOverrides != null) {
        for (const [environment, environmentDeclaration] of Object.entries(
            context.environmentOverrides.environments ?? {}
        )) {
            context.builder.addEnvironment({
                name: environment,
                schema: environmentDeclaration
            });
        }
        if (context.environmentOverrides["default-environment"] != null) {
            context.builder.setDefaultEnvironment(context.environmentOverrides["default-environment"]);
        }
        if (context.environmentOverrides["default-url"] != null) {
            context.builder.setDefaultUrl(context.environmentOverrides["default-url"]);
        }
        return;
    }

    const topLevelServersWithName: Record<
        string,
        string | RawSchemas.SingleBaseUrlEnvironmentSchema | RawSchemas.MultipleBaseUrlsEnvironmentSchema
    > = {};
    const topLevelSkippedServers = [];

    const hasGroupedMultipleApis = context.ir.servers.some((server) => isGroupedMultiApiServer(server));

    const servers = context.ir.servers as ServerType[];

    for (const server of servers) {
        // Handle grouped multiple base URLs
        if (isGroupedMultiApiServer(server)) {
            const multiUrlEnvironment: RawSchemas.MultipleBaseUrlsEnvironmentSchema = {
                urls: {}
            };

            for (const [apiName, apiConfig] of Object.entries(server.urls)) {
                multiUrlEnvironment.urls[apiName] = apiConfig.url;
            }

            if (server.name) {
                topLevelServersWithName[server.name] = multiUrlEnvironment;
            }
        } else if ("url" in server && server.url) {
            // Handle regular single URL servers
            const environmentSchema = server.audiences
                ? {
                      url: server.url,
                      audiences: server.audiences
                  }
                : server.url;
            if (server.name == null) {
                topLevelSkippedServers.push(environmentSchema);
                continue;
            }
            topLevelServersWithName[server.name] = environmentSchema;
        }
    }

    const endpointLevelServersByName: Record<
        string,
        Array<{ url: string | undefined; audiences: string[] | undefined }>
    > = {};
    const endpointLevelServersWithName: Record<string, string | RawSchemas.SingleBaseUrlEnvironmentSchema> = {};
    const endpointLevelSkippedServers = [];

    for (const endpoint of context.ir.endpoints) {
        for (const server of endpoint.servers) {
            if (server.url == null && server.name != null) {
                if (!endpointLevelServersByName[server.name]) {
                    endpointLevelServersByName[server.name] = [];
                }
                continue;
            }

            if (server.url == null) {
                continue;
            }

            const environmentSchema = server.audiences
                ? {
                      url: server.url,
                      audiences: server.audiences
                  }
                : server.url;
            if (server.name == null) {
                endpointLevelSkippedServers.push(environmentSchema);
                continue;
            }

            // Track servers with URLs by name
            if (!endpointLevelServersByName[server.name]) {
                endpointLevelServersByName[server.name] = [];
            }
            endpointLevelServersByName[server.name]?.push({
                url: server.url,
                audiences: server.audiences
            });

            endpointLevelServersWithName[server.name] = environmentSchema;
        }
    }

    const websocketServersWithName: Record<string, string | RawSchemas.SingleBaseUrlEnvironmentSchema> = {};
    const websocketSkippedServers = [];
    for (const server of context.ir.websocketServers) {
        context.logger.debug(
            `[buildEnvironments] Processing WebSocket server: name="${server.name}", url="${server.url}"`
        );
        const environmentSchema = server.audiences
            ? {
                  url: server.url,
                  audiences: server.audiences
              }
            : server.url;
        if (server.name == null) {
            websocketSkippedServers.push(environmentSchema);
            continue;
        }
        websocketServersWithName[server.name] = environmentSchema;
    }

    const numTopLevelServersWithName = Object.keys(topLevelServersWithName).length;
    const hasTopLevelServersWithName = numTopLevelServersWithName > 0;
    const hasEndpointLevelServersWithName = Object.keys(endpointLevelServersWithName).length > 0;
    const hasEndpointServersWithoutUrls = Object.keys(endpointLevelServersByName).some(
        (name) => endpointLevelServersByName[name]?.length === 0
    );
    const hasWebsocketServersWithName = Object.keys(websocketServersWithName).length > 0;

    // Group servers by host when feature flag is enabled and we have both HTTP and WebSocket servers
    //
    // URL ID Generation Strategy:
    // When groupEnvironmentsByHost is enabled, URL IDs are generated from path segments only:
    //   - wss://api.com/v0/foo → "foo"
    //   - wss://api.com/v0/bar → "bar"
    //
    // Protocol Collision Handling:
    // If multiple protocols use the same path segment, protocol is appended to resolve collision:
    //   - https://api.com/v0/foo → "foo" (first occurrence, no protocol)
    //   - wss://api.com/v0/foo → "foo_wss" (collision detected, protocol appended)
    //
    // This ensures channels can correctly reference their environment URLs while keeping
    // URL IDs clean and readable when there are no collisions.
    if (
        context.groupEnvironmentsByHost &&
        hasWebsocketServersWithName &&
        (hasTopLevelServersWithName || context.ir.servers.length > 0)
    ) {
        const websocketServersList = Object.entries(websocketServersWithName).map(([name, schema]) => ({
            name,
            url: typeof schema === "string" ? schema : schema.url,
            audiences: typeof schema === "string" ? undefined : schema.audiences
        }));

        const groupedByHost = groupServersByHost(servers, websocketServersList);

        // If we successfully grouped servers by host, use that grouping
        if (groupedByHost.size > 0) {
            let firstEnvironment = true;
            for (const [_host, group] of groupedByHost.entries()) {
                const urls: Record<string, string> = {};

                // Collect all servers to check for path collisions
                const allServers: Array<{ name: string | undefined; url: string; isHttp: boolean }> = [
                    ...group.httpServers.map((s) => ({ ...s, isHttp: true })),
                    ...group.websocketServers.map((s) => ({ ...s, isHttp: false }))
                ];

                // Track which protocols use each path segment
                const pathToProtocols = new Map<string, Set<string>>();
                for (const server of allServers) {
                    const pathSegment = extractPathSegment(server.url);
                    const protocol = getProtocol(server.url);
                    if (pathSegment && protocol) {
                        if (!pathToProtocols.has(pathSegment)) {
                            pathToProtocols.set(pathSegment, new Set());
                        }
                        pathToProtocols.get(pathSegment)?.add(protocol);
                    }
                }

                // Add HTTP URLs
                if (group.httpServers.length > 0) {
                    const firstServer = group.httpServers[0];
                    if (firstServer != null) {
                        // Use the first HTTP URL as the base
                        urls[DEFAULT_URL_NAME] = firstServer.url;
                        context.setUrlId(firstServer.url, DEFAULT_URL_NAME);
                    }

                    // Add any additional HTTP URLs with collision-aware IDs
                    for (let i = 1; i < group.httpServers.length; i++) {
                        const server = group.httpServers[i];
                        if (server != null) {
                            const pathSegment = extractPathSegment(server.url);
                            const protocol = getProtocol(server.url);
                            const protocols = pathSegment ? pathToProtocols.get(pathSegment) : undefined;
                            const hasCollision = protocols && protocols.size > 1;

                            // Only append protocol for non-HTTPS protocols when there's a collision
                            const needsProtocol = hasCollision && protocol !== "https";
                            const urlId = needsProtocol ? `${pathSegment}_${protocol}` : pathSegment || `Http${i + 1}`;

                            context.logger.debug(
                                `[buildEnvironments] HTTP server: url="${server.url}", pathSegment="${pathSegment}", protocol="${protocol}", hasCollision=${hasCollision}, urlId="${urlId}"`
                            );
                            urls[urlId] = server.url;
                            context.setUrlId(server.url, urlId);
                        }
                    }
                }

                // Add WebSocket URLs with collision-aware IDs
                for (const wsServer of group.websocketServers) {
                    const pathSegment = extractPathSegment(wsServer.url);
                    const protocol = getProtocol(wsServer.url);
                    const protocols = pathSegment ? pathToProtocols.get(pathSegment) : undefined;
                    const hasCollision = protocols && protocols.size > 1;

                    // For WebSocket URLs, always append protocol (wss) when there's a collision
                    const urlId = hasCollision
                        ? `${pathSegment}_${protocol}`
                        : generateWebsocketUrlId(wsServer.name, wsServer.url, true);

                    context.logger.debug(
                        `[buildEnvironments] WebSocket server: name="${wsServer.name}", url="${wsServer.url}", pathSegment="${pathSegment}", protocol="${protocol}", hasCollision=${hasCollision}, urlId="${urlId}"`
                    );
                    urls[urlId] = wsServer.url;
                    context.setUrlId(wsServer.url, urlId);
                }

                // Only create multi-URL environment if we have multiple URLs
                if (Object.keys(urls).length > 1) {
                    context.builder.addEnvironment({
                        name: group.environmentName,
                        schema: { urls }
                    });
                } else if (Object.keys(urls).length === 1) {
                    // Single URL environment
                    const singleUrl = Object.values(urls)[0];
                    if (singleUrl != null) {
                        context.builder.addEnvironment({
                            name: group.environmentName,
                            schema: singleUrl
                        });
                    }
                }

                if (firstEnvironment) {
                    context.builder.setDefaultEnvironment(group.environmentName);
                    if (Object.keys(urls).length > 1) {
                        context.builder.setDefaultUrl(DEFAULT_URL_NAME);
                    }
                    firstEnvironment = false;
                }
            }
            return;
        }
    }

    if (
        !hasTopLevelServersWithName &&
        !hasEndpointLevelServersWithName &&
        hasWebsocketServersWithName &&
        context.ir.servers.length === 0
    ) {
        for (const [name, schema] of Object.entries(websocketServersWithName)) {
            context.builder.addEnvironment({
                name,
                schema
            });
        }
        context.builder.setDefaultEnvironment(Object.keys(websocketServersWithName)[0] as string);
        context.builder.setDefaultUrl(DEFAULT_URL_NAME);
        return;
    }

    // Endpoint level servers must always have a name attached. If they don't, we'll throw an error.
    if (endpointLevelSkippedServers.length > 0) {
        context.logger.debug(
            `Skipping endpoint level servers ${endpointLevelSkippedServers
                .map((server) => (typeof server === "string" ? server : server.url))
                .join(", ")} because x-fern-server-name was not provided.`
        );
    }

    if (!hasTopLevelServersWithName) {
        const singleURL = context.ir.servers[0]?.url;
        const singleURLAudiences = context.ir.servers[0]?.audiences;
        if (singleURL != null) {
            const newEnvironmentSchema = singleURLAudiences
                ? {
                      url: singleURL,
                      audiences: singleURLAudiences
                  }
                : singleURL;
            topLevelServersWithName[DEFAULT_ENVIRONMENT_NAME] = newEnvironmentSchema;
        }
    }

    const topLevelServerUrls = Object.values(topLevelServersWithName).map((schema) =>
        typeof schema === "string"
            ? schema
            : isRawMultipleBaseUrlsEnvironment(schema)
              ? Object.values(schema.urls)[0]
              : schema.url
    );
    const filteredSkippedServers = topLevelSkippedServers.filter((server) => {
        const serverUrl = typeof server === "string" ? server : server.url;
        return !topLevelServerUrls.includes(serverUrl);
    });
    if (filteredSkippedServers.length > 0) {
        context.logger.debug(
            `Skipping top level servers ${filteredSkippedServers
                .map((server) => (typeof server === "string" ? server : server.url))
                .join(", ")} because x-fern-server-name was not provided.`
        );
    }

    if (hasGroupedMultipleApis) {
        let firstEnvironment = true;
        for (const [name, schema] of Object.entries(topLevelServersWithName)) {
            context.builder.addEnvironment({
                name,
                schema
            });
            if (firstEnvironment) {
                context.builder.setDefaultEnvironment(name);
                if (isRawMultipleBaseUrlsEnvironment(schema)) {
                    const firstApiName = Object.keys(schema.urls)[0];
                    if (firstApiName) {
                        context.builder.setDefaultUrl(firstApiName);
                    }
                }
                firstEnvironment = false;
            }
        }
        return;
    }

    // At this stage, we have at least one top level named server. We now build the environments.
    if (!hasEndpointLevelServersWithName && !hasEndpointServersWithoutUrls) {
        let firstEnvironment = true;
        for (const [name, schema] of Object.entries(topLevelServersWithName)) {
            if (firstEnvironment) {
                if (hasWebsocketServersWithName) {
                    const baseUrl =
                        typeof schema === "string"
                            ? schema
                            : isRawMultipleBaseUrlsEnvironment(schema)
                              ? Object.values(schema.urls)[0]
                              : schema.url;
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{ [DEFAULT_URL_NAME]: baseUrl ?? "" },
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    });
                } else {
                    context.builder.addEnvironment({
                        name,
                        schema
                    });
                }
                context.builder.setDefaultEnvironment(name);
                firstEnvironment = false;
            } else {
                if (hasWebsocketServersWithName) {
                    const baseUrl =
                        typeof schema === "string"
                            ? schema
                            : isRawMultipleBaseUrlsEnvironment(schema)
                              ? Object.values(schema.urls)[0]
                              : schema.url;
                    context.builder.addEnvironment({
                        name,
                        schema: {
                            urls: {
                                ...{ [DEFAULT_URL_NAME]: baseUrl ?? "" },
                                ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                            }
                        }
                    });
                } else {
                    context.builder.addEnvironment({
                        name,
                        schema
                    });
                }
            }
        }
        if (hasWebsocketServersWithName) {
            context.builder.setDefaultUrl(DEFAULT_URL_NAME);
        }
    } else {
        if (numTopLevelServersWithName === 1) {
            const environmentName = Object.keys(topLevelServersWithName)[0] as string;
            const topLevelServerSchema = Object.values(topLevelServersWithName)[0] as
                | string
                | RawSchemas.SingleBaseUrlEnvironmentSchema
                | RawSchemas.MultipleBaseUrlsEnvironmentSchema;
            const topLevelServerUrl =
                typeof topLevelServerSchema === "string"
                    ? topLevelServerSchema
                    : isRawMultipleBaseUrlsEnvironment(topLevelServerSchema)
                      ? Object.values(topLevelServerSchema.urls)[0]
                      : topLevelServerSchema.url;
            context.builder.addEnvironment({
                name: environmentName,
                schema: {
                    urls: {
                        ...{ [DEFAULT_URL_NAME]: topLevelServerUrl ?? "" },
                        ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName),
                        ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                    }
                }
            });
            context.builder.setDefaultEnvironment(environmentName);
            context.builder.setDefaultUrl(DEFAULT_URL_NAME);
        } else {
            const apiToUrls = new Map<string, Map<string, string>>();

            for (const endpoint of context.ir.endpoints) {
                for (const server of endpoint.servers) {
                    if (server.url != null && server.name != null) {
                        if (!apiToUrls.has(server.name)) {
                            apiToUrls.set(server.name, new Map());
                        }
                        // Extract environment suffix from URL
                        const urlSuffix = server.url.match(/[-]([a-z0-9]+)\./i)?.[1]?.toLowerCase() || "production";
                        const urlMap = apiToUrls.get(server.name);
                        if (urlMap) {
                            urlMap.set(urlSuffix, server.url);
                        }
                    }
                }
            }

            if (apiToUrls.size > 0) {
                let firstEnvironment = true;

                for (const [envName, envSchema] of Object.entries(topLevelServersWithName)) {
                    const baseUrl =
                        typeof envSchema === "string"
                            ? envSchema
                            : isRawMultipleBaseUrlsEnvironment(envSchema)
                              ? Object.values(envSchema.urls)[0]
                              : envSchema.url;

                    if (!baseUrl) {
                        continue; // Skip if no base URL
                    }

                    const envSuffix = baseUrl.match(/[-]([a-z0-9]+)\./i)?.[1]?.toLowerCase() || "production";

                    const urls: Record<string, string> = {
                        [DEFAULT_URL_NAME]: baseUrl
                    };

                    for (const [apiName, apiUrlMap] of apiToUrls.entries()) {
                        const apiUrl =
                            apiUrlMap.get(envSuffix) || apiUrlMap.get("production") || apiUrlMap.values().next().value;
                        if (apiUrl) {
                            urls[apiName] = apiUrl;
                        }
                    }

                    // Include websocket servers when we have multi-API grouping
                    if (hasWebsocketServersWithName) {
                        Object.assign(urls, extractUrlsFromEnvironmentSchema(websocketServersWithName));
                    }

                    if (Object.keys(urls).length > 1) {
                        context.builder.addEnvironment({
                            name: envName,
                            schema: { urls }
                        });
                    } else {
                        context.builder.addEnvironment({
                            name: envName,
                            schema: baseUrl
                        });
                    }

                    if (firstEnvironment) {
                        context.builder.setDefaultEnvironment(envName);
                        firstEnvironment = false;
                    }
                }

                // Set default URL if we have multiple URLs
                if (apiToUrls.size > 0) {
                    context.builder.setDefaultUrl(DEFAULT_URL_NAME);
                }
            } else {
                let firstEnvironment = true;
                for (const [name, schema] of Object.entries(topLevelServersWithName)) {
                    if (hasWebsocketServersWithName || Object.keys(endpointLevelServersWithName).length > 0) {
                        const baseUrl =
                            typeof schema === "string"
                                ? schema
                                : isRawMultipleBaseUrlsEnvironment(schema)
                                  ? Object.values(schema.urls)[0]
                                  : schema.url;
                        context.builder.addEnvironment({
                            name,
                            schema: {
                                urls: {
                                    ...{ [DEFAULT_URL_NAME]: baseUrl ?? "" },
                                    ...extractUrlsFromEnvironmentSchema(endpointLevelServersWithName),
                                    ...extractUrlsFromEnvironmentSchema(websocketServersWithName)
                                }
                            }
                        });
                    } else {
                        context.builder.addEnvironment({
                            name,
                            schema
                        });
                    }
                    if (firstEnvironment) {
                        context.builder.setDefaultEnvironment(name);
                        firstEnvironment = false;
                    }
                }
            }
        }
    }
}
