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
    console.log("DEBUG parse - Processing", documents.length, "documents");
    documents.forEach((doc, i) => {
        console.log(`DEBUG parse - Document ${i}: type=${doc.type}, namespace=${doc.namespace}`);
    });
    
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
                console.log("DEBUG parse - Calling merge for OpenAPI document", documentIndex);
                console.log("DEBUG parse - Current IR servers:", ir.servers.length);
                console.log("DEBUG parse - New IR servers:", openapiIr.servers.length);
                ir = merge(ir, openapiIr);
                console.log("DEBUG parse - After merge, IR servers:", ir.servers.length);
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
    console.log("DEBUG parse - Final IR servers:", ir.servers.length);
    ir.servers.forEach((s, idx) => {
        console.log(`DEBUG parse - Final server ${idx}: name="${s.name}", url="${s.url}", description="${s.description}"`);
    });
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

function mergeServersForMultipleBaseUrls(
    servers1: any[],
    servers2: any[]
): any[] {
    console.log("\n=== DEBUG mergeServersForMultipleBaseUrls START ===");
    console.log("Processing", servers1.length, "servers from source 1");
    console.log("Processing", servers2.length, "servers from source 2");
    
    // Build a map of environment name to servers from each source
    const environmentMap = new Map<string, EnvironmentServers>();
    
    // Process servers from first source
    for (const server of servers1) {
        const envName = getEnvironmentName(server);
        if (!environmentMap.has(envName)) {
            environmentMap.set(envName, {});
        }
        environmentMap.get(envName)![0] = server;
    }
    
    // Process servers from second source
    for (const server of servers2) {
        const envName = getEnvironmentName(server);
        if (!environmentMap.has(envName)) {
            environmentMap.set(envName, {});
        }
        environmentMap.get(envName)![1] = server;
    }
    
    // Analyze if we have a Multiple Base URLs scenario
    const multipleBaseUrlEnvironments = new Map<string, Map<string, string>>();
    
    for (const [envName, servers] of environmentMap.entries()) {
        const server1 = servers[0];
        const server2 = servers[1];
        
        if (server1 && server2 && server1.url !== server2.url) {
            // Different URLs for the same environment - this is Multiple Base URLs
            const urlMap = new Map<string, string>();
            const api1Name = extractApiNameFromUrl(server1.url);
            const api2Name = extractApiNameFromUrl(server2.url);
            
            // Ensure unique API names
            if (api1Name === api2Name) {
                urlMap.set(api1Name + "1", server1.url);
                urlMap.set(api2Name + "2", server2.url);
            } else {
                urlMap.set(api1Name, server1.url);
                urlMap.set(api2Name, server2.url);
            }
            
            multipleBaseUrlEnvironments.set(envName, urlMap);
            
            console.log(`DEBUG - Environment "${envName}" has Multiple Base URLs:`);
            for (const [apiName, url] of urlMap.entries()) {
                console.log(`  ${apiName}: ${url}`);
            }
        }
    }
    
    const hasMultipleBaseUrls = multipleBaseUrlEnvironments.size > 0;
    console.log("DEBUG - Multiple Base URLs detected:", hasMultipleBaseUrls);
    
    if (!hasMultipleBaseUrls) {
        // No Multiple Base URLs scenario - return simple concatenation
        console.log("DEBUG - Using simple server concatenation");
        return [...servers1, ...servers2];
    }
    
    // Build the result with Multiple Base URLs structure
    const result: any[] = [];
    const endpointServers: any[] = [];
    
    for (const [envName, servers] of environmentMap.entries()) {
        const urlMap = multipleBaseUrlEnvironments.get(envName);
        
        if (urlMap && urlMap.size > 1) {
            // This environment has Multiple Base URLs
            const server1 = servers[0];
            const server2 = servers[1];
            const primaryServer = server1 || server2;
            
            // Create merged server with Multiple Base URLs extension
            const mergedServer: any = {
                name: envName,
                description: envName,
                url: primaryServer.url,
                audiences: primaryServer.audiences
            };
            
            // Add the Multiple Base URLs mapping as an extension
            const baseUrls: Record<string, string> = {};
            for (const [apiName, url] of urlMap.entries()) {
                baseUrls[apiName] = url;
            }
            mergedServer["x-fern-base-urls"] = baseUrls;
            
            result.push(mergedServer);
            
            // Also create endpoint servers for each URL
            for (const [apiName, url] of urlMap.entries()) {
                endpointServers.push({
                    name: `${envName}_${apiName}`,
                    description: envName,
                    url: url,
                    audiences: primaryServer.audiences,
                    baseUrlId: apiName
                });
            }
        } else {
            // Single server for this environment - add both if they exist
            if (servers[0]) result.push(servers[0]);
            if (servers[1] && (!servers[0] || servers[0].url !== servers[1].url)) {
                result.push(servers[1]);
            }
        }
    }
    
    // Store Multiple Base URLs metadata for downstream processing
    if (endpointServers.length > 0) {
        (globalThis as any).__fernEndpointServers = endpointServers;
        (globalThis as any).__fernHasMultipleBaseUrls = true;
        console.log(`DEBUG - Configured ${endpointServers.length} endpoint servers for Multiple Base URLs`);
    }
    
    console.log(`DEBUG - Final result: ${result.length} servers`);
    result.forEach((server, idx) => {
        if (server["x-fern-base-urls"]) {
            console.log(`  Server[${idx}]: ${server.name} with Multiple Base URLs:`, server["x-fern-base-urls"]);
        } else {
            console.log(`  Server[${idx}]: ${server.name} -> ${server.url}`);
        }
    });
    console.log("=== DEBUG mergeServersForMultipleBaseUrls END ===\n");
    
    return result;
}

interface EnvironmentServers {
    [sourceIndex: number]: any;
}

function getEnvironmentName(server: any): string {
    // Use description, name, or x-fern-server-name as environment identifier
    return String(
        server.description || 
        server.name || 
        server["x-fern-server-name"] || 
        "default"
    ).trim();
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
        const match = url.match(/https?:\/\/([^.\/-]+)/);
        return match && match[1] ? match[1].toLowerCase() : 'api';
    }
}

function merge(
    ir1: OpenApiIntermediateRepresentation,
    ir2: OpenApiIntermediateRepresentation
): OpenApiIntermediateRepresentation {
    console.log("\n### DEBUG merge function called ###");
    console.log("ir1.servers count:", ir1.servers.length);
    console.log("ir2.servers count:", ir2.servers.length);
    
    // Merge servers with Multiple Base URLs support
    const mergedServers = mergeServersForMultipleBaseUrls(ir1.servers, ir2.servers);
    console.log("Merged servers count:", mergedServers.length);
    
    // Merge endpoints and potentially add endpoint servers
    let mergedEndpoints = [...ir1.endpoints, ...ir2.endpoints];
    
    // Check if we stored endpoint servers (indicates Multiple Base URLs needed)
    const endpointServers = (globalThis as any).__fernEndpointServers;
    if (endpointServers && endpointServers.length > 0) {
        console.log(`DEBUG merge - Adding ${endpointServers.length} servers to ${mergedEndpoints.length} endpoints`);
        // Add servers to all endpoints to trigger Multiple Base URLs
        mergedEndpoints = mergedEndpoints.map(endpoint => ({
            ...endpoint,
            servers: endpointServers
        }));
        // Clean up global variable
        delete (globalThis as any).__fernEndpointServers;
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
