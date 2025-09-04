import { assertNever } from "@fern-api/core-utils";
import { OpenApiIntermediateRepresentation, Source as OpenApiIrSource, Schemas } from "@fern-api/openapi-ir";
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
        globalHeaders: [],
        idempotencyHeaders: [],
        groups: {}
    };
    let documentIndex = 0;
    for (const document of documents) {
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
                ir = merge(ir, openapiIr);
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

// Removed old mergeServersForMultipleBaseUrls function - using simpler approach

interface ServerInput {
    url: string;
    description: string | undefined;
    name: string | undefined;
    audiences: string[] | undefined;
    'x-fern-server-name'?: string;
}

function getEnvironmentName(server: ServerInput): string {
    // Use description, name, or x-fern-server-name as environment identifier
    const rawName = String(
        server.description || 
        server.name || 
        server["x-fern-server-name"] || 
        "default"
    ).trim();
    
    // Normalize environment names for consistent matching
    const normalized = rawName.toUpperCase();
    
    // Map common variations to standard names
    if (normalized === 'PRODUCTION' || normalized === 'PRD' || normalized === 'PROD') {
        return 'PRD';
    }
    if (normalized === 'SANDBOX' || normalized === 'SBX') {
        return 'SBX';
    }
    if (normalized === 'STAGING' || normalized === 'STG') {
        return 'STG';
    }
    if (normalized === 'PERFORMANCE' || normalized === 'PRF' || normalized === 'PERF') {
        return 'PRF';
    }
    if (normalized === 'E2E' || normalized === 'E_2_E') {
        return 'E2E';
    }
    if (normalized === 'QAL' || normalized === 'QUALITY') {
        return 'QAL';
    }
    
    return rawName;
}

function extractApiNameFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        
        // Extract the most significant part of the hostname
        // Examples:
        // fintech.api.example.com -> fintech
        // payments-service.example.com -> payments  
        // api.wallet.example.com -> wallet
        const parts = hostname.split('.');
        
        // Look for the most descriptive part (not common terms like api, www, etc)
        const commonTerms = new Set(['api', 'www', 'service', 'services', 'example', 'com', 'org', 'net', 'io']);
        
        for (const part of parts) {
            const cleanPart = part.split('-')[0]; // Handle cases like "payments-service"
            if (cleanPart && !commonTerms.has(cleanPart.toLowerCase()) && cleanPart.length > 2) {
                return cleanPart.toLowerCase();
            }
        }
        
        // Fallback: use first part of hostname
        const firstPart = parts[0]?.split('-')[0];
        return firstPart ? firstPart.toLowerCase() : 'api';
    } catch {
        // If URL parsing fails, extract from string pattern
        const match = url.match(/https?:\/\/([^./-]+)/);
        return match && match[1] ? match[1].toLowerCase() : 'api';
    }
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
    
    // We want all environments to match AND all URLs to be different
    return allMatch && allDifferent;
}

function extractApiNameFromServers(servers: ServerInput[]): string {
    if (servers.length === 0 || !servers[0]) {
        return 'api';
    }
    
    // Extract common API name from the first server's URL
    const firstUrl = servers[0].url;
    return extractApiNameFromUrl(firstUrl);
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation
): OpenApiIntermediateRepresentation {
    // Check if we have matching environments but different URLs (Multiple APIs scenario)
    const hasMultipleApis = detectMultipleBaseUrls(ir1.servers, ir2.servers);
    
    let mergedServers: any[] = [];
    let mergedEndpoints = [...ir1.endpoints, ...ir2.endpoints];
    
    if (hasMultipleApis) {
        // Group servers by environment to create MultipleBaseUrls structure
        // e.g., PRD environment contains both fintech and payments URLs
        
        // Extract API names - using OpenAPI title if available, otherwise URL pattern
        const api1Name = extractApiNameFromServers(ir1.servers);
        const api2Name = extractApiNameFromServers(ir2.servers);
        
        // Create a map of environment name to URLs
        const environmentMap = new Map<string, {[apiName: string]: any}>();
        
        // Process servers from first API
        for (const server of ir1.servers) {
            const envName = getEnvironmentName(server);
            if (!environmentMap.has(envName)) {
                environmentMap.set(envName, {});
            }
            const envUrls = environmentMap.get(envName)!;
            envUrls[api1Name] = {
                url: server.url,
                audiences: server.audiences
            };
        }
        
        // Process servers from second API
        for (const server of ir2.servers) {
            const envName = getEnvironmentName(server);
            if (!environmentMap.has(envName)) {
                environmentMap.set(envName, {});
            }
            const envUrls = environmentMap.get(envName)!;
            envUrls[api2Name] = {
                url: server.url,
                audiences: server.audiences
            };
        }
        
        // Create merged servers with MultipleBaseUrls structure
        for (const [envName, urls] of environmentMap.entries()) {
            mergedServers.push({
                name: envName,
                description: `${envName} environment`,
                urls: urls,
                // Mark this as a multiple base URLs environment
                __multipleBaseUrls: true
            });
        }
        
        // Tag endpoints with their API name for routing
        const ir1EndpointsWithApiTag = ir1.endpoints.map(endpoint => ({
            ...endpoint,
            __apiName: api1Name
        }));
        
        const ir2EndpointsWithApiTag = ir2.endpoints.map(endpoint => ({
            ...endpoint,
            __apiName: api2Name
        }));
        
        mergedEndpoints = [...ir1EndpointsWithApiTag, ...ir2EndpointsWithApiTag];
    } else {
        // Simple case: just concatenate servers
        mergedServers = [...ir1.servers, ...ir2.servers];
    }
    
    return {
        apiVersion: ir1.apiVersion ?? ir2.apiVersion,
        title: ir1.title ?? ir2.title,
        description: ir1.description ?? ir2.description,
        basePath: ir1.basePath ?? ir2.basePath,
        servers: mergedServers,
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
        endpoints: mergedEndpoints,
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
        // If both share the namespace, merge the schemas within that namespace
        if (schemas1.namespacedSchemas[namespace] != null) {
            schemas1.namespacedSchemas[namespace] = { ...schemas1.namespacedSchemas[namespace], ...namespaceSchemas };
        } else {
            // Otherwise, just add the namespace to the schemas
            schemas1.namespacedSchemas[namespace] = namespaceSchemas;
        }
    }

    return schemas1;
}
