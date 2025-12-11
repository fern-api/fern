import { assertNever } from "@fern-api/core-utils";
import {
    Endpoint,
    GlobalSecurity,
    OpenApiIntermediateRepresentation,
    Source as OpenApiIrSource,
    Schemas,
    Server
} from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";

import { DEFAULT_PARSE_ASYNCAPI_SETTINGS, ParseAsyncAPIOptions } from "./asyncapi/options";
import { parseAsyncAPI } from "./asyncapi/parse";
import { AsyncAPIV2 } from "./asyncapi/v2";
import { AsyncAPIV3 } from "./asyncapi/v3";
import { generateIr as generateIrFromV3 } from "./openapi/v3/generateIr";
import { getParseOptions, ParseOpenAPIOptions } from "./options";

export type Document = OpenAPIDocument | AsyncAPIDocument;

export interface OpenAPIDocument {
    type: "openapi";
    value: OpenAPIV3.Document;
    source?: OpenApiIrSource;
    namespace?: string;
    settings: ParseOpenAPIOptions;
}

export interface AsyncAPIDocument {
    type: "asyncapi";
    value: AsyncAPIV2.DocumentV2 | AsyncAPIV3.DocumentV3;
    source?: OpenApiIrSource;
    namespace?: string;
    settings: ParseOpenAPIOptions;
}

export function parse({
    context,
    documents,
    options
}: {
    context: TaskContext;
    documents: Document[];
    options?: Partial<ParseOpenAPIOptions>;
}): OpenApiIntermediateRepresentation {
    let ir: OpenApiIntermediateRepresentation = {
        apiVersion: undefined,
        title: undefined,
        description: undefined,
        basePath: undefined,
        servers: [],
        websocketServers: [],
        tags: {
            tagsById: {},
            orderedTagIds: undefined
        },
        hasEndpointsMarkedInternal: false,
        endpoints: [],
        webhooks: [],
        channels: {},
        groupedSchemas: {
            rootSchemas: {},
            namespacedSchemas: {}
        },
        variables: {},
        nonRequestReferencedSchemas: new Set(),
        securitySchemes: {},
        security: undefined,
        globalHeaders: [],
        idempotencyHeaders: [],
        groups: {}
    };
    let documentIndex = 0;
    for (const document of documents) {
        try {
            const source = document.source != null ? document.source : OpenApiIrSource.openapi({ file: "<memory>" });
            switch (document.type) {
                case "openapi": {
                    const openapiIr = generateIrFromV3({
                        taskContext: context,
                        openApi: document.value,
                        options: getParseOptions({ options: document.settings, overrides: options }),
                        source,
                        namespace: document.namespace
                    });
                    ir = merge(ir, openapiIr, getParseOptions({ options: document.settings, overrides: options }));
                    documentIndex++;
                    break;
                }
                case "asyncapi": {
                    const parsedAsyncAPI = parseAsyncAPI({
                        document: document.value,
                        taskContext: context,
                        options: getParseOptions({ options: document.settings, overrides: options }),
                        source,
                        asyncApiOptions: getParseAsyncOptions({ options: document.settings }),
                        namespace: document.namespace
                    });
                    if (parsedAsyncAPI.servers != null) {
                        ir.websocketServers = [
                            ...ir.websocketServers,
                            ...parsedAsyncAPI.servers.map((server) => ({
                                ...server,
                                audiences: undefined,
                                description: undefined
                            }))
                        ];
                    }
                    if (parsedAsyncAPI.channels != null) {
                        ir.channels = {
                            ...ir.channels,
                            ...parsedAsyncAPI.channels
                        };
                    }
                    if (parsedAsyncAPI.groupedSchemas != null) {
                        ir.groupedSchemas = mergeSchemaMaps(ir.groupedSchemas, parsedAsyncAPI.groupedSchemas);
                    }
                    if (parsedAsyncAPI.basePath != null) {
                        ir.basePath = parsedAsyncAPI.basePath;
                    }
                    documentIndex++;
                    break;
                }
                default:
                    assertNever(document);
            }
        } catch (error) {
            context.logger.debug(
                `Skipping parsing document ${document.type === "openapi" ? document.value.info?.title : document.source?.file}`
            );
            if (error instanceof Error) {
                context.logger.debug(error.message, error.stack ? "\n" + error.stack : "");
            }
        }
    }
    return ir;
}

function getParseAsyncOptions({
    options,
    overrides
}: {
    options?: ParseOpenAPIOptions;
    overrides?: Partial<ParseAsyncAPIOptions>;
}): ParseAsyncAPIOptions {
    return {
        naming: overrides?.naming ?? options?.asyncApiNaming ?? DEFAULT_PARSE_ASYNCAPI_SETTINGS.naming
    };
}

