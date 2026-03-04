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
        inlinePathParameters: boolean;
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
    private readonly inlinePathParameters: boolean;

    constructor({
        context,
        rootClientName,
        rootDirectory,
        relativePackagePath,
        intermediateRepresentation,
        packageResolver,
        getAllPackageIds,
        inlinePathParameters
    }: ReactQueryGenerator.Args) {
        this.context = context;
        this.rootClientName = rootClientName;
        this.rootDirectory = rootDirectory;
        this.relativePackagePath = relativePackagePath;
        this.intermediateRepresentation = intermediateRepresentation;
        this.packageResolver = packageResolver;
        this.getAllPackageIds = getAllPackageIds;
        this.inlinePathParameters = inlinePathParameters;
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

        // Generate unit test files for the React Query layer
        const testFiles = this.generateTestFiles(serviceGroups);
        for (const { path: testPath, content: testContent } of testFiles) {
            this.rootDirectory.createSourceFile(`/${testPath}`, testContent, { overwrite: true });
        }

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
                // IMPORTANT: Path params are only inlined into the request wrapper when ALL of:
                // 1. inlinePathParameters config is enabled
                // 2. sdkRequest.shape.type === "wrapper"
                // 3. The wrapper actually includes path params (onlyPathParameters or includePathParameters)
                // This matches the logic in RequestWrapperContextImpl.shouldInlinePathParameters.
                const pathParamsAreInlined =
                    this.inlinePathParameters &&
                    endpoint.sdkRequest?.shape.type === "wrapper" &&
                    (endpoint.sdkRequest.shape.onlyPathParameters || endpoint.sdkRequest.shape.includePathParameters);
                const hasPositionalPathParams = endpoint.allPathParameters.length > 0 && !pathParamsAreInlined;
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
                // Path params are only inlined when all conditions are met (see query section for details).
                const pathParamsAreInlined =
                    this.inlinePathParameters &&
                    endpoint.sdkRequest?.shape.type === "wrapper" &&
                    (endpoint.sdkRequest.shape.onlyPathParameters || endpoint.sdkRequest.shape.includePathParameters);
                const hasPositionalPathParams = endpoint.allPathParameters.length > 0 && !pathParamsAreInlined;
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

    /**
     * Generates unit test files for the React Query layer.
     * Tests are generated from the same endpoint metadata used to generate the React Query code,
     * so they naturally stay in sync with the generated API surface.
     */
    private generateTestFiles(serviceGroups: ServiceGroup[]): Array<{ path: string; content: string }> {
        const testFiles: Array<{ path: string; content: string }> = [];

        // Classify endpoints into categories for targeted test generation
        interface ClassifiedEndpoint {
            endpointSafeName: string;
            endpointUnsafeName: string;
            servicePath: ServicePathPart[];
            serviceDirPath: string;
            importPath: string;
            keySegments: string[];
            paramType: "no-param" | "single-param" | "multi-param";
            pathParamNames: string[];
            hasRequestBody: boolean;
            hasPagination: boolean;
            paginationType: string | null;
        }

        const queryEndpoints: ClassifiedEndpoint[] = [];
        const mutationEndpoints: ClassifiedEndpoint[] = [];

        for (const group of serviceGroups) {
            const serviceDirPath = this.getServiceDirPath(group.servicePath);
            // Import path from tests/unit/react-query/*.test.ts to src/react-query/{serviceDirPath}/index.js
            const importPath = `../../../${this.relativePackagePath}/react-query/${serviceDirPath}/index.js`;

            for (const { endpoint } of group.endpoints) {
                const endpointSafeName = endpoint.name.camelCase.safeName;
                const endpointUnsafeName = endpoint.name.camelCase.unsafeName;
                const isGetMethod = endpoint.method === "GET" || endpoint.method === "HEAD";
                const hasRequestParams = endpoint.sdkRequest != null || endpoint.allPathParameters.length > 0;
                const pathParamsAreInlined =
                    this.inlinePathParameters &&
                    endpoint.sdkRequest?.shape.type === "wrapper" &&
                    (endpoint.sdkRequest.shape.onlyPathParameters || endpoint.sdkRequest.shape.includePathParameters);
                const hasPositionalPathParams = endpoint.allPathParameters.length > 0 && !pathParamsAreInlined;
                const pathParamNames = endpoint.allPathParameters.map((p) => p.name.camelCase.safeName);
                const hasRequestBody = endpoint.sdkRequest != null;

                let paramType: "no-param" | "single-param" | "multi-param";
                if (!hasRequestParams) {
                    paramType = "no-param";
                } else if (hasPositionalPathParams) {
                    paramType = "multi-param";
                } else {
                    paramType = "single-param";
                }

                const keySegments = [
                    this.rootClientName,
                    ...group.servicePath.map((s) => s.unsafeName),
                    endpointUnsafeName
                ];

                const classified: ClassifiedEndpoint = {
                    endpointSafeName,
                    endpointUnsafeName,
                    servicePath: group.servicePath,
                    serviceDirPath,
                    importPath,
                    keySegments,
                    paramType,
                    pathParamNames,
                    hasRequestBody,
                    hasPagination: endpoint.pagination != null,
                    paginationType: endpoint.pagination?.type ?? null
                };

                if (isGetMethod) {
                    queryEndpoints.push(classified);
                } else {
                    mutationEndpoints.push(classified);
                }
            }
        }

        // Generate query-keys.test.ts
        testFiles.push({
            path: "tests/unit/react-query/query-keys.test.ts",
            content: this.generateQueryKeysTestFile(queryEndpoints)
        });

        // Generate options-factories.test.ts
        testFiles.push({
            path: "tests/unit/react-query/options-factories.test.ts",
            content: this.generateOptionsFactoriesTestFile(queryEndpoints, mutationEndpoints)
        });

        // Generate hooks.test.ts
        testFiles.push({
            path: "tests/unit/react-query/hooks.test.ts",
            content: this.generateHooksTestFile(queryEndpoints, mutationEndpoints, serviceGroups)
        });

        // Generate context.test.ts
        testFiles.push({
            path: "tests/unit/react-query/context.test.ts",
            content: this.generateContextTestFile()
        });

        // Generate invalidation.test.ts
        testFiles.push({
            path: "tests/unit/react-query/invalidation.test.ts",
            content: this.generateInvalidationTestFile(queryEndpoints)
        });

        return testFiles;
    }

    /**
     * Generates a test file for query key functions.
     * Tests key structure, uniqueness, and requestOptions exclusion.
     */
    private generateQueryKeysTestFile(queryEndpoints: Array<{
        endpointSafeName: string;
        endpointUnsafeName: string;
        servicePath: ServicePathPart[];
        importPath: string;
        keySegments: string[];
        paramType: "no-param" | "single-param" | "multi-param";
        pathParamNames: string[];
        hasRequestBody: boolean;
        hasPagination: boolean;
    }>): string {
        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(`import { describe, expect, it } from "vitest";`);
        lines.push(``);

        // Group imports by importPath
        const importsByPath = new Map<string, string[]>();
        for (const ep of queryEndpoints) {
            const fnName = `${ep.endpointSafeName}QueryKey`;
            let imports = importsByPath.get(ep.importPath);
            if (imports == null) {
                imports = [];
                importsByPath.set(ep.importPath, imports);
            }
            imports.push(fnName);
        }
        for (const [importPath, imports] of importsByPath) {
            lines.push(`import { ${imports.join(", ")} } from "${importPath}";`);
        }
        lines.push(``);

        // Pick representative endpoints for each category
        const noParamEp = queryEndpoints.find((e) => e.paramType === "no-param");
        const singleParamEp = queryEndpoints.find((e) => e.paramType === "single-param" && !e.hasPagination);
        const multiParamEp = queryEndpoints.find((e) => e.paramType === "multi-param");
        const paginationEp = queryEndpoints.find((e) => e.hasPagination);

        lines.push(`describe("Query Key Functions", () => {`);

        if (noParamEp != null) {
            const fnName = `${noParamEp.endpointSafeName}QueryKey`;
            const expectedKey = JSON.stringify(noParamEp.keySegments);
            lines.push(`    describe("no-param queries", () => {`);
            lines.push(`        it("should return a key with service path segments only", () => {`);
            lines.push(`            const key = ${fnName}();`);
            lines.push(`            expect(key).toEqual(${expectedKey});`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should return a readonly tuple", () => {`);
            lines.push(`            const key = ${fnName}();`);
            lines.push(`            expect(Array.isArray(key)).toBe(true);`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should return the same key on repeated calls (stable)", () => {`);
            lines.push(`            const key1 = ${fnName}();`);
            lines.push(`            const key2 = ${fnName}();`);
            lines.push(`            expect(key1).toEqual(key2);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (singleParamEp != null) {
            const fnName = `${singleParamEp.endpointSafeName}QueryKey`;
            const expectedKeyPrefix = JSON.stringify(singleParamEp.keySegments);
            lines.push(`    describe("single-param queries", () => {`);
            lines.push(`        it("should include the request parameter in the key", () => {`);
            lines.push(`            const request = { test: "value" };`);
            lines.push(`            const key = ${fnName}(request as any);`);
            lines.push(`            expect(key).toEqual([...${expectedKeyPrefix}, request]);`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should produce different keys for different request params", () => {`);
            lines.push(`            const key1 = ${fnName}({ a: 1 } as any);`);
            lines.push(`            const key2 = ${fnName}({ a: 2 } as any);`);
            lines.push(`            expect(key1).not.toEqual(key2);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (multiParamEp != null) {
            const fnName = `${multiParamEp.endpointSafeName}QueryKey`;
            const expectedKeyPrefix = JSON.stringify(multiParamEp.keySegments);
            lines.push(`    describe("multi-param queries", () => {`);
            lines.push(`        it("should include path param and request in the key", () => {`);
            // Build call args: path params + optional request body
            const callArgs: string[] = multiParamEp.pathParamNames.map(() => `"test-path"`);
            if (multiParamEp.hasRequestBody) {
                callArgs.push(`{ test: "value" } as any`);
            }
            lines.push(`            const key = ${fnName}(${callArgs.join(", ")});`);
            const expectedArgs: string[] = multiParamEp.pathParamNames.map(() => `"test-path"`);
            if (multiParamEp.hasRequestBody) {
                expectedArgs.push(`{ test: "value" }`);
            }
            lines.push(`            expect(key).toEqual([...${expectedKeyPrefix}, ${expectedArgs.join(", ")}]);`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should produce different keys for different path params", () => {`);
            const callArgs1: string[] = [`"path-a"`];
            const callArgs2: string[] = [`"path-b"`];
            for (let i = 1; i < multiParamEp.pathParamNames.length; i++) {
                callArgs1.push(`"same"`);
                callArgs2.push(`"same"`);
            }
            if (multiParamEp.hasRequestBody) {
                callArgs1.push(`{} as any`);
                callArgs2.push(`{} as any`);
            }
            lines.push(`            const key1 = ${fnName}(${callArgs1.join(", ")});`);
            lines.push(`            const key2 = ${fnName}(${callArgs2.join(", ")});`);
            lines.push(`            expect(key1).not.toEqual(key2);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (paginationEp != null) {
            const fnName = `${paginationEp.endpointSafeName}QueryKey`;
            const expectedKeyPrefix = JSON.stringify(paginationEp.keySegments);
            lines.push(`    describe("pagination queries", () => {`);
            lines.push(`        it("should include request in the key", () => {`);
            lines.push(`            const key = ${fnName}({} as any);`);
            lines.push(`            expect(key).toEqual([...${expectedKeyPrefix}, {}]);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        // Key uniqueness across services
        if (queryEndpoints.length >= 2) {
            const ep1 = queryEndpoints[0]!;
            const ep2 = queryEndpoints.find((e) => e.importPath !== ep1.importPath) ?? queryEndpoints[1]!;
            lines.push(`    describe("key uniqueness across services", () => {`);
            lines.push(`        it("should always start with the root client name", () => {`);
            for (const ep of queryEndpoints.slice(0, 3)) {
                const fnName = `${ep.endpointSafeName}QueryKey`;
                const callArg = ep.paramType === "no-param" ? `` : ep.paramType === "single-param" ? `{} as any` : `"x"${ep.hasRequestBody ? ", {} as any" : ""}`;
                lines.push(`            expect(${fnName}(${callArg})[0]).toBe("${this.rootClientName}");`);
            }
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        // requestOptions exclusion
        if (singleParamEp != null) {
            const fnName = `${singleParamEp.endpointSafeName}QueryKey`;
            lines.push(`    describe("requestOptions exclusion", () => {`);
            lines.push(`        it("should not include requestOptions in query keys (only request params)", () => {`);
            lines.push(`            const key = ${fnName}({ test: "value" } as any);`);
            lines.push(`            // Query key functions don't accept requestOptions at all,`);
            lines.push(`            // which prevents cache pollution by design.`);
            lines.push(`            expect(key).toHaveLength(${singleParamEp.keySegments.length + 1});`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        lines.push(`});`);
        lines.push(``);
        return lines.join("\n");
    }

    /**
     * Generates a test file for options factory functions.
     * Tests structure, queryKey consistency, and requestOptions passthrough.
     */
    private generateOptionsFactoriesTestFile(
        queryEndpoints: Array<{
            endpointSafeName: string;
            importPath: string;
            keySegments: string[];
            paramType: "no-param" | "single-param" | "multi-param";
            pathParamNames: string[];
            hasRequestBody: boolean;
            hasPagination: boolean;
            paginationType: string | null;
        }>,
        mutationEndpoints: Array<{
            endpointSafeName: string;
            importPath: string;
            paramType: "no-param" | "single-param" | "multi-param";
        }>
    ): string {
        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(`import { describe, expect, it, vi } from "vitest";`);
        lines.push(``);

        // Collect all imports
        const importsByPath = new Map<string, string[]>();
        const addImport = (path: string, name: string) => {
            let imports = importsByPath.get(path);
            if (imports == null) {
                imports = [];
                importsByPath.set(path, imports);
            }
            if (!imports.includes(name)) {
                imports.push(name);
            }
        };

        for (const ep of queryEndpoints) {
            addImport(ep.importPath, `${ep.endpointSafeName}Options`);
            if (ep.hasPagination) {
                addImport(ep.importPath, `${ep.endpointSafeName}InfiniteOptions`);
            }
        }
        for (const ep of mutationEndpoints) {
            addImport(ep.importPath, `${ep.endpointSafeName}MutationOptions`);
        }

        for (const [importPath, imports] of importsByPath) {
            lines.push(`import { ${imports.join(", ")} } from "${importPath}";`);
        }
        lines.push(``);

        // Mock client helper
        lines.push(`function createMockClient(): any {`);
        lines.push(`    const handler: ProxyHandler<any> = {`);
        lines.push(`        get(_target, prop) {`);
        lines.push(`            if (typeof prop === "string") {`);
        lines.push(`                return new Proxy(vi.fn().mockResolvedValue({ mocked: true }), handler);`);
        lines.push(`            }`);
        lines.push(`            return undefined;`);
        lines.push(`        },`);
        lines.push(`        apply(target, _thisArg, args) {`);
        lines.push(`            return target(...args);`);
        lines.push(`        },`);
        lines.push(`    };`);
        lines.push(`    return new Proxy({}, handler);`);
        lines.push(`}`);
        lines.push(``);

        // Query Options tests
        lines.push(`describe("Query Options Factories", () => {`);
        lines.push(`    describe("structure", () => {`);

        const noParamQuery = queryEndpoints.find((e) => e.paramType === "no-param");
        const singleParamQuery = queryEndpoints.find((e) => e.paramType === "single-param" && !e.hasPagination);
        const multiParamQuery = queryEndpoints.find((e) => e.paramType === "multi-param");

        if (noParamQuery != null) {
            lines.push(`        it("should return an object with queryKey and queryFn for no-param queries", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${noParamQuery.endpointSafeName}Options(client);`);
            lines.push(`            expect(options).toHaveProperty("queryKey");`);
            lines.push(`            expect(options).toHaveProperty("queryFn");`);
            lines.push(`            expect(typeof options.queryFn).toBe("function");`);
            lines.push(`            expect(Array.isArray(options.queryKey)).toBe(true);`);
            lines.push(`        });`);
            lines.push(``);
        }

        if (singleParamQuery != null) {
            lines.push(`        it("should return an object with queryKey and queryFn for single-param queries", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${singleParamQuery.endpointSafeName}Options(client, {} as any);`);
            lines.push(`            expect(options).toHaveProperty("queryKey");`);
            lines.push(`            expect(options).toHaveProperty("queryFn");`);
            lines.push(`            expect(typeof options.queryFn).toBe("function");`);
            lines.push(`        });`);
            lines.push(``);
        }

        if (multiParamQuery != null) {
            const callArgs = ["client", ...multiParamQuery.pathParamNames.map(() => `"path"`)];
            if (multiParamQuery.hasRequestBody) {
                callArgs.push(`{} as any`);
            }
            lines.push(`        it("should return an object with queryKey and queryFn for multi-param queries", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${multiParamQuery.endpointSafeName}Options(${callArgs.join(", ")});`);
            lines.push(`            expect(options).toHaveProperty("queryKey");`);
            lines.push(`            expect(options).toHaveProperty("queryFn");`);
            lines.push(`            expect(typeof options.queryFn).toBe("function");`);
            lines.push(`        });`);
            lines.push(``);
        }

        lines.push(`    });`);
        lines.push(``);

        // queryKey consistency
        lines.push(`    describe("queryKey consistency", () => {`);
        if (noParamQuery != null) {
            const expectedKey = JSON.stringify(noParamQuery.keySegments);
            lines.push(`        it("should produce the correct queryKey for no-param", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${noParamQuery.endpointSafeName}Options(client);`);
            lines.push(`            expect(options.queryKey).toEqual(${expectedKey});`);
            lines.push(`        });`);
            lines.push(``);
        }
        if (singleParamQuery != null) {
            lines.push(`        it("should include request in queryKey for single-param", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const request = { test: "value" };`);
            lines.push(`            const options = ${singleParamQuery.endpointSafeName}Options(client, request as any);`);
            lines.push(`            expect(options.queryKey).toContain(request);`);
            lines.push(`        });`);
            lines.push(``);
        }
        lines.push(`    });`);
        lines.push(``);

        // requestOptions passthrough
        lines.push(`    describe("requestOptions passthrough", () => {`);
        if (noParamQuery != null) {
            lines.push(`        it("should accept requestOptions for no-param query without affecting queryKey", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const opts1 = ${noParamQuery.endpointSafeName}Options(client);`);
            lines.push(`            const opts2 = ${noParamQuery.endpointSafeName}Options(client, { timeout: 5000 } as any);`);
            lines.push(`            expect(opts1.queryKey).toEqual(opts2.queryKey);`);
            lines.push(`        });`);
            lines.push(``);
        }
        if (singleParamQuery != null) {
            lines.push(`        it("should accept requestOptions for single-param query without affecting queryKey", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const request = { test: "value" };`);
            lines.push(`            const opts1 = ${singleParamQuery.endpointSafeName}Options(client, request as any);`);
            lines.push(`            const opts2 = ${singleParamQuery.endpointSafeName}Options(client, request as any, { timeout: 5000 } as any);`);
            lines.push(`            expect(opts1.queryKey).toEqual(opts2.queryKey);`);
            lines.push(`        });`);
            lines.push(``);
        }
        lines.push(`    });`);
        lines.push(`});`);
        lines.push(``);

        // Mutation Options tests
        lines.push(`describe("Mutation Options Factories", () => {`);
        const noParamMutation = mutationEndpoints.find((e) => e.paramType === "no-param");
        const singleParamMutation = mutationEndpoints.find((e) => e.paramType === "single-param");
        const multiParamMutation = mutationEndpoints.find((e) => e.paramType === "multi-param");

        if (singleParamMutation != null) {
            lines.push(`    describe("single-param mutation", () => {`);
            lines.push(`        it("should return an object with mutationFn", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${singleParamMutation.endpointSafeName}MutationOptions(client);`);
            lines.push(`            expect(options).toHaveProperty("mutationFn");`);
            lines.push(`            expect(typeof options.mutationFn).toBe("function");`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should accept requestOptions", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${singleParamMutation.endpointSafeName}MutationOptions(client, { timeout: 5000 } as any);`);
            lines.push(`            expect(options).toHaveProperty("mutationFn");`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (multiParamMutation != null) {
            lines.push(`    describe("multi-param mutation (tuple)", () => {`);
            lines.push(`        it("should return an object with mutationFn that accepts a tuple", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${multiParamMutation.endpointSafeName}MutationOptions(client);`);
            lines.push(`            expect(options).toHaveProperty("mutationFn");`);
            lines.push(`            expect(typeof options.mutationFn).toBe("function");`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (noParamMutation != null) {
            lines.push(`    describe("no-param mutation", () => {`);
            lines.push(`        it("should return an object with mutationFn that takes no arguments", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${noParamMutation.endpointSafeName}MutationOptions(client);`);
            lines.push(`            expect(options).toHaveProperty("mutationFn");`);
            lines.push(`            expect(typeof options.mutationFn).toBe("function");`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should accept requestOptions", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${noParamMutation.endpointSafeName}MutationOptions(client, { timeout: 3000 } as any);`);
            lines.push(`            expect(options).toHaveProperty("mutationFn");`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        lines.push(`});`);
        lines.push(``);

        // Infinite Query Options tests
        const paginationEps = queryEndpoints.filter((e) => e.hasPagination);
        if (paginationEps.length > 0) {
            const ep = paginationEps[0]!;
            lines.push(`describe("Infinite Query Options Factories", () => {`);
            lines.push(`    describe("structure", () => {`);
            lines.push(`        it("should return queryKey, queryFn, initialPageParam, and getNextPageParam", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const options = ${ep.endpointSafeName}InfiniteOptions(client, {} as any);`);
            lines.push(`            expect(options).toHaveProperty("queryKey");`);
            lines.push(`            expect(options).toHaveProperty("queryFn");`);
            lines.push(`            expect(options).toHaveProperty("initialPageParam");`);
            lines.push(`            expect(options).toHaveProperty("getNextPageParam");`);
            lines.push(`            expect(typeof options.queryFn).toBe("function");`);
            lines.push(`            expect(typeof options.getNextPageParam).toBe("function");`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);

            if (ep.paginationType === "cursor") {
                lines.push(`    describe("getNextPageParam", () => {`);
                lines.push(`        it("should extract cursor from lastPage response", () => {`);
                lines.push(`            const client = createMockClient();`);
                lines.push(`            const options = ${ep.endpointSafeName}InfiniteOptions(client, {} as any);`);
                lines.push(`            const nextCursor = options.getNextPageParam(`);
                lines.push(`                { data: [{ id: "1" }], response: { next: "cursor-abc" } } as any,`);
                lines.push(`                [],`);
                lines.push(`                undefined,`);
                lines.push(`            );`);
                lines.push(`            expect(nextCursor).toBe("cursor-abc");`);
                lines.push(`        });`);
                lines.push(``);
                lines.push(`        it("should return undefined when there is no next page", () => {`);
                lines.push(`            const client = createMockClient();`);
                lines.push(`            const options = ${ep.endpointSafeName}InfiniteOptions(client, {} as any);`);
                lines.push(`            const nextCursor = options.getNextPageParam(`);
                lines.push(`                { data: [], response: { next: undefined } } as any,`);
                lines.push(`                [],`);
                lines.push(`                undefined,`);
                lines.push(`            );`);
                lines.push(`            expect(nextCursor).toBeUndefined();`);
                lines.push(`        });`);
                lines.push(`    });`);
                lines.push(``);
            }

            // Regular + infinite share same queryKey
            lines.push(`    describe("regular query options for paginated endpoint", () => {`);
            lines.push(`        it("should share the same queryKey as infinite options", () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const request = {} as any;`);
            lines.push(`            const regularOptions = ${ep.endpointSafeName}Options(client, request);`);
            lines.push(`            const infiniteOptions = ${ep.endpointSafeName}InfiniteOptions(client, request);`);
            lines.push(`            expect(regularOptions.queryKey).toEqual(infiniteOptions.queryKey);`);
            lines.push(`        });`);
            lines.push(`    });`);

            lines.push(`});`);
            lines.push(``);
        }

        return lines.join("\n");
    }

    /**
     * Generates a test file for React hooks.
     * Tests hook integration with TanStack Query and ClientProvider context.
     */
    private generateHooksTestFile(
        queryEndpoints: Array<{
            endpointSafeName: string;
            endpointUnsafeName: string;
            servicePath: ServicePathPart[];
            importPath: string;
            paramType: "no-param" | "single-param" | "multi-param";
            pathParamNames: string[];
            hasRequestBody: boolean;
        }>,
        mutationEndpoints: Array<{
            endpointSafeName: string;
            endpointUnsafeName: string;
            servicePath: ServicePathPart[];
            importPath: string;
            paramType: "no-param" | "single-param" | "multi-param";
            pathParamNames: string[];
            hasRequestBody: boolean;
        }>,
        serviceGroups: ServiceGroup[]
    ): string {
        const lines: string[] = [];
        lines.push(`// @vitest-environment happy-dom`);
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(`import { QueryClient, QueryClientProvider } from "@tanstack/react-query";`);
        lines.push(`import { renderHook, waitFor } from "@testing-library/react";`);
        lines.push(`import { createElement } from "react";`);
        lines.push(`import type { ReactNode } from "react";`);
        lines.push(`import { describe, expect, it, vi } from "vitest";`);
        lines.push(``);
        lines.push(`import { ClientProvider } from "../../../${this.relativePackagePath}/react-query/context.js";`);
        lines.push(``);

        // Collect imports
        const importsByPath = new Map<string, string[]>();
        const addImport = (path: string, name: string) => {
            let imports = importsByPath.get(path);
            if (imports == null) {
                imports = [];
                importsByPath.set(path, imports);
            }
            if (!imports.includes(name)) {
                imports.push(name);
            }
        };

        // Pick representative endpoints
        const noParamQuery = queryEndpoints.find((e) => e.paramType === "no-param");
        const singleParamQuery = queryEndpoints.find((e) => e.paramType === "single-param");
        const multiParamQuery = queryEndpoints.find((e) => e.paramType === "multi-param");
        const noParamMutation = mutationEndpoints.find((e) => e.paramType === "no-param");
        const singleParamMutation = mutationEndpoints.find((e) => e.paramType === "single-param");
        const multiParamMutation = mutationEndpoints.find((e) => e.paramType === "multi-param");

        if (noParamQuery != null) {
            const hookName = `use${noParamQuery.endpointSafeName.charAt(0).toUpperCase() + noParamQuery.endpointSafeName.slice(1)}`;
            addImport(noParamQuery.importPath, hookName);
        }
        if (singleParamQuery != null) {
            const hookName = `use${singleParamQuery.endpointSafeName.charAt(0).toUpperCase() + singleParamQuery.endpointSafeName.slice(1)}`;
            addImport(singleParamQuery.importPath, hookName);
        }
        if (multiParamQuery != null) {
            const hookName = `use${multiParamQuery.endpointSafeName.charAt(0).toUpperCase() + multiParamQuery.endpointSafeName.slice(1)}`;
            addImport(multiParamQuery.importPath, hookName);
        }
        if (noParamMutation != null) {
            const hookName = `use${noParamMutation.endpointSafeName.charAt(0).toUpperCase() + noParamMutation.endpointSafeName.slice(1)}Mutation`;
            addImport(noParamMutation.importPath, hookName);
        }
        if (singleParamMutation != null) {
            const hookName = `use${singleParamMutation.endpointSafeName.charAt(0).toUpperCase() + singleParamMutation.endpointSafeName.slice(1)}Mutation`;
            addImport(singleParamMutation.importPath, hookName);
        }
        if (multiParamMutation != null) {
            const hookName = `use${multiParamMutation.endpointSafeName.charAt(0).toUpperCase() + multiParamMutation.endpointSafeName.slice(1)}Mutation`;
            addImport(multiParamMutation.importPath, hookName);
        }

        for (const [importPath, imports] of importsByPath) {
            lines.push(`import { ${imports.join(", ")} } from "${importPath}";`);
        }
        lines.push(``);

        // Mock client helper — build from service groups
        lines.push(`function createMockClient(): any {`);
        lines.push(`    return {`);
        // Build mock client structure from service groups
        const buildMockLevel = (groups: ServiceGroup[], depth: number): void => {
            const indent = "        ".repeat(depth + 1);
            // Group by first path segment at this depth
            const bySegment = new Map<string, ServiceGroup[]>();
            const leafGroups: ServiceGroup[] = [];
            for (const g of groups) {
                if (g.servicePath.length <= depth) {
                    leafGroups.push(g);
                } else {
                    const seg = g.servicePath[depth]!.unsafeName;
                    let list = bySegment.get(seg);
                    if (list == null) {
                        list = [];
                        bySegment.set(seg, list);
                    }
                    list.push(g);
                }
            }
            // Write leaf endpoints
            for (const g of leafGroups) {
                for (const { endpoint } of g.endpoints) {
                    lines.push(`${indent}${endpoint.name.camelCase.unsafeName}: vi.fn().mockResolvedValue("mock-result"),`);
                }
            }
            // Write child namespaces
            for (const [seg, childGroups] of bySegment) {
                lines.push(`${indent}${seg}: {`);
                buildMockLevel(childGroups, depth + 1);
                lines.push(`${indent}},`);
            }
        };
        buildMockLevel(serviceGroups, 0);
        lines.push(`    };`);
        lines.push(`}`);
        lines.push(``);

        // Wrapper helper
        lines.push(`function createWrapper(client: any) {`);
        lines.push(`    const queryClient = new QueryClient({`);
        lines.push(`        defaultOptions: {`);
        lines.push(`            queries: { retry: false },`);
        lines.push(`            mutations: { retry: false },`);
        lines.push(`        },`);
        lines.push(`    });`);
        lines.push(`    return function Wrapper({ children }: { children: ReactNode }) {`);
        lines.push(`        return createElement(`);
        lines.push(`            QueryClientProvider,`);
        lines.push(`            { client: queryClient },`);
        lines.push(`            createElement(ClientProvider, { client }, children),`);
        lines.push(`        );`);
        lines.push(`    };`);
        lines.push(`}`);
        lines.push(``);

        // Query hook tests
        lines.push(`describe("Query Hooks", () => {`);
        if (noParamQuery != null) {
            const hookName = `use${noParamQuery.endpointSafeName.charAt(0).toUpperCase() + noParamQuery.endpointSafeName.slice(1)}`;
            const clientPath = noParamQuery.servicePath.length > 0
                ? `client.${noParamQuery.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            lines.push(`    describe("${hookName} (no-param query)", () => {`);
            lines.push(`        it("should fetch data using the client from context", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(() => ${hookName}(), { wrapper });`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${noParamQuery.endpointUnsafeName}).toHaveBeenCalled();`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should accept TanStack Query option overrides", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(`);
            lines.push(`                () => ${hookName}(undefined, { enabled: false }),`);
            lines.push(`                { wrapper },`);
            lines.push(`            );`);
            lines.push(`            expect(result.current.isFetching).toBe(false);`);
            lines.push(`            expect(${clientPath}.${noParamQuery.endpointUnsafeName}).not.toHaveBeenCalled();`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (singleParamQuery != null) {
            const hookName = `use${singleParamQuery.endpointSafeName.charAt(0).toUpperCase() + singleParamQuery.endpointSafeName.slice(1)}`;
            const clientPath = singleParamQuery.servicePath.length > 0
                ? `client.${singleParamQuery.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            lines.push(`    describe("${hookName} (single-param query)", () => {`);
            lines.push(`        it("should pass request to the client method", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const request = {} as any;`);
            lines.push(`            const { result } = renderHook(() => ${hookName}(request), { wrapper });`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${singleParamQuery.endpointUnsafeName}).toHaveBeenCalledWith(request, undefined);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (multiParamQuery != null) {
            const hookName = `use${multiParamQuery.endpointSafeName.charAt(0).toUpperCase() + multiParamQuery.endpointSafeName.slice(1)}`;
            const clientPath = multiParamQuery.servicePath.length > 0
                ? `client.${multiParamQuery.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            const hookArgs: string[] = multiParamQuery.pathParamNames.map(() => `"test-path"`);
            if (multiParamQuery.hasRequestBody) {
                hookArgs.push(`{} as any`);
            }
            const expectedCallArgs: string[] = multiParamQuery.pathParamNames.map(() => `"test-path"`);
            if (multiParamQuery.hasRequestBody) {
                expectedCallArgs.push(`{}`);
            }
            expectedCallArgs.push(`undefined`);
            lines.push(`    describe("${hookName} (multi-param query)", () => {`);
            lines.push(`        it("should pass path param and request to the client method", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(`);
            lines.push(`                () => ${hookName}(${hookArgs.join(", ")}),`);
            lines.push(`                { wrapper },`);
            lines.push(`            );`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${multiParamQuery.endpointUnsafeName}).toHaveBeenCalledWith(`);
            lines.push(`                ${expectedCallArgs.join(", ")},`);
            lines.push(`            );`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }
        lines.push(`});`);
        lines.push(``);

        // Mutation hook tests
        lines.push(`describe("Mutation Hooks", () => {`);
        if (noParamMutation != null) {
            const hookName = `use${noParamMutation.endpointSafeName.charAt(0).toUpperCase() + noParamMutation.endpointSafeName.slice(1)}Mutation`;
            const clientPath = noParamMutation.servicePath.length > 0
                ? `client.${noParamMutation.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            lines.push(`    describe("${hookName} (no-param mutation)", () => {`);
            lines.push(`        it("should call the client method on mutate()", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(() => ${hookName}(), { wrapper });`);
            lines.push(`            result.current.mutate();`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${noParamMutation.endpointUnsafeName}).toHaveBeenCalled();`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (singleParamMutation != null) {
            const hookName = `use${singleParamMutation.endpointSafeName.charAt(0).toUpperCase() + singleParamMutation.endpointSafeName.slice(1)}Mutation`;
            const clientPath = singleParamMutation.servicePath.length > 0
                ? `client.${singleParamMutation.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            lines.push(`    describe("${hookName} (single-param mutation)", () => {`);
            lines.push(`        it("should pass the variable directly (not as tuple)", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(() => ${hookName}(), { wrapper });`);
            lines.push(`            result.current.mutate("test-value" as any);`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${singleParamMutation.endpointUnsafeName}).toHaveBeenCalledWith("test-value", undefined);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (multiParamMutation != null) {
            const hookName = `use${multiParamMutation.endpointSafeName.charAt(0).toUpperCase() + multiParamMutation.endpointSafeName.slice(1)}Mutation`;
            const clientPath = multiParamMutation.servicePath.length > 0
                ? `client.${multiParamMutation.servicePath.map((p) => p.unsafeName).join(".")}`
                : "client";
            lines.push(`    describe("${hookName} (multi-param mutation)", () => {`);
            lines.push(`        it("should pass tuple args to the client method", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const { result } = renderHook(() => ${hookName}(), { wrapper });`);
            lines.push(`            result.current.mutate(["path", "body"] as any);`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(${clientPath}.${multiParamMutation.endpointUnsafeName}).toHaveBeenCalledWith("path", "body");`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        // Mutation option overrides
        if (noParamMutation != null) {
            const hookName = `use${noParamMutation.endpointSafeName.charAt(0).toUpperCase() + noParamMutation.endpointSafeName.slice(1)}Mutation`;
            lines.push(`    describe("mutation option overrides", () => {`);
            lines.push(`        it("should accept onSuccess callback", async () => {`);
            lines.push(`            const client = createMockClient();`);
            lines.push(`            const wrapper = createWrapper(client);`);
            lines.push(`            const onSuccess = vi.fn();`);
            lines.push(`            const { result } = renderHook(`);
            lines.push(`                () => ${hookName}(undefined, { onSuccess }),`);
            lines.push(`                { wrapper },`);
            lines.push(`            );`);
            lines.push(`            result.current.mutate();`);
            lines.push(`            await waitFor(() => expect(result.current.isSuccess).toBe(true));`);
            lines.push(`            expect(onSuccess).toHaveBeenCalled();`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        lines.push(`});`);
        lines.push(``);
        return lines.join("\n");
    }

    /**
     * Generates a test file for the React Context/Provider pattern.
     * Tests that useClient() throws outside provider and returns client inside.
     */
    private generateContextTestFile(): string {
        const lines: string[] = [];
        lines.push(`// @vitest-environment happy-dom`);
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(`import { renderHook } from "@testing-library/react";`);
        lines.push(`import { createElement } from "react";`);
        lines.push(`import type { ReactNode } from "react";`);
        lines.push(`import { describe, expect, it } from "vitest";`);
        lines.push(``);
        lines.push(`import { ClientProvider, useClient } from "../../../${this.relativePackagePath}/react-query/context.js";`);
        lines.push(``);
        lines.push(`describe("Context/Provider", () => {`);
        lines.push(`    describe("useClient", () => {`);
        lines.push(`        it("should throw when used outside ClientProvider", () => {`);
        lines.push(`            expect(() => {`);
        lines.push(`                renderHook(() => useClient());`);
        lines.push(`            }).toThrow("useClient must be used within a <ClientProvider>");`);
        lines.push(`        });`);
        lines.push(``);
        lines.push(`        it("should throw with a helpful error message mentioning ClientProvider", () => {`);
        lines.push(`            expect(() => {`);
        lines.push(`                renderHook(() => useClient());`);
        lines.push(`            }).toThrow(/Wrap your component tree with <ClientProvider client=\\{\\.\\.\\.\\.?}>/);`);
        lines.push(`        });`);
        lines.push(``);
        lines.push(`        it("should return the client when used inside ClientProvider", () => {`);
        lines.push(`            const client = {} as any;`);
        lines.push(`            const wrapper = ({ children }: { children: ReactNode }) =>`);
        lines.push(`                createElement(ClientProvider, { client }, children);`);
        lines.push(`            const { result } = renderHook(() => useClient(), { wrapper });`);
        lines.push(`            expect(result.current).toBe(client);`);
        lines.push(`        });`);
        lines.push(``);
        lines.push(`        it("should return the same client instance on re-renders", () => {`);
        lines.push(`            const client = {} as any;`);
        lines.push(`            const wrapper = ({ children }: { children: ReactNode }) =>`);
        lines.push(`                createElement(ClientProvider, { client }, children);`);
        lines.push(`            const { result, rerender } = renderHook(() => useClient(), { wrapper });`);
        lines.push(`            const firstResult = result.current;`);
        lines.push(`            rerender();`);
        lines.push(`            expect(result.current).toBe(firstResult);`);
        lines.push(`        });`);
        lines.push(`    });`);
        lines.push(``);
        lines.push(`    describe("ClientProvider", () => {`);
        lines.push(`        it("should make client available to nested hooks", () => {`);
        lines.push(`            const client = {} as any;`);
        lines.push(`            const InnerWrapper = ({ children }: { children: ReactNode }) =>`);
        lines.push(`                createElement("div", null, children);`);
        lines.push(`            const wrapper = ({ children }: { children: ReactNode }) =>`);
        lines.push(`                createElement(`);
        lines.push(`                    ClientProvider,`);
        lines.push(`                    { client },`);
        lines.push(`                    createElement(InnerWrapper, null, children),`);
        lines.push(`                );`);
        lines.push(`            const { result } = renderHook(() => useClient(), { wrapper });`);
        lines.push(`            expect(result.current).toBe(client);`);
        lines.push(`        });`);
        lines.push(``);
        lines.push(`        it("should allow overriding with a nested ClientProvider", () => {`);
        lines.push(`            const outerClient = { outer: true } as any;`);
        lines.push(`            const innerClient = { inner: true } as any;`);
        lines.push(`            const wrapper = ({ children }: { children: ReactNode }) =>`);
        lines.push(`                createElement(`);
        lines.push(`                    ClientProvider,`);
        lines.push(`                    { client: outerClient },`);
        lines.push(`                    createElement(ClientProvider, { client: innerClient }, children),`);
        lines.push(`                );`);
        lines.push(`            const { result } = renderHook(() => useClient(), { wrapper });`);
        lines.push(`            expect(result.current).toBe(innerClient);`);
        lines.push(`            expect(result.current).not.toBe(outerClient);`);
        lines.push(`        });`);
        lines.push(`    });`);
        lines.push(`});`);
        lines.push(``);
        return lines.join("\n");
    }

    /**
     * Generates a test file for cache invalidation helpers.
     * Tests that invalidation functions call QueryClient.invalidateQueries with correct keys.
     */
    private generateInvalidationTestFile(queryEndpoints: Array<{
        endpointSafeName: string;
        importPath: string;
        keySegments: string[];
        paramType: "no-param" | "single-param" | "multi-param";
        pathParamNames: string[];
        hasRequestBody: boolean;
    }>): string {
        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(`import { QueryClient } from "@tanstack/react-query";`);
        lines.push(`import { describe, expect, it, vi } from "vitest";`);
        lines.push(``);

        // Collect imports
        const importsByPath = new Map<string, string[]>();
        const addImport = (path: string, name: string) => {
            let imports = importsByPath.get(path);
            if (imports == null) {
                imports = [];
                importsByPath.set(path, imports);
            }
            if (!imports.includes(name)) {
                imports.push(name);
            }
        };

        const noParamEp = queryEndpoints.find((e) => e.paramType === "no-param");
        const singleParamEp = queryEndpoints.find((e) => e.paramType === "single-param");
        const multiParamEp = queryEndpoints.find((e) => e.paramType === "multi-param");

        if (noParamEp != null) {
            const cap = noParamEp.endpointSafeName.charAt(0).toUpperCase() + noParamEp.endpointSafeName.slice(1);
            addImport(noParamEp.importPath, `invalidate${cap}`);
        }
        if (singleParamEp != null) {
            const cap = singleParamEp.endpointSafeName.charAt(0).toUpperCase() + singleParamEp.endpointSafeName.slice(1);
            addImport(singleParamEp.importPath, `invalidate${cap}`);
            addImport(singleParamEp.importPath, `invalidateAll${cap}`);
        }
        if (multiParamEp != null) {
            const cap = multiParamEp.endpointSafeName.charAt(0).toUpperCase() + multiParamEp.endpointSafeName.slice(1);
            addImport(multiParamEp.importPath, `invalidate${cap}`);
            addImport(multiParamEp.importPath, `invalidateAll${cap}`);
        }

        for (const [importPath, imports] of importsByPath) {
            lines.push(`import { ${imports.join(", ")} } from "${importPath}";`);
        }
        lines.push(``);

        lines.push(`describe("Cache Invalidation Helpers", () => {`);

        if (noParamEp != null) {
            const cap = noParamEp.endpointSafeName.charAt(0).toUpperCase() + noParamEp.endpointSafeName.slice(1);
            const expectedKey = JSON.stringify(noParamEp.keySegments);
            lines.push(`    describe("no-param endpoint invalidation", () => {`);
            lines.push(`        it("should call queryClient.invalidateQueries with the correct key", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidate${cap}(queryClient);`);
            lines.push(`            expect(spy).toHaveBeenCalledWith({ queryKey: ${expectedKey} });`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (singleParamEp != null) {
            const cap = singleParamEp.endpointSafeName.charAt(0).toUpperCase() + singleParamEp.endpointSafeName.slice(1);
            const prefixKey = JSON.stringify(singleParamEp.keySegments);
            lines.push(`    describe("single-param endpoint invalidation", () => {`);
            lines.push(`        it("should invalidate specific cached entry by param", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidate${cap}(queryClient, "test-param" as any);`);
            lines.push(`            expect(spy).toHaveBeenCalledWith({ queryKey: [...${prefixKey}, "test-param"] });`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should invalidate all cached entries with invalidateAll", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidateAll${cap}(queryClient);`);
            lines.push(`            expect(spy).toHaveBeenCalledWith({ queryKey: ${prefixKey} });`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("invalidateAll key should be a prefix of the specific key", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const specificSpy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidate${cap}(queryClient, "test" as any);`);
            lines.push(`            const specificKey = specificSpy.mock.calls[0]![0].queryKey as string[];`);
            lines.push(`            specificSpy.mockClear();`);
            lines.push(`            await invalidateAll${cap}(queryClient);`);
            lines.push(`            const allKey = specificSpy.mock.calls[0]![0].queryKey as string[];`);
            lines.push(`            expect(specificKey.slice(0, allKey.length)).toEqual(allKey);`);
            lines.push(`            expect(specificKey.length).toBeGreaterThan(allKey.length);`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        if (multiParamEp != null) {
            const cap = multiParamEp.endpointSafeName.charAt(0).toUpperCase() + multiParamEp.endpointSafeName.slice(1);
            const prefixKey = JSON.stringify(multiParamEp.keySegments);
            // Build call args
            const invCallArgs: string[] = ["queryClient", ...multiParamEp.pathParamNames.map(() => `"test-path"`)];
            if (multiParamEp.hasRequestBody) {
                invCallArgs.push(`{} as any`);
            }
            lines.push(`    describe("multi-param endpoint invalidation", () => {`);
            lines.push(`        it("should invalidate specific cached entry by all params", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidate${cap}(${invCallArgs.join(", ")});`);
            // Build expected key
            const expectedKeyArgs: string[] = multiParamEp.pathParamNames.map(() => `"test-path"`);
            if (multiParamEp.hasRequestBody) {
                expectedKeyArgs.push(`{}`);
            }
            lines.push(`            expect(spy).toHaveBeenCalledWith({ queryKey: [...${prefixKey}, ${expectedKeyArgs.join(", ")}] });`);
            lines.push(`        });`);
            lines.push(``);
            lines.push(`        it("should invalidate all cached entries for multi-param endpoint", async () => {`);
            lines.push(`            const queryClient = new QueryClient();`);
            lines.push(`            const spy = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue();`);
            lines.push(`            await invalidateAll${cap}(queryClient);`);
            lines.push(`            expect(spy).toHaveBeenCalledWith({ queryKey: ${prefixKey} });`);
            lines.push(`        });`);
            lines.push(`    });`);
            lines.push(``);
        }

        lines.push(`});`);
        lines.push(``);
        return lines.join("\n");
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
