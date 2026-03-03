import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { GeneratorContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { Directory } from "ts-morph";

interface ServicePathPart {
    safeName: string;
    unsafeName: string;
}

interface EndpointEntry {
    service: FernIr.HttpService;
    endpoint: FernIr.HttpEndpoint;
    packageId: PackageId;
    servicePath: ServicePathPart[];
}

interface ServiceGroup {
    /** The service path parts (e.g., [{safeName: "endpoints", unsafeName: "endpoints"}, {safeName: "container", unsafeName: "container"}]) */
    servicePath: ServicePathPart[];
    endpoints: Array<{
        endpoint: FernIr.HttpEndpoint;
        service: FernIr.HttpService;
    }>;
}

export declare namespace ReactQueryGenerator {
    interface Args {
        context: GeneratorContext;
        rootClientName: string;
        rootDirectory: Directory;
        relativePackagePath: string;
        intermediateRepresentation: FernIr.IntermediateRepresentation;
        packageResolver: PackageResolver;
        getAllPackageIds: () => PackageId[];
    }
}

export class ReactQueryGenerator {
    private readonly context: GeneratorContext;
    private readonly rootClientName: string;
    private readonly rootDirectory: Directory;
    private readonly relativePackagePath: string;
    private readonly intermediateRepresentation: FernIr.IntermediateRepresentation;
    private readonly packageResolver: PackageResolver;
    private readonly getAllPackageIds: () => PackageId[];

    constructor({
        context,
        rootClientName,
        rootDirectory,
        relativePackagePath,
        intermediateRepresentation,
        packageResolver,
        getAllPackageIds
    }: ReactQueryGenerator.Args) {
        this.context = context;
        this.rootClientName = rootClientName;
        this.rootDirectory = rootDirectory;
        this.relativePackagePath = relativePackagePath;
        this.intermediateRepresentation = intermediateRepresentation;
        this.packageResolver = packageResolver;
        this.getAllPackageIds = getAllPackageIds;
    }

    public generate(): { reactQueryExportPaths: string[] } | undefined {
        this.context.logger.debug("Generating React Query options...");

        const endpointEntries = this.collectEndpointEntries();
        if (endpointEntries.length === 0) {
            return undefined;
        }

        const serviceGroups = this.groupEndpointsByService(endpointEntries);
        const reactQueryDir = `${this.relativePackagePath}/react-query`;
        const exportPaths: string[] = [];

        // Build a set of service paths that also have children (for conflict detection)
        const servicePathKeys = new Set(serviceGroups.map((g) => g.servicePath.map((p) => p.unsafeName).join("/")));
        const hasChildServices = (group: ServiceGroup): boolean => {
            const key = group.servicePath.map((p) => p.unsafeName).join("/");
            for (const otherKey of servicePathKeys) {
                if (otherKey !== key && otherKey.startsWith(key + "/")) {
                    return true;
                }
            }
            // Root service with any other services counts as having children
            if (key === "" && servicePathKeys.size > 1) {
                return true;
            }
            return false;
        };

        // Generate the context file (ClientProvider + useClient hook)
        const contextFileContent = this.generateContextFile();
        this.rootDirectory.createSourceFile(`/${reactQueryDir}/context.ts`, contextFileContent, { overwrite: true });

        // Generate per-service files
        for (const group of serviceGroups) {
            const serviceFileContent = this.generateServiceFile(group);
            const serviceDirPath = this.getServiceDirPath(group.servicePath);

            // If this is the root service (empty servicePath), write to react-query/root/index.ts
            // so it doesn't collide with the react-query/index.ts barrel file.
            const isRootService = group.servicePath.length === 0;
            const fileName = isRootService ? "index.ts" : hasChildServices(group) ? "_service.ts" : "index.ts";
            const filepath = `${reactQueryDir}/${serviceDirPath}/${fileName}`;

            this.rootDirectory.createSourceFile(`/${filepath}`, serviceFileContent, { overwrite: true });
            exportPaths.push(`react-query/${serviceDirPath}`);
        }

        // Generate barrel index files at each directory level
        const barrelFiles = this.generateBarrelFiles(serviceGroups);
        for (const { path: barrelPath, content } of barrelFiles) {
            const filepath = `${reactQueryDir}/${barrelPath}`;
            this.rootDirectory.createSourceFile(`/${filepath}`, content, { overwrite: true });
        }

        // The root barrel is always included
        exportPaths.unshift("react-query");

        return { reactQueryExportPaths: exportPaths };
    }

    /**
     * Generates the React context file with ClientProvider component and useClient hook.
     * This enables React-idiomatic dependency injection — hooks resolve the client from context
     * instead of requiring it as a parameter.
     */
    private generateContextFile(): string {
        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(``);
        lines.push(`import { createContext, createElement, useContext } from "react";`);
        lines.push(`import type { ReactNode } from "react";`);
        lines.push(`import type { ${this.rootClientName} } from "../Client";`);
        lines.push(``);
        lines.push(`type ClientInstance = InstanceType<typeof ${this.rootClientName}>;`);
        lines.push(``);
        lines.push(`const ClientContext = createContext<ClientInstance | null>(null);`);
        lines.push(``);
        lines.push(`export function useClient(): ClientInstance {`);
        lines.push(`    const client = useContext(ClientContext);`);
        lines.push(`    if (client == null) {`);
        lines.push(
            `        throw new Error("useClient must be used within a <ClientProvider>. Wrap your component tree with <ClientProvider client={...}>.");`
        );
        lines.push(`    }`);
        lines.push(`    return client;`);
        lines.push(`}`);
        lines.push(``);
        lines.push(
            `export function ClientProvider({ client, children }: { client: ClientInstance; children: ReactNode }): ReactNode {`
        );
        lines.push(`    return createElement(ClientContext.Provider, { value: client }, children);`);
        lines.push(`}`);
        lines.push(``);
        return lines.join("\n");
    }

    private collectEndpointEntries(): EndpointEntry[] {
        const entries: EndpointEntry[] = [];

        for (const packageId of this.getAllPackageIds()) {
            const service = this.packageResolver.getServiceDeclaration(packageId);
            if (service == null || service.endpoints.length === 0) {
                continue;
            }

            const servicePath: ServicePathPart[] = [];
            if (!packageId.isRoot) {
                const package_ = this.packageResolver.resolvePackage(packageId);
                for (const part of package_.fernFilepath.allParts) {
                    servicePath.push({
                        safeName: part.camelCase.safeName,
                        unsafeName: part.camelCase.unsafeName
                    });
                }
            }

            for (const endpoint of service.endpoints) {
                entries.push({ service, endpoint, packageId, servicePath });
            }
        }

        return entries;
    }

    private groupEndpointsByService(entries: EndpointEntry[]): ServiceGroup[] {
        const groupMap = new Map<string, ServiceGroup>();

        for (const entry of entries) {
            const key = entry.servicePath.map((p) => p.unsafeName).join("/");
            let group = groupMap.get(key);
            if (group == null) {
                group = { servicePath: entry.servicePath, endpoints: [] };
                groupMap.set(key, group);
            }
            group.endpoints.push({ endpoint: entry.endpoint, service: entry.service });
        }

        return Array.from(groupMap.values());
    }

    private getServiceDirPath(servicePath: ServicePathPart[]): string {
        if (servicePath.length === 0) {
            return "root";
        }
        return servicePath.map((p) => p.unsafeName).join("/");
    }

    private generateServiceFile(group: ServiceGroup): string {
        const servicePath = group.servicePath;
        // Calculate relative import paths from this service file's location
        // Service file is at react-query/{serviceDirPath}/index.ts
        // Client is at src/Client.ts (same level as react-query/)
        // Context is at react-query/context.ts (one level above serviceDirPath)
        const serviceDirPath = this.getServiceDirPath(servicePath);
        const depth = serviceDirPath.split("/").length + 1; // +1 for the react-query directory itself
        const clientImportPath = "../".repeat(depth) + "Client";
        const contextImportPath = "../".repeat(serviceDirPath.split("/").length) + "context.js";

        // Pre-scan endpoints to determine which imports are needed
        let needsUseQuery = false;
        let needsUseSuspenseQuery = false;
        let needsUseMutation = false;
        let needsUseInfiniteQuery = false;
        let needsQueryClient = false;

        for (const { endpoint } of group.endpoints) {
            const isGet = endpoint.method === "GET" || endpoint.method === "HEAD";
            if (isGet) {
                needsUseQuery = true;
                needsUseSuspenseQuery = true;
                needsQueryClient = true;
                if (endpoint.pagination != null) {
                    needsUseInfiniteQuery = true;
                }
            } else {
                needsUseMutation = true;
            }
        }

        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(``);

        // Value imports (hooks + option helpers)
        const hookImports: string[] = [];
        if (needsUseInfiniteQuery) {
            hookImports.push("infiniteQueryOptions");
            hookImports.push("useInfiniteQuery");
        }
        if (needsUseMutation) {
            hookImports.push("useMutation");
        }
        if (needsUseQuery) {
            hookImports.push("queryOptions");
            hookImports.push("useQuery");
        }
        if (needsUseSuspenseQuery) {
            hookImports.push("useSuspenseQuery");
        }

        if (hookImports.length > 0) {
            lines.push(`import { ${hookImports.join(", ")} } from "@tanstack/react-query";`);
        }

        // Type imports
        const typeImports: string[] = [];
        if (needsUseInfiniteQuery) {
            typeImports.push("InfiniteData");
        }
        if (needsQueryClient) {
            typeImports.push("QueryClient");
        }
        if (needsUseQuery) {
            typeImports.push("QueryKey");
        }
        if (needsUseInfiniteQuery) {
            typeImports.push("UseInfiniteQueryOptions");
            typeImports.push("UseInfiniteQueryResult");
        }
        if (needsUseMutation) {
            typeImports.push("UseMutationOptions");
            typeImports.push("UseMutationResult");
        }
        if (needsUseQuery) {
            typeImports.push("UseQueryOptions");
            typeImports.push("UseQueryResult");
        }
        if (needsUseSuspenseQuery) {
            typeImports.push("UseSuspenseQueryOptions");
            typeImports.push("UseSuspenseQueryResult");
        }

        lines.push(`import type { ${typeImports.join(", ")} } from "@tanstack/react-query";`);
        lines.push(`import { useClient } from "${contextImportPath}";`);
        lines.push(`import type { ${this.rootClientName} } from "${clientImportPath}";`);
        lines.push(``);
        lines.push(`type ClientInstance = InstanceType<typeof ${this.rootClientName}>;`);
        lines.push(``);

        // Build the client accessor chain using unsafeName
        const clientAccess =
            servicePath.length > 0 ? `client.${servicePath.map((p) => p.unsafeName).join(".")}` : "client";
        const clientTypeAccess = `ClientInstance${servicePath.map((p) => `["${p.unsafeName}"]`).join("")}`;

        for (const { endpoint } of group.endpoints) {
            // safeName for generated identifiers (avoids reserved words like 'delete' -> 'delete_')
            // unsafeName for client method access (matches actual SDK client method names)
            const endpointSafeName = endpoint.name.camelCase.safeName;
            const endpointUnsafeName = endpoint.name.camelCase.unsafeName;
            const isGetMethod = endpoint.method === "GET" || endpoint.method === "HEAD";
            const hasPagination = endpoint.pagination != null;

            // Use safe name for function prefix (file provides service context)
            const capitalizedEndpointName = endpointSafeName.charAt(0).toUpperCase() + endpointSafeName.slice(1);
            // PascalCase prefix for hooks (useXxx) and types — React convention
            const hookPrefix = capitalizedEndpointName;
            // camelCase prefix for non-hook functions (factories, keys, invalidation) — JS convention
            const fnPrefix = endpointSafeName;

            // Use unsafeName for type extraction from client (must match actual method name)
            const endpointMethodType = `${clientTypeAccess}["${endpointUnsafeName}"]`;
            const paramsTypeName = `${hookPrefix}Params`;
            const returnTypeName = `${hookPrefix}ReturnType`;

            const hasRequestParams = endpoint.sdkRequest != null || endpoint.allPathParameters.length > 0;

            // Always define Params so we can extract requestOptions type for both queries and mutations.
            lines.push(`type ${paramsTypeName} = Parameters<${endpointMethodType}>;`);
            lines.push(`type ${returnTypeName} = ReturnType<${endpointMethodType}>;`);
            lines.push(``);

            // Query key segments include full service path for global uniqueness
            const keySegments = [
                `"${this.rootClientName}"`,
                ...servicePath.map((s) => `"${s.unsafeName}"`),
                `"${endpointUnsafeName}"`
            ];

            if (isGetMethod) {
                // Determine query parameter shape (same distinction as mutations for consistency).
                // Single-param (sdkRequest, no path params): separate request from requestOptions for clean DX
                // Multi-param (has separate positional path params): named params for each path param + request body
                // No-param: accept requestOptions explicitly
                //
                // IMPORTANT: When sdkRequest.shape.type === "wrapper", path params are inlined into the
                // request wrapper object, so the SDK method signature is (request, requestOptions?) — NOT
                // (pathParam, request, requestOptions?). These should be treated as single-param, not multi-param.
                const hasPositionalPathParams =
                    endpoint.allPathParameters.length > 0 &&
                    (endpoint.sdkRequest == null || endpoint.sdkRequest.shape.type !== "wrapper");
                const isSingleParamQuery = hasRequestParams && !hasPositionalPathParams;
                const isMultiParamQuery = hasRequestParams && hasPositionalPathParams;

                // === Query Key ===
                // Exclude requestOptions from the cache key to prevent cache pollution
                // (different timeouts/headers shouldn't create different cache entries).
                // For multi-param queries, we use named parameters (path params + request body)
                // instead of spreading the full args tuple which would include requestOptions.
                const queryKeyFnName = `${fnPrefix}QueryKey`;
                // For multi-param endpoints, compute named parameters for the query key
                const pathParamNames = endpoint.allPathParameters.map((p) => p.name.camelCase.safeName);
                const hasRequestBody = endpoint.sdkRequest != null;
                if (isSingleParamQuery) {
                    lines.push(`export function ${queryKeyFnName}(request: ${paramsTypeName}[0]): QueryKey {`);
                    lines.push(`    return [${keySegments.join(", ")}, request] as const;`);
                } else if (isMultiParamQuery) {
                    // Generate named parameters: each path param + optional request body
                    const keyParams: string[] = [];
                    const keyArgs: string[] = [];
                    pathParamNames.forEach((paramName, i) => {
                        keyParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        keyArgs.push(paramName);
                    });
                    if (hasRequestBody) {
                        const requestIdx = pathParamNames.length;
                        keyParams.push(`request: ${paramsTypeName}[${requestIdx}]`);
                        keyArgs.push("request");
                    }
                    lines.push(`export function ${queryKeyFnName}(${keyParams.join(", ")}): QueryKey {`);
                    lines.push(`    return [${keySegments.join(", ")}, ${keyArgs.join(", ")}] as const;`);
                } else {
                    lines.push(`export function ${queryKeyFnName}(): QueryKey {`);
                    lines.push(`    return [${keySegments.join(", ")}] as const;`);
                }
                lines.push(`}`);
                lines.push(``);

                // === Infinite Options + Hook (if paginated) ===
                if (hasPagination && endpoint.pagination != null) {
                    const paginationInfo = this.getPaginationInfo(endpoint.pagination);
                    const infiniteFnName = `${fnPrefix}InfiniteOptions`;
                    const infiniteReturnType = `{ queryKey: QueryKey; queryFn: (context: { pageParam: unknown }) => ${returnTypeName}; initialPageParam: unknown; getNextPageParam: (lastPage: Awaited<${returnTypeName}>, allPages: unknown, lastPageParam: unknown) => unknown }`;
                    if (isSingleParamQuery) {
                        lines.push(
                            `export function ${infiniteFnName}(client: ClientInstance, request: ${paramsTypeName}[0], requestOptions?: ${paramsTypeName}[1]): ${infiniteReturnType} {`
                        );
                    } else if (isMultiParamQuery) {
                        // Multi-param: use named parameters for the factory
                        const infFactoryParams: string[] = ["client: ClientInstance"];
                        pathParamNames.forEach((paramName, i) => {
                            infFactoryParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        });
                        if (hasRequestBody) {
                            infFactoryParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        }
                        infFactoryParams.push(
                            `requestOptions?: ${paramsTypeName}[${pathParamNames.length + (hasRequestBody ? 1 : 0)}]`
                        );
                        lines.push(
                            `export function ${infiniteFnName}(${infFactoryParams.join(", ")}): ${infiniteReturnType} {`
                        );
                    } else {
                        lines.push(
                            `export function ${infiniteFnName}(client: ClientInstance, requestOptions?: ${paramsTypeName}[0]): ${infiniteReturnType} {`
                        );
                    }
                    // Use infiniteQueryOptions() for idiomatic TanStack Query v5 pattern.
                    // We keep explicit return type annotations for isolatedDeclarations compatibility
                    // (the DataTag type from infiniteQueryOptions() contains internal symbols that can't be named).
                    // Cast needed because infiniteQueryOptions() widens queryFn to QueryFunction<...> | undefined,
                    // but we always provide queryFn so the cast is safe.
                    lines.push(`    return infiniteQueryOptions({`);
                    if (isSingleParamQuery) {
                        lines.push(`        queryKey: ${queryKeyFnName}(request),`);
                    } else if (isMultiParamQuery) {
                        // Pass named params to queryKey (excluding requestOptions)
                        const infKeyCallArgs: string[] = [...pathParamNames];
                        if (hasRequestBody) {
                            infKeyCallArgs.push("request");
                        }
                        lines.push(`        queryKey: ${queryKeyFnName}(${infKeyCallArgs.join(", ")}),`);
                    } else {
                        lines.push(`        queryKey: ${queryKeyFnName}(),`);
                    }

                    // Generate queryFn that injects pageParam into the request
                    if (paginationInfo != null && isSingleParamQuery) {
                        const { requestFieldName } = paginationInfo;
                        lines.push(`        queryFn: ({ pageParam }) => {`);
                        lines.push(
                            `            return ${clientAccess}.${endpointUnsafeName}(pageParam != null ? { ...request, ${requestFieldName}: pageParam as never } : request, requestOptions);`
                        );
                        lines.push(`        },`);
                    } else if (paginationInfo != null && isMultiParamQuery) {
                        const { requestFieldName } = paginationInfo;
                        // For multi-param endpoints with pagination, we need to modify the request object
                        // (which contains the pagination field) while passing through path params and requestOptions.
                        lines.push(`        queryFn: ({ pageParam }) => {`);
                        lines.push(
                            `            const paginatedRequest = pageParam != null ? { ...request, ${requestFieldName}: pageParam as never } : request;`
                        );
                        // Build the SDK call with named params
                        const paginatedCallArgs: string[] = [...pathParamNames, "paginatedRequest", "requestOptions"];
                        lines.push(
                            `            return ${clientAccess}.${endpointUnsafeName}(${paginatedCallArgs.join(", ")});`
                        );
                        lines.push(`        },`);
                    } else if (isSingleParamQuery) {
                        lines.push(
                            `        queryFn: () => ${clientAccess}.${endpointUnsafeName}(request, requestOptions),`
                        );
                    } else if (isMultiParamQuery) {
                        // Build the SDK call with named params
                        const infSdkCallArgs: string[] = [...pathParamNames];
                        if (hasRequestBody) {
                            infSdkCallArgs.push("request");
                        }
                        infSdkCallArgs.push("requestOptions");
                        lines.push(
                            `        queryFn: () => ${clientAccess}.${endpointUnsafeName}(${infSdkCallArgs.join(", ")}),`
                        );
                    } else {
                        lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(requestOptions),`);
                    }

                    // Generate initialPageParam and getNextPageParam based on pagination type
                    if (paginationInfo != null) {
                        lines.push(`        initialPageParam: ${paginationInfo.initialPageParam},`);
                        lines.push(`        getNextPageParam: (lastPage, _allPages, lastPageParam): unknown => {`);
                        for (const line of paginationInfo.getNextPageParamBody) {
                            lines.push(`            ${line}`);
                        }
                        lines.push(`        },`);
                    } else {
                        // Custom or unknown pagination: provide stub
                        lines.push(`        initialPageParam: undefined as unknown,`);
                        lines.push(`        getNextPageParam: (_lastPage: Awaited<${returnTypeName}>): unknown => {`);
                        lines.push(`            return undefined;`);
                        lines.push(`        },`);
                    }

                    lines.push(`    }) as unknown as ${infiniteReturnType};`);
                    lines.push(`}`);
                    lines.push(``);

                    // useInfiniteQuery hook — resolves client from React context via useClient()
                    const useInfiniteFnName = `use${hookPrefix}Infinite`;
                    const useInfiniteReturnType = `UseInfiniteQueryResult<InfiniteData<Awaited<${returnTypeName}>, unknown>, Error>`;
                    const infiniteOptionsType = `Omit<UseInfiniteQueryOptions<Awaited<${returnTypeName}>, Error, InfiniteData<Awaited<${returnTypeName}>, unknown>, QueryKey, unknown>, "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam">`;
                    if (isSingleParamQuery) {
                        lines.push(
                            `export function ${useInfiniteFnName}(request: ${paramsTypeName}[0], requestOptions?: ${paramsTypeName}[1], options?: ${infiniteOptionsType}): ${useInfiniteReturnType} {`
                        );
                        lines.push(`    const client = useClient();`);
                        lines.push(
                            `    return useInfiniteQuery({ ...${infiniteFnName}(client, request, requestOptions), ...options });`
                        );
                    } else if (isMultiParamQuery) {
                        // Multi-param infinite hooks: use named parameters for better DX
                        const infHookParams: string[] = [];
                        pathParamNames.forEach((paramName, i) => {
                            infHookParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        });
                        if (hasRequestBody) {
                            infHookParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        }
                        infHookParams.push(
                            `requestOptions?: ${paramsTypeName}[${pathParamNames.length + (hasRequestBody ? 1 : 0)}]`
                        );
                        infHookParams.push(`options?: ${infiniteOptionsType}`);
                        lines.push(
                            `export function ${useInfiniteFnName}(${infHookParams.join(", ")}): ${useInfiniteReturnType} {`
                        );
                        lines.push(`    const client = useClient();`);
                        // Reconstruct args tuple for the factory
                        const infFactoryArgs: string[] = [...pathParamNames];
                        if (hasRequestBody) {
                            infFactoryArgs.push("request");
                        }
                        infFactoryArgs.push("requestOptions");
                        lines.push(
                            `    return useInfiniteQuery({ ...${infiniteFnName}(client, ${infFactoryArgs.join(", ")}), ...options });`
                        );
                    } else {
                        lines.push(
                            `export function ${useInfiniteFnName}(requestOptions?: ${paramsTypeName}[0], options?: ${infiniteOptionsType}): ${useInfiniteReturnType} {`
                        );
                        lines.push(`    const client = useClient();`);
                        lines.push(
                            `    return useInfiniteQuery({ ...${infiniteFnName}(client, requestOptions), ...options });`
                        );
                    }
                    lines.push(`}`);
                    lines.push(``);
                }

                // === Query Options ===
                // Use queryOptions() for idiomatic TanStack Query v5 pattern.
                // We keep explicit return type annotations for isolatedDeclarations compatibility
                // (the DataTag type from queryOptions() contains internal symbols that can't be named).
                const queryFnName = `${fnPrefix}Options`;
                const queryReturnType = `{ queryKey: QueryKey; queryFn: () => ${returnTypeName} }`;
                if (isSingleParamQuery) {
                    lines.push(
                        `export function ${queryFnName}(client: ClientInstance, request: ${paramsTypeName}[0], requestOptions?: ${paramsTypeName}[1]): ${queryReturnType} {`
                    );
                    lines.push(`    return queryOptions({`);
                    lines.push(`        queryKey: ${queryKeyFnName}(request),`);
                    lines.push(
                        `        queryFn: () => ${clientAccess}.${endpointUnsafeName}(request, requestOptions),`
                    );
                } else if (isMultiParamQuery) {
                    // Multi-param: use named parameters for the factory too
                    const optFactoryParams: string[] = ["client: ClientInstance"];
                    const optFactoryCallArgs: string[] = [];
                    pathParamNames.forEach((paramName, i) => {
                        optFactoryParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        optFactoryCallArgs.push(paramName);
                    });
                    if (hasRequestBody) {
                        optFactoryParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        optFactoryCallArgs.push("request");
                    }
                    optFactoryParams.push(
                        `requestOptions?: ${paramsTypeName}[${pathParamNames.length + (hasRequestBody ? 1 : 0)}]`
                    );
                    lines.push(`export function ${queryFnName}(${optFactoryParams.join(", ")}): ${queryReturnType} {`);
                    lines.push(`    return queryOptions({`);
                    // Query key uses named args (excluding requestOptions)
                    lines.push(`        queryKey: ${queryKeyFnName}(${optFactoryCallArgs.join(", ")}),`);
                    // queryFn passes all args including requestOptions to the SDK method
                    const sdkCallArgs = [...optFactoryCallArgs, "requestOptions"];
                    lines.push(
                        `        queryFn: () => ${clientAccess}.${endpointUnsafeName}(${sdkCallArgs.join(", ")}),`
                    );
                } else {
                    lines.push(
                        `export function ${queryFnName}(client: ClientInstance, requestOptions?: ${paramsTypeName}[0]): ${queryReturnType} {`
                    );
                    lines.push(`    return queryOptions({`);
                    lines.push(`        queryKey: ${queryKeyFnName}(),`);
                    lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(requestOptions),`);
                }
                lines.push(`    }) as unknown as ${queryReturnType};`);
                lines.push(`}`);
                lines.push(``);

                // === useQuery hook === resolves client from React context via useClient()
                const useQueryFnName = `use${hookPrefix}`;
                const useQueryReturnType = `UseQueryResult<Awaited<${returnTypeName}>, Error>`;
                const queryOptionsType = `Omit<UseQueryOptions<Awaited<${returnTypeName}>, Error, Awaited<${returnTypeName}>, QueryKey>, "queryKey" | "queryFn">`;
                if (isSingleParamQuery) {
                    lines.push(
                        `export function ${useQueryFnName}(request: ${paramsTypeName}[0], requestOptions?: ${paramsTypeName}[1], options?: ${queryOptionsType}): ${useQueryReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(
                        `    return useQuery({ ...${queryFnName}(client, request, requestOptions), ...options });`
                    );
                } else if (isMultiParamQuery) {
                    // Multi-param: use named parameters for better DX
                    const hookParams: string[] = [];
                    const factoryArgs: string[] = [];
                    pathParamNames.forEach((paramName, i) => {
                        hookParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        factoryArgs.push(paramName);
                    });
                    if (hasRequestBody) {
                        hookParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        factoryArgs.push("request");
                    }
                    hookParams.push(
                        `requestOptions?: ${paramsTypeName}[${pathParamNames.length + (hasRequestBody ? 1 : 0)}]`
                    );
                    hookParams.push(`options?: ${queryOptionsType}`);
                    lines.push(`export function ${useQueryFnName}(${hookParams.join(", ")}): ${useQueryReturnType} {`);
                    lines.push(`    const client = useClient();`);
                    factoryArgs.push("requestOptions");
                    lines.push(
                        `    return useQuery({ ...${queryFnName}(client, ${factoryArgs.join(", ")}), ...options });`
                    );
                } else {
                    lines.push(
                        `export function ${useQueryFnName}(requestOptions?: ${paramsTypeName}[0], options?: ${queryOptionsType}): ${useQueryReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(`    return useQuery({ ...${queryFnName}(client, requestOptions), ...options });`);
                }
                lines.push(`}`);
                lines.push(``);

                // === useSuspenseQuery hook === resolves client from React context via useClient()
                const useSuspenseFnName = `useSuspense${hookPrefix}`;
                const useSuspenseReturnType = `UseSuspenseQueryResult<Awaited<${returnTypeName}>, Error>`;
                const suspenseOptionsType = `Omit<UseSuspenseQueryOptions<Awaited<${returnTypeName}>, Error, Awaited<${returnTypeName}>, QueryKey>, "queryKey" | "queryFn">`;
                if (isSingleParamQuery) {
                    lines.push(
                        `export function ${useSuspenseFnName}(request: ${paramsTypeName}[0], requestOptions?: ${paramsTypeName}[1], options?: ${suspenseOptionsType}): ${useSuspenseReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(
                        `    return useSuspenseQuery({ ...${queryFnName}(client, request, requestOptions), ...options });`
                    );
                } else if (isMultiParamQuery) {
                    // Multi-param: use named parameters for better DX
                    const suspHookParams: string[] = [];
                    const suspFactoryArgs: string[] = [];
                    pathParamNames.forEach((paramName, i) => {
                        suspHookParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        suspFactoryArgs.push(paramName);
                    });
                    if (hasRequestBody) {
                        suspHookParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        suspFactoryArgs.push("request");
                    }
                    suspHookParams.push(
                        `requestOptions?: ${paramsTypeName}[${pathParamNames.length + (hasRequestBody ? 1 : 0)}]`
                    );
                    suspHookParams.push(`options?: ${suspenseOptionsType}`);
                    lines.push(
                        `export function ${useSuspenseFnName}(${suspHookParams.join(", ")}): ${useSuspenseReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    suspFactoryArgs.push("requestOptions");
                    lines.push(
                        `    return useSuspenseQuery({ ...${queryFnName}(client, ${suspFactoryArgs.join(", ")}), ...options });`
                    );
                } else {
                    lines.push(
                        `export function ${useSuspenseFnName}(requestOptions?: ${paramsTypeName}[0], options?: ${suspenseOptionsType}): ${useSuspenseReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(
                        `    return useSuspenseQuery({ ...${queryFnName}(client, requestOptions), ...options });`
                    );
                }
                lines.push(`}`);
                lines.push(``);

                // === Cache invalidation helpers ===
                // Exclude requestOptions from invalidation (consistent with query key).
                const invalidateFnName = `invalidate${hookPrefix}`;
                if (isSingleParamQuery) {
                    lines.push(
                        `export function ${invalidateFnName}(queryClient: QueryClient, request: ${paramsTypeName}[0]): Promise<void> {`
                    );
                    lines.push(`    return queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}(request) });`);
                } else if (isMultiParamQuery) {
                    // Multi-param: use named parameters (consistent with query key)
                    const invParams: string[] = ["queryClient: QueryClient"];
                    const invKeyArgs: string[] = [];
                    pathParamNames.forEach((paramName, i) => {
                        invParams.push(`${paramName}: ${paramsTypeName}[${i}]`);
                        invKeyArgs.push(paramName);
                    });
                    if (hasRequestBody) {
                        invParams.push(`request: ${paramsTypeName}[${pathParamNames.length}]`);
                        invKeyArgs.push("request");
                    }
                    lines.push(`export function ${invalidateFnName}(${invParams.join(", ")}): Promise<void> {`);
                    lines.push(
                        `    return queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}(${invKeyArgs.join(", ")}) });`
                    );
                } else {
                    lines.push(`export function ${invalidateFnName}(queryClient: QueryClient): Promise<void> {`);
                    lines.push(`    return queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}() });`);
                }
                lines.push(`}`);
                lines.push(``);

                // Invalidate ALL cached entries for this endpoint (regardless of args).
                // Only generate for endpoints with params — for no-param endpoints,
                // invalidate and invalidateAll would be identical.
                if (hasRequestParams) {
                    const invalidateAllFnName = `invalidateAll${hookPrefix}`;
                    lines.push(`export function ${invalidateAllFnName}(queryClient: QueryClient): Promise<void> {`);
                    lines.push(`    return queryClient.invalidateQueries({ queryKey: [${keySegments.join(", ")}] });`);
                    lines.push(`}`);
                    lines.push(``);
                }
            } else {
                // Determine if this is a single-param or multi-param mutation.
                // Single-param (no path params, just sdkRequest): unwrap tuple so users call mutate(request) not mutate([request])
                // Multi-param (has separate positional path params): keep tuple since mutate() only accepts one argument
                // When sdkRequest.shape.type === "wrapper", path params are inlined into the request wrapper,
                // so the SDK method is (request, requestOptions?) — treat as single-param.
                const hasPositionalPathParams =
                    endpoint.allPathParameters.length > 0 &&
                    (endpoint.sdkRequest == null || endpoint.sdkRequest.shape.type !== "wrapper");
                const isSingleParamMutation = hasRequestParams && !hasPositionalPathParams;
                const isMultiParamMutation = hasRequestParams && hasPositionalPathParams;

                // For single-param mutations, extract just the first element of the Parameters tuple
                const mutationVarsType = isSingleParamMutation
                    ? `${paramsTypeName}[0]`
                    : isMultiParamMutation
                      ? paramsTypeName
                      : "void";

                // === Mutation Options ===
                // The factory's mutationFn signature must match useMutation's (variables: TVariables) => Promise<TData>
                // pattern so that the factory is safely composable with useMutation() directly.
                // For single-param and no-param mutations, accept requestOptions so SDK options
                // (timeout, abortSignal, headers) can be passed through without falling back to raw client calls.
                const mutationFnName = `${fnPrefix}MutationOptions`;
                if (isSingleParamMutation) {
                    const mutationReturnType = `{ mutationFn: (variables: ${mutationVarsType}) => ${returnTypeName} }`;
                    lines.push(
                        `export function ${mutationFnName}(client: ClientInstance, requestOptions?: ${paramsTypeName}[1]): ${mutationReturnType} {`
                    );
                    lines.push(`    return {`);
                    lines.push(
                        `        mutationFn: (variables) => ${clientAccess}.${endpointUnsafeName}(variables, requestOptions),`
                    );
                } else if (isMultiParamMutation) {
                    const mutationReturnType = `{ mutationFn: (args: ${mutationVarsType}) => ${returnTypeName} }`;
                    lines.push(`export function ${mutationFnName}(client: ClientInstance): ${mutationReturnType} {`);
                    lines.push(`    return {`);
                    lines.push(`        mutationFn: (args) => ${clientAccess}.${endpointUnsafeName}(...args),`);
                } else {
                    const mutationReturnType = `{ mutationFn: () => ${returnTypeName} }`;
                    lines.push(
                        `export function ${mutationFnName}(client: ClientInstance, requestOptions?: ${paramsTypeName}[0]): ${mutationReturnType} {`
                    );
                    lines.push(`    return {`);
                    lines.push(`        mutationFn: () => ${clientAccess}.${endpointUnsafeName}(requestOptions),`);
                }
                lines.push(`    };`);
                lines.push(`}`);
                lines.push(``);

                // === useMutation hook === resolves client from React context via useClient()
                // For single-param and no-param mutations, accept requestOptions so SDK options
                // (timeout, abortSignal, headers) can be passed through. requestOptions are bound
                // at hook creation time, which is appropriate since they're typically consistent per hook instance.
                const useMutationFnName = `use${hookPrefix}Mutation`;
                if (isSingleParamMutation) {
                    // Single-param: TVariables is the unwrapped first param type
                    // Users call mutate(request) instead of mutate([request])
                    const useMutationReturnType = `UseMutationResult<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>`;
                    const mutationOptionsType = `Omit<UseMutationOptions<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>, "mutationFn">`;
                    lines.push(
                        `export function ${useMutationFnName}(requestOptions?: ${paramsTypeName}[1], options?: ${mutationOptionsType}): ${useMutationReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(
                        `    return useMutation<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>({`
                    );
                    lines.push(
                        `        mutationFn: (variables) => ${clientAccess}.${endpointUnsafeName}(variables, requestOptions),`
                    );
                    lines.push(`        ...options,`);
                    lines.push(`    });`);
                } else if (isMultiParamMutation) {
                    // Multi-param: TVariables is the full tuple (path params + body)
                    // Users call mutate([pathParam, request]) — tuple required for multi-param
                    // requestOptions is already part of the tuple, no separate parameter needed
                    const useMutationReturnType = `UseMutationResult<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>`;
                    const mutationOptionsType = `Omit<UseMutationOptions<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>, "mutationFn">`;
                    lines.push(
                        `export function ${useMutationFnName}(options?: ${mutationOptionsType}): ${useMutationReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(
                        `    return useMutation<Awaited<${returnTypeName}>, Error, ${mutationVarsType}, unknown>({`
                    );
                    lines.push(`        mutationFn: (args) => ${clientAccess}.${endpointUnsafeName}(...args),`);
                    lines.push(`        ...options,`);
                    lines.push(`    });`);
                } else {
                    // No params: TVariables is void
                    // Accept requestOptions so SDK options can still be passed through
                    const useMutationReturnType = `UseMutationResult<Awaited<${returnTypeName}>, Error, void, unknown>`;
                    const mutationOptionsType = `Omit<UseMutationOptions<Awaited<${returnTypeName}>, Error, void, unknown>, "mutationFn">`;
                    lines.push(
                        `export function ${useMutationFnName}(requestOptions?: ${paramsTypeName}[0], options?: ${mutationOptionsType}): ${useMutationReturnType} {`
                    );
                    lines.push(`    const client = useClient();`);
                    lines.push(`    return useMutation<Awaited<${returnTypeName}>, Error, void, unknown>({`);
                    lines.push(`        mutationFn: () => ${clientAccess}.${endpointUnsafeName}(requestOptions),`);
                    lines.push(`        ...options,`);
                    lines.push(`    });`);
                }
                lines.push(`}`);
                lines.push(``);
            }
        }

        return lines.join("\n");
    }

    /**
     * Extracts pagination metadata from the IR to generate real getNextPageParam
     * and queryFn implementations for useInfiniteQuery.
     *
     * Returns null for custom or unsupported pagination types.
     */
    private getPaginationInfo(pagination: FernIr.Pagination): {
        requestFieldName: string;
        initialPageParam: string;
        getNextPageParamBody: string[];
    } | null {
        switch (pagination.type) {
            case "cursor": {
                // Cursor pagination: extract next cursor from response
                const requestFieldName =
                    pagination.page.property.type === "query"
                        ? pagination.page.property.name.name.camelCase.unsafeName
                        : pagination.page.property.name.name.camelCase.unsafeName;
                const responseAccessPath = this.buildResponsePropertyAccessPath(pagination.next);
                return {
                    requestFieldName,
                    initialPageParam: "undefined as unknown",
                    getNextPageParamBody: [
                        `const nextCursor = ${responseAccessPath};`,
                        `return nextCursor ?? undefined;`
                    ]
                };
            }
            case "offset": {
                // Offset pagination: increment offset by results length
                const requestFieldName =
                    pagination.page.property.type === "query"
                        ? pagination.page.property.name.name.camelCase.unsafeName
                        : pagination.page.property.name.name.camelCase.unsafeName;
                if (pagination.hasNextPage != null) {
                    const hasNextPageAccess = this.buildResponsePropertyAccessPath(pagination.hasNextPage);
                    return {
                        requestFieldName,
                        initialPageParam: "0",
                        getNextPageParamBody: [
                            `if (!${hasNextPageAccess}) {`,
                            `    return undefined;`,
                            `}`,
                            `const currentOffset = typeof lastPageParam === "number" ? lastPageParam : 0;`,
                            `return currentOffset + (lastPage.data?.length ?? 0);`
                        ]
                    };
                }
                // Without hasNextPage, use Page.hasNextPage() to detect end
                return {
                    requestFieldName,
                    initialPageParam: "0",
                    getNextPageParamBody: [
                        `if (!lastPage.hasNextPage()) {`,
                        `    return undefined;`,
                        `}`,
                        `const currentOffset = typeof lastPageParam === "number" ? lastPageParam : 0;`,
                        `return currentOffset + (lastPage.data?.length ?? 0);`
                    ]
                };
            }
            case "uri": {
                // URI pagination: extract next URI from response
                const responseAccessPath = this.buildResponsePropertyAccessPath(pagination.nextUri);
                return {
                    requestFieldName: "cursor",
                    initialPageParam: "undefined as unknown",
                    getNextPageParamBody: [`const nextUri = ${responseAccessPath};`, `return nextUri ?? undefined;`]
                };
            }
            case "path": {
                // Path pagination: extract next path from response
                const responseAccessPath = this.buildResponsePropertyAccessPath(pagination.nextPath);
                return {
                    requestFieldName: "cursor",
                    initialPageParam: "undefined as unknown",
                    getNextPageParamBody: [`const nextPath = ${responseAccessPath};`, `return nextPath ?? undefined;`]
                };
            }
            case "custom":
            default:
                return null;
        }
    }

    /**
     * Builds a property access expression for extracting a value from the Page response.
     * The Page object has a `.response` property containing the raw API response.
     * Uses optional chaining for safe nested access.
     */
    private buildResponsePropertyAccessPath(responseProperty: FernIr.ResponseProperty): string {
        const parts: string[] = ["lastPage.response"];
        if (responseProperty.propertyPath != null) {
            for (const pathItem of responseProperty.propertyPath) {
                parts.push(pathItem.name.camelCase.unsafeName);
            }
        }
        parts.push(responseProperty.property.name.name.camelCase.unsafeName);
        return parts.join("?.");
    }

    private generateBarrelFiles(serviceGroups: ServiceGroup[]): Array<{ path: string; content: string }> {
        const barrelFiles: Array<{ path: string; content: string }> = [];

        // Build a tree of directories to understand the barrel structure
        // Each node is a directory that may contain service files and/or subdirectories
        interface DirNode {
            children: Map<string, DirNode>;
            /** If this directory itself is a service (has index.ts with endpoints) */
            isService: boolean;
            /** The safe name for this directory (for use as JS identifier in namespace exports) */
            safeName: string;
            unsafeName: string;
        }

        const root: DirNode = { children: new Map(), isService: false, safeName: "", unsafeName: "" };

        for (const group of serviceGroups) {
            // Root-level service endpoints live under the synthetic `root/` directory.
            // Represent them in the barrel tree as a `root` child namespace.
            if (group.servicePath.length === 0) {
                let rootChild = root.children.get("root");
                if (rootChild == null) {
                    rootChild = {
                        children: new Map(),
                        isService: false,
                        safeName: "root",
                        unsafeName: "root"
                    };
                    root.children.set("root", rootChild);
                }
                rootChild.isService = true;
                continue;
            }

            let current = root;
            for (const part of group.servicePath) {
                let child = current.children.get(part.unsafeName);
                if (child == null) {
                    child = {
                        children: new Map(),
                        isService: false,
                        safeName: part.safeName,
                        unsafeName: part.unsafeName
                    };
                    current.children.set(part.unsafeName, child);
                }
                current = child;
            }
            current.isService = true;
        }

        // Generate barrel files by traversing the tree
        const generateBarrel = (node: DirNode, currentPath: string[]): void => {
            // If this node has children, generate a barrel for them
            if (node.children.size > 0) {
                const lines: string[] = [];
                lines.push(`// This file was auto-generated by Fern from our API Definition.`);
                lines.push(``);

                // Root barrel re-exports the context (ClientProvider + useClient)
                if (currentPath.length === 0) {
                    lines.push(`export { ClientProvider, useClient } from "./context.js";`);
                }

                for (const [unsafeName, child] of node.children) {
                    const exportName = child.safeName;
                    lines.push(`export * as ${exportName} from "./${unsafeName}/index.js";`);
                }

                lines.push(``);

                const barrelPath = currentPath.length === 0 ? "index.ts" : `${currentPath.join("/")}/index.ts`;

                if (node.isService && currentPath.length > 0) {
                    // This service has both its own endpoints and child sub-services.
                    // The endpoints are in _service.ts, so re-export them alongside child namespaces.
                    lines.splice(lines.length - 1, 0, `export * from "./_service.js";`);
                    barrelFiles.push({ path: barrelPath, content: lines.join("\n") });
                } else {
                    barrelFiles.push({ path: barrelPath, content: lines.join("\n") });
                }
            } else if (!node.isService && currentPath.length > 0) {
                // Intermediate directory with no children and not a service - shouldn't happen
                // but generate an empty barrel just in case
                barrelFiles.push({
                    path: `${currentPath.join("/")}/index.ts`,
                    content: `// This file was auto-generated by Fern from our API Definition.\n`
                });
            }

            // Recurse into children
            for (const [unsafeName, child] of node.children) {
                generateBarrel(child, [...currentPath, unsafeName]);
            }
        };

        generateBarrel(root, []);

        return barrelFiles;
    }
}