interface ServerInput {
    url: string;
    description: string | undefined;
    name: string | undefined;
    audiences: string[] | undefined;
    "x-fern-server-name"?: string;
}

interface ApiServerConfig {
    url: string;
    audiences: string[] | undefined;
}

interface SingleApiServer extends Server {
    type: "single";
}

interface GroupedMultiApiServer {
    type: "grouped";
    name: string;
    description: string;
    urls: Record<string, ApiServerConfig>;
}

type MergedServer = SingleApiServer | GroupedMultiApiServer;

interface StandardEndpoint extends Endpoint {
    type: "standard";
}

interface MultiApiEndpoint extends Endpoint {
    type: "multi-api";
    apiName: string;
}

type TypedEndpoint = StandardEndpoint | MultiApiEndpoint;

function getEnvironmentName(server: ServerInput): string {
    const rawName = String(server.description || server.name || server["x-fern-server-name"] || "default").trim();

    const normalized = rawName.toUpperCase();

    // Map common variations to standard names
    // TODO: Remove this once we have a more generic way to handle this
    if (normalized === "PRODUCTION" || normalized === "PRD" || normalized === "PROD") {
        return "PRD";
    }
    if (normalized === "SANDBOX" || normalized === "SBX") {
        return "SBX";
    }
    if (normalized === "STAGING" || normalized === "STG") {
        return "STG";
    }
    if (normalized === "PERFORMANCE" || normalized === "PRF" || normalized === "PERF") {
        return "PRF";
    }
    if (normalized === "E2E" || normalized === "E_2_E") {
        return "E2E";
    }
    if (normalized === "QAL" || normalized === "QUALITY") {
        return "QAL";
    }

    return rawName;
}

function extractApiNameFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        const parts = hostname.split(".");

        const commonTerms = new Set(["api", "www", "service", "services", "example", "com", "org", "net", "io"]);

        for (const part of parts) {
            const cleanPart = part.split("-")[0]; // Handle cases like "payments-service"
            if (cleanPart && !commonTerms.has(cleanPart.toLowerCase()) && cleanPart.length > 2) {
                return cleanPart.toLowerCase();
            }
        }

        // Fallback: use first part of hostname
        const firstPart = parts[0]?.split("-")[0];
        return firstPart ? firstPart.toLowerCase() : "api";
    } catch {
        // If URL parsing fails, extract from string pattern
        const match = url.match(/https?:\/\/([^./-]+)/);
        return match && match[1] ? match[1].toLowerCase() : "api";
    }
}

/**
 * Merges two security arrays and removes duplicates.
 * Security items are considered equal if they have the same keys and values.
 */
function mergeDistinctSecurity(
    security1: GlobalSecurity | undefined,
    security2: GlobalSecurity | undefined
): GlobalSecurity | undefined {
    const arr1 = security1 ?? [];
    const arr2 = security2 ?? [];

    if (arr1.length === 0 && arr2.length === 0) {
        return undefined;
    }

    // Use a Map with JSON stringified keys for deduplication
    const seen = new Map<string, GlobalSecurity[number]>();

    for (const item of [...arr1, ...arr2]) {
        // Sort keys for consistent comparison
        const sortedKeys = Object.keys(item).sort();
        const normalized: Record<string, string[]> = {};
        for (const key of sortedKeys) {
            normalized[key] = item[key] ?? [];
        }
        const key = JSON.stringify(normalized);
        if (!seen.has(key)) {
            seen.set(key, item);
        }
    }

    return Array.from(seen.values());
}

function detectMultipleBaseUrls(servers1: ServerInput[], servers2: ServerInput[]): boolean {
    // Check if we have the same environment names but different URLs
    if (servers1.length === 0 || servers2.length === 0) {
        return false;
    }

    if (servers1.length !== servers2.length) {
        return false;
    }

    const envMap = new Map<string, string>();
    for (const server of servers1) {
        const envName = getEnvironmentName(server);
        envMap.set(envName, server.url);
    }

    let allMatch = true;
    let allDifferent = true;

    for (const server of servers2) {
        const envName = getEnvironmentName(server);
        const existingUrl = envMap.get(envName);
        if (!existingUrl) {
            allMatch = false; // No matching environment
        } else if (existingUrl === server.url) {
            allDifferent = false; // Same URL found
        }
    }

    return allMatch && allDifferent;
}

