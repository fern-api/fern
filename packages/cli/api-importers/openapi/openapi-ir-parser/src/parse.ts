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

import { DEFAULT_PARSE_ASYNCAPI_SETTINGS, ParseAsyncAPIOptions } from "./asyncapi/options.js";
import { parseAsyncAPI } from "./asyncapi/parse.js";
import { AsyncAPIV2 } from "./asyncapi/v2/index.js";
import { AsyncAPIV3 } from "./asyncapi/v3/index.js";
import { generateIr as generateIrFromV3 } from "./openapi/v3/generateIr.js";
import { getParseOptions, ParseOpenAPIOptions } from "./options.js";
import { createSchemaCollisionTracker } from "./utils/schemaCollision.js";

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
        specVersion: undefined,
        title: undefined,
        description: undefined,
        basePath: undefined,
        basePathParameters: undefined,
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
        globalParameters: undefined,
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
                    ir = merge(
                        ir,
                        openapiIr,
                        getParseOptions({ options: document.settings, overrides: options }),
                        context
                    );
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
                                description: undefined,
                                defaultUrl: undefined,
                                urlTemplate: undefined,
                                variables: undefined
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
                        ir.groupedSchemas = mergeSchemaMaps(ir.groupedSchemas, parsedAsyncAPI.groupedSchemas, options);
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
            context.logger.error(
                `Failed to parse ${document.type} document ${document.type === "openapi" ? document.value.info?.title : document.source?.file}`
            );
            if (error instanceof Error) {
                context.logger.error(error.message, error.stack ? "\n" + error.stack : "");
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

interface ServerVariableConfig {
    id: string;
    default?: string;
    values?: string[];
}

interface ApiServerConfig {
    url: string;
    audiences: string[] | undefined;
    defaultUrl?: string;
    urlTemplate?: string;
    variables?: ServerVariableConfig[];
}

/**
 * A single server from an OpenAPI spec (fresh from parsing).
 */
interface SingleServerInput {
    type?: "single";
    url: string;
    description: string | undefined;
    name: string | undefined;
    audiences: string[] | undefined;
    "x-fern-server-name"?: string;
    defaultUrl?: string;
    urlTemplate?: string;
    variables?: ServerVariableConfig[];
}

/**
 * A grouped server containing multiple API URLs (result of merging multiple specs).
 */
interface GroupedServerInput {
    type: "grouped";
    name: string;
    description: string;
    urls: Record<string, ApiServerConfig>;
}

/**
 * Discriminated union of server types that can appear in the IR during merging.
 */
type AnyServerInput = SingleServerInput | GroupedServerInput;

interface StandardEndpoint extends Endpoint {
    type: "standard";
}

interface MultiApiEndpoint extends Endpoint {
    type: "multi-api";
    apiName: string;
}

type TypedEndpoint = StandardEndpoint | MultiApiEndpoint;

function getRawEnvironmentName(server: SingleServerInput): string {
    return String(server.description || server.name || server["x-fern-server-name"] || "default").trim();
}

function getEnvironmentName(server: SingleServerInput): string {
    return normalizeEnvironmentName(getRawEnvironmentName(server));
}

function normalizeEnvironmentName(rawName: string): string {
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
            // Try the prefix before hyphen (e.g., "payments" from "payments-service")
            const prefix = part.split("-")[0];
            // Use prefix if it's meaningful, otherwise use the full part
            const cleanPart = prefix && prefix.length > 2 ? prefix : part;
            if (cleanPart && !commonTerms.has(cleanPart.toLowerCase()) && cleanPart.length > 2) {
                return cleanPart.toLowerCase();
            }
        }

        // Fallback: use first part of hostname (full, not split)
        const firstPart = parts[0];
        return firstPart && firstPart.length > 0 ? firstPart.toLowerCase() : "api";
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
function mergeOptionalArrays<T>(a: T[] | undefined, b: T[] | undefined): T[] | undefined {
    if (a == null && b == null) {
        return undefined;
    }
    return [...(a ?? []), ...(b ?? [])];
}

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

function detectMultipleBaseUrls(servers1: AnyServerInput[], servers2: AnyServerInput[]): boolean {
    // If servers1 already contains grouped servers, we should continue grouping
    if (hasGroupedServers(servers1)) {
        return true;
    }

    // Check if we have the same environment names but different URLs
    if (servers1.length === 0 || servers2.length === 0) {
        return false;
    }

    if (servers1.length !== servers2.length) {
        return false;
    }

    const envMap = new Map<string, string>();
    for (const server of servers1) {
        if (server.type === "grouped") {
            continue; // Already handled above
        }
        const envName = getEnvironmentName(server);
        envMap.set(envName, server.url);
    }

    let allMatch = true;
    let allDifferent = true;

    for (const server of servers2) {
        if (server.type === "grouped") {
            continue;
        }
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

/**
 * Removes duplicate single servers that share the same environment name and URL.
 * Without deduplication, merging many specs with identical servers accumulates
 * duplicates, which prevents detectMultipleBaseUrls from matching server lists
 * on subsequent merges.
 */
function dedupeServers(servers: AnyServerInput[]): AnyServerInput[] {
    const seen = new Set<string>();
    return servers.filter((server) => {
        if (server.type === "grouped") {
            return true;
        }
        const key = `${getEnvironmentName(server)}\u0000${server.url}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function getPreferredUrlForNameExtraction(server: SingleServerInput): string {
    return server.defaultUrl ?? server.url;
}

function extractApiNameFromServers(servers: AnyServerInput[]): string {
    if (servers.length === 0 || !servers[0]) {
        return "api";
    }

    const firstServer = servers[0];
    if (firstServer.type === "grouped") {
        // For grouped servers, use the first URL's name
        const firstUrlName = Object.keys(firstServer.urls)[0];
        return firstUrlName ?? "api";
    }

    return extractApiNameFromUrl(getPreferredUrlForNameExtraction(firstServer));
}

function hasGroupedServers(servers: AnyServerInput[]): boolean {
    return servers.some((server) => server.type === "grouped");
}

function mergeBasePath(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation,
    options: ParseOpenAPIOptions | undefined,
    context: TaskContext
): Pick<OpenApiIntermediateRepresentation, "basePath" | "basePathParameters"> {
    if (
        options?.respectPerSpecBasePath === true &&
        ir1.basePath != null &&
        ir2.basePath != null &&
        ir1.basePath !== ir2.basePath
    ) {
        context.failWithoutThrowing(
            `Conflicting parameterized x-fern-base-path values: '${ir1.basePath}' and '${ir2.basePath}'.`
        );
    }

    return {
        basePath: ir1.basePath ?? ir2.basePath,
        basePathParameters: ir1.basePathParameters ?? ir2.basePathParameters
    };
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation,
    options: ParseOpenAPIOptions | undefined,
    context: TaskContext
): OpenApiIntermediateRepresentation {
    const mergedBasePath = mergeBasePath(ir1, ir2, options, context);

    // Only perform multi-API environment grouping if the feature flag is enabled
    const shouldGroupEnvironments = options?.groupMultiApiEnvironments === true;

    // When flag is disabled, use the original simple merge behavior
    if (!shouldGroupEnvironments) {
        return {
            apiVersion: ir1.apiVersion ?? ir2.apiVersion,
            specVersion: ir1.specVersion ?? ir2.specVersion,
            title: ir1.title ?? ir2.title,
            description: ir1.description ?? ir2.description,
            basePath: mergedBasePath.basePath,
            basePathParameters: mergedBasePath.basePathParameters,
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
            groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas, options),
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
            globalParameters: mergeOptionalArrays(ir1.globalParameters, ir2.globalParameters),
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
        const mergedServers: GroupedServerInput[] = [];
        let mergedEndpoints: TypedEndpoint[] = [];
        const api2Name = extractApiNameFromServers(ir2.servers);

        const environmentMap = new Map<string, Record<string, ApiServerConfig>>();
        // Preserve the first user-facing name seen for each normalized environment
        // (e.g. keep "Production" instead of the normalized "PRD" matching key)
        const environmentDisplayNames = new Map<string, string>();

        // Process servers from first API - handle already-grouped servers from previous merges
        // The API name must be constant across all of the first API's servers (each server is
        // the same API in a different environment), so derive it once from the first server.
        const api1Name = extractApiNameFromServers(ir1.servers);
        for (const server of ir1.servers as AnyServerInput[]) {
            if (server.type === "grouped") {
                // Preserve existing grouped URLs from previous merges
                const rawEnvName = server.name ?? "default";
                const envName = normalizeEnvironmentName(rawEnvName);
                if (!environmentDisplayNames.has(envName)) {
                    environmentDisplayNames.set(envName, rawEnvName);
                }
                if (!environmentMap.has(envName)) {
                    environmentMap.set(envName, {});
                }
                const envUrls = environmentMap.get(envName);
                if (envUrls) {
                    // Copy all existing URLs from the grouped server
                    for (const [urlName, urlConfig] of Object.entries(server.urls)) {
                        envUrls[urlName] = urlConfig;
                    }
                }
            } else {
                // Handle single server (first merge case)
                const envName = getEnvironmentName(server);
                if (!environmentDisplayNames.has(envName)) {
                    environmentDisplayNames.set(envName, getRawEnvironmentName(server));
                }
                if (!environmentMap.has(envName)) {
                    environmentMap.set(envName, {});
                }
                const envUrls = environmentMap.get(envName);
                if (envUrls) {
                    envUrls[api1Name] = {
                        url: server.url,
                        audiences: server.audiences,
                        defaultUrl: server.defaultUrl,
                        urlTemplate: server.urlTemplate,
                        variables: server.variables
                    };
                }
            }
        }

        // Process servers from second API (always single servers from fresh IR)
        for (const server of ir2.servers) {
            const envName = getEnvironmentName(server);
            if (!environmentDisplayNames.has(envName)) {
                environmentDisplayNames.set(envName, getRawEnvironmentName(server));
            }
            if (!environmentMap.has(envName)) {
                environmentMap.set(envName, {});
            }
            const envUrls = environmentMap.get(envName);
            if (envUrls) {
                envUrls[api2Name] = {
                    url: server.url,
                    audiences: server.audiences,
                    defaultUrl: server.defaultUrl,
                    urlTemplate: server.urlTemplate,
                    variables: server.variables
                };
            }
        }

        for (const [envName, urls] of environmentMap.entries()) {
            const displayName = environmentDisplayNames.get(envName) ?? envName;
            const groupedServer: GroupedServerInput = {
                type: "grouped",
                name: displayName,
                description: `${displayName} environment`,
                urls: urls
            };
            mergedServers.push(groupedServer);
        }

        // Tag endpoints with their API name for routing
        // Preserve existing tags from ir1 endpoints (from previous merges)
        const ir1EndpointsWithApiTag: TypedEndpoint[] = ir1.endpoints.map((endpoint) => {
            // Check if endpoint already has an API name from previous merge
            const existingApiName = (endpoint as unknown as { __apiName?: string }).__apiName;
            if (existingApiName) {
                return {
                    ...endpoint,
                    type: "multi-api" as const,
                    apiName: existingApiName,
                    servers: [{ name: existingApiName, url: undefined, audiences: undefined }]
                };
            }
            // First merge - derive API name from the first server
            return {
                ...endpoint,
                type: "multi-api" as const,
                apiName: api1Name,
                servers: [{ name: api1Name, url: undefined, audiences: undefined }]
            };
        });

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
            specVersion: ir1.specVersion ?? ir2.specVersion,
            title: ir1.title ?? ir2.title,
            description: ir1.description ?? ir2.description,
            basePath: mergedBasePath.basePath,
            basePathParameters: mergedBasePath.basePathParameters,
            // Cast grouped servers to Server[] - buildEnvironments.ts handles the grouped structure
            // biome-ignore lint/suspicious/noExplicitAny: Required to preserve grouped server metadata through type system
            servers: mergedServers as any as Server[],
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
            groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas, options),
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
            globalParameters: mergeOptionalArrays(ir1.globalParameters, ir2.globalParameters),
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

    // When not grouping, concatenate while deduplicating identical servers so
    // that repeated servers across specs don't block grouping on later merges
    return {
        apiVersion: ir1.apiVersion ?? ir2.apiVersion,
        specVersion: ir1.specVersion ?? ir2.specVersion,
        title: ir1.title ?? ir2.title,
        description: ir1.description ?? ir2.description,
        basePath: mergedBasePath.basePath,
        basePathParameters: mergedBasePath.basePathParameters,
        servers: dedupeServers([...ir1.servers, ...ir2.servers] as AnyServerInput[]) as Server[],
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
        groupedSchemas: mergeSchemaMaps(ir1.groupedSchemas, ir2.groupedSchemas, options),
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
        globalParameters: mergeOptionalArrays(ir1.globalParameters, ir2.globalParameters),
        idempotencyHeaders:
            ir1.idempotencyHeaders != null ? [...ir1.idempotencyHeaders, ...(ir2.idempotencyHeaders ?? [])] : undefined,
        groups: {
            ...ir1.groups,
            ...ir2.groups
        }
    };
}

function mergeSchemaMaps(schemas1: Schemas, schemas2: Schemas, options?: Partial<ParseOpenAPIOptions>): Schemas {
    const collisionTracker = createSchemaCollisionTracker();
    const shouldWarn = options?.resolveSchemaCollisions ?? false;

    // Merge root schemas with collision detection
    const mergedRootSchemas = { ...schemas1.rootSchemas };
    for (const [key, schema] of Object.entries(schemas2.rootSchemas)) {
        const uniqueKey = collisionTracker.getUniqueSchemaId(key, undefined, shouldWarn);
        mergedRootSchemas[uniqueKey] = schema;
    }
    schemas1.rootSchemas = mergedRootSchemas;

    // Merge namespaced schemas with collision detection
    for (const [namespace, namespaceSchemas] of Object.entries(schemas2.namespacedSchemas)) {
        if (schemas1.namespacedSchemas[namespace] != null) {
            const existingSchemas = schemas1.namespacedSchemas[namespace];
            for (const [key, schema] of Object.entries(namespaceSchemas)) {
                const uniqueKey = collisionTracker.getUniqueSchemaId(key, undefined, shouldWarn);
                existingSchemas[uniqueKey] = schema;
            }
        } else {
            schemas1.namespacedSchemas[namespace] = namespaceSchemas;
        }
    }

    return schemas1;
}