function extractApiNameFromServers(servers: ServerInput[]): string {
    if (servers.length === 0 || !servers[0]) {
        return "api";
    }

    const firstUrl = servers[0].url;
    return extractApiNameFromUrl(firstUrl);
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation,
    options?: ParseOpenAPIOptions
): OpenApiIntermediateRepresentation {
    // Only perform multi-API environment grouping if the feature flag is enabled
    const shouldGroupEnvironments = options?.groupMultiApiEnvironments === true;

    // When flag is disabled, use the original simple merge behavior
    if (!shouldGroupEnvironments) {
        return {
            apiVersion: ir1.apiVersion ?? ir2.apiVersion,
            title: ir1.title ?? ir2.title,
            description: ir1.description ?? ir2.description,
            basePath: ir1.basePath ?? ir2.basePath,
            servers: [...ir1.servers, ...ir2.servers],
            websocketServers: [...ir1.websocketServers, ...ir2.websocketServers],
            tags: {
                tagsById: {
                    ...ir1.tags.tagsById,
                    ...ir2.tags.tagsById
                },
                orderedTagIds:
                    ir1.tags.orderedTagIds == null && ir2.tags.orderedTagIds == null
                        ? undefined
                        : [...(ir1.tags.orderedTagIds ?? []), ...(ir2.tags.orderedTagIds ?? [])]
            },
            hasEndpointsMarkedInternal: ir1.hasEndpointsMarkedInternal || ir2.hasEndpointsMarkedInternal,
            endpoints: [...ir1.endpoints, ...ir2.endpoints],
            webhooks: [...ir1.webhooks, ...ir2.webhooks],
            channels: {
                ...ir1.channels,
                ...ir2.channels
            },
            groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas),
            variables: {
                ...ir1.variables,
                ...ir2.variables
            },
            nonRequestReferencedSchemas: new Set([
                ...ir1.nonRequestReferencedSchemas,
                ...ir2.nonRequestReferencedSchemas
            ]),
            securitySchemes: {
                ...ir1.securitySchemes,
                ...ir2.securitySchemes
            },
            security: mergeDistinctSecurity(ir1.security, ir2.security),
            globalHeaders: ir1.globalHeaders != null ? [...ir1.globalHeaders, ...(ir2.globalHeaders ?? [])] : undefined,
            idempotencyHeaders:
                ir1.idempotencyHeaders != null
                    ? [...ir1.idempotencyHeaders, ...(ir2.idempotencyHeaders ?? [])]
                    : undefined,
            groups: {
                ...ir1.groups,
                ...ir2.groups
            }
        };
    }

    // Only do complex merging when flag is enabled
    const hasMultipleApis = detectMultipleBaseUrls(ir1.servers, ir2.servers);
    if (hasMultipleApis) {
        let mergedServers: MergedServer[] = [];
        let mergedEndpoints: TypedEndpoint[] = [];
        const api1Name = extractApiNameFromServers(ir1.servers);
        const api2Name = extractApiNameFromServers(ir2.servers);

        const environmentMap = new Map<string, Record<string, ApiServerConfig>>();

        // Process servers from first API
        for (const server of ir1.servers) {
            const envName = getEnvironmentName(server);
            if (!environmentMap.has(envName)) {
                environmentMap.set(envName, {});
            }
            const envUrls = environmentMap.get(envName);
            if (envUrls) {
                envUrls[api1Name] = {
                    url: server.url,
                    audiences: server.audiences
                };
            }
        }

        // Process servers from second API
        for (const server of ir2.servers) {
            const envName = getEnvironmentName(server);
            if (!environmentMap.has(envName)) {
                environmentMap.set(envName, {});
            }
            const envUrls = environmentMap.get(envName);
            if (envUrls) {
                envUrls[api2Name] = {
                    url: server.url,
                    audiences: server.audiences
                };
            }
        }

        for (const [envName, urls] of environmentMap.entries()) {
            const groupedServer: GroupedMultiApiServer = {
                type: "grouped",
                name: envName,
                description: `${envName} environment`,
                urls: urls
            };
            mergedServers.push(groupedServer);
        }

        // Tag endpoints with their API name for routing
        const ir1EndpointsWithApiTag: MultiApiEndpoint[] = ir1.endpoints.map((endpoint) => ({
            ...endpoint,
            type: "multi-api" as const,
            apiName: api1Name,
            servers: [{ name: api1Name, url: undefined, audiences: undefined }]
        }));

        const ir2EndpointsWithApiTag: MultiApiEndpoint[] = ir2.endpoints.map((endpoint) => ({
            ...endpoint,
            type: "multi-api" as const,
            apiName: api2Name,
            servers: [{ name: api2Name, url: undefined, audiences: undefined }]
        }));

        mergedEndpoints = [...ir1EndpointsWithApiTag, ...ir2EndpointsWithApiTag];

        // Return with grouped servers and endpoints
        return {
            apiVersion: ir1.apiVersion ?? ir2.apiVersion,
            title: ir1.title ?? ir2.title,
            description: ir1.description ?? ir2.description,
            basePath: ir1.basePath ?? ir2.basePath,
            servers: mergedServers.map((s) => {
                if (s.type === "single") {
                    return s;
                } else {
                    // Preserve grouped server structure for buildEnvironments.ts
                    // Cast to any then to Server to preserve all properties
                    // biome-ignore lint/suspicious/noExplicitAny: Required to preserve grouped server metadata through type system
                    return s as any as Server;
                }
            }),
            websocketServers: [...ir1.websocketServers, ...ir2.websocketServers],
            tags: {
                tagsById: {
                    ...ir1.tags.tagsById,
                    ...ir2.tags.tagsById
                },
                orderedTagIds:
                    ir1.tags.orderedTagIds == null && ir2.tags.orderedTagIds == null
                        ? undefined
                        : [...(ir1.tags.orderedTagIds ?? []), ...(ir2.tags.orderedTagIds ?? [])]
            },
            hasEndpointsMarkedInternal: ir1.hasEndpointsMarkedInternal || ir2.hasEndpointsMarkedInternal,
            endpoints: mergedEndpoints.map((e) => {
                if (e.type === "multi-api") {
                    const { type, apiName, servers, ...endpoint } = e;
                    return { ...endpoint, __apiName: apiName, servers } as unknown as Endpoint;
                }
                const { type, ...endpoint } = e;
                return endpoint;
            }),
            webhooks: [...ir1.webhooks, ...ir2.webhooks],
            channels: {
                ...ir1.channels,
                ...ir2.channels
            },
            groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas),
            variables: {
                ...ir1.variables,
                ...ir2.variables
            },
            nonRequestReferencedSchemas: new Set([
                ...ir1.nonRequestReferencedSchemas,
                ...ir2.nonRequestReferencedSchemas
            ]),
            securitySchemes: {
                ...ir1.securitySchemes,
                ...ir2.securitySchemes
            },
            security: mergeDistinctSecurity(ir1.security, ir2.security),
            globalHeaders: ir1.globalHeaders != null ? [...ir1.globalHeaders, ...(ir2.globalHeaders ?? [])] : undefined,
            idempotencyHeaders:
                ir1.idempotencyHeaders != null
                    ? [...ir1.idempotencyHeaders, ...(ir2.idempotencyHeaders ?? [])]
                    : undefined,
            groups: {
                ...ir1.groups,
                ...ir2.groups
            }
        };
    }

    // When not grouping, just concatenate without modification
    return {
        apiVersion: ir1.apiVersion ?? ir2.apiVersion,
        title: ir1.title ?? ir2.title,
        description: ir1.description ?? ir2.description,
        basePath: ir1.basePath ?? ir2.basePath,
        servers: [...ir1.servers, ...ir2.servers],
        websocketServers: [...ir1.websocketServers, ...ir2.websocketServers],
        tags: {
            tagsById: {
                ...ir1.tags.tagsById,
                ...ir2.tags.tagsById
            },
            orderedTagIds:
                ir1.tags.orderedTagIds == null && ir2.tags.orderedTagIds == null
                    ? undefined
                    : [...(ir1.tags.orderedTagIds ?? []), ...(ir2.tags.orderedTagIds ?? [])]
        },
        hasEndpointsMarkedInternal: ir1.hasEndpointsMarkedInternal || ir2.hasEndpointsMarkedInternal,
        endpoints: [...ir1.endpoints, ...ir2.endpoints],
        webhooks: [...ir1.webhooks, ...ir2.webhooks],
        channels: {
            ...ir1.channels,
            ...ir2.channels
        },
        groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas),
        variables: {
            ...ir1.variables,
            ...ir2.variables
        },
        nonRequestReferencedSchemas: new Set([...ir1.nonRequestReferencedSchemas, ...ir2.nonRequestReferencedSchemas]),
        securitySchemes: {
            ...ir1.securitySchemes,
            ...ir2.securitySchemes
        },
        security: mergeDistinctSecurity(ir1.security, ir2.security),
        globalHeaders: ir1.globalHeaders != null ? [...ir1.globalHeaders, ...(ir2.globalHeaders ?? [])] : undefined,
        idempotencyHeaders:
            ir1.idempotencyHeaders != null ? [...ir1.idempotencyHeaders, ...(ir2.idempotencyHeaders ?? [])] : undefined,
        groups: {
            ...ir1.groups,
            ...ir2.groups
        }
    };
}

function mergeSchemaMaps(schemas1: Schemas, schemas2: Schemas): Schemas {
    schemas1.rootSchemas = { ...schemas1.rootSchemas, ...schemas2.rootSchemas };

    for (const [namespace, namespaceSchemas] of Object.entries(schemas2.namespacedSchemas)) {
        if (schemas1.namespacedSchemas[namespace] != null) {
            schemas1.namespacedSchemas[namespace] = { ...schemas1.namespacedSchemas[namespace], ...namespaceSchemas };
        } else {
            schemas1.namespacedSchemas[namespace] = namespaceSchemas;
        }
    }

    return schemas1;
}
