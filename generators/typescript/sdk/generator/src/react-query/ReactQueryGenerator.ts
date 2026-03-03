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

        // Generate per-service files
        for (const group of serviceGroups) {
            const serviceFileContent = this.generateServiceFile(group);
            const serviceDirPath = this.getServiceDirPath(group.servicePath);
            // If this service also has child sub-services, use _service.ts to avoid
            // overwriting with the barrel index.ts
            const fileName = hasChildServices(group) ? "_service.ts" : "index.ts";
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
        // Calculate relative import path to Client from this service file's location
        // Service file is at react-query/{serviceDirPath}/index.ts
        // Client is at src/Client.ts (same level as react-query/)
        // Use getServiceDirPath to account for the "root" directory added for root-level services
        const serviceDirPath = this.getServiceDirPath(servicePath);
        const depth = serviceDirPath.split("/").length + 1; // +1 for the react-query directory itself
        const clientImportPath = "../".repeat(depth) + "Client";

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

        // Value imports (hooks)
        const hookImports: string[] = [];
        if (needsUseInfiniteQuery) {
            hookImports.push("useInfiniteQuery");
        }
        if (needsUseMutation) {
            hookImports.push("useMutation");
        }
        if (needsUseQuery) {
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
        typeImports.push("QueryKey");
        if (needsUseInfiniteQuery) {
            typeImports.push("UseInfiniteQueryResult");
        }
        if (needsUseMutation) {
            typeImports.push("UseMutationResult");
        }
        if (needsUseQuery) {
            typeImports.push("UseQueryResult");
        }
        if (needsUseSuspenseQuery) {
            typeImports.push("UseSuspenseQueryResult");
        }

        lines.push(`import type { ${typeImports.join(", ")} } from "@tanstack/react-query";`);
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
            const functionPrefix = capitalizedEndpointName;

            // Use unsafeName for type extraction from client (must match actual method name)
            const endpointMethodType = `${clientTypeAccess}["${endpointUnsafeName}"]`;
            const paramsTypeName = `${functionPrefix}Params`;
            const returnTypeName = `${functionPrefix}ReturnType`;

            const hasRequestParams = endpoint.sdkRequest != null || endpoint.allPathParameters.length > 0;

            if (hasRequestParams) {
                lines.push(`type ${paramsTypeName} = Parameters<${endpointMethodType}>;`);
            }
            lines.push(`type ${returnTypeName} = ReturnType<${endpointMethodType}>;`);
            lines.push(``);

            // Query key segments include full service path for global uniqueness
            const keySegments = [
                `"${this.rootClientName}"`,
                ...servicePath.map((s) => `"${s.unsafeName}"`),
                `"${endpointUnsafeName}"`
            ];

            if (isGetMethod) {
                // === Query Key ===
                const queryKeyFnName = `${functionPrefix}QueryKey`;
                if (hasRequestParams) {
                    lines.push(`export function ${queryKeyFnName}(...args: ${paramsTypeName}): QueryKey {`);
                    lines.push(`    return [${keySegments.join(", ")}, ...args] as const;`);
                } else {
                    lines.push(`export function ${queryKeyFnName}(): QueryKey {`);
                    lines.push(`    return [${keySegments.join(", ")}] as const;`);
                }
                lines.push(`}`);
                lines.push(``);

                // === Infinite Options + Hook (if paginated) ===
                if (hasPagination) {
                    const infiniteFnName = `${functionPrefix}InfiniteOptions`;
                    const infiniteReturnType = `{ queryKey: QueryKey; queryFn: () => ${returnTypeName}; initialPageParam: unknown; getNextPageParam: (lastPage: Awaited<${returnTypeName}>) => unknown }`;
                    if (hasRequestParams) {
                        lines.push(
                            `export function ${infiniteFnName}(client: ClientInstance, ...args: ${paramsTypeName}): ${infiniteReturnType} {`
                        );
                    } else {
                        lines.push(
                            `export function ${infiniteFnName}(client: ClientInstance): ${infiniteReturnType} {`
                        );
                    }
                    lines.push(`    return {`);
                    if (hasRequestParams) {
                        lines.push(`        queryKey: ${queryKeyFnName}(...args),`);
                        lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(...args),`);
                    } else {
                        lines.push(`        queryKey: ${queryKeyFnName}(),`);
                        lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(),`);
                    }
                    lines.push(`        initialPageParam: undefined as unknown,`);
                    lines.push(`        getNextPageParam: (_lastPage: Awaited<${returnTypeName}>): unknown => {`);
                    lines.push(`            return undefined;`);
                    lines.push(`        },`);
                    lines.push(`    };`);
                    lines.push(`}`);
                    lines.push(``);

                    // useInfiniteQuery hook
                    const useInfiniteFnName = `use${functionPrefix}Infinite`;
                    const useInfiniteReturnType = `UseInfiniteQueryResult<InfiniteData<Awaited<${returnTypeName}>, unknown>, Error>`;
                    if (hasRequestParams) {
                        lines.push(
                            `export function ${useInfiniteFnName}(client: ClientInstance, ...args: ${paramsTypeName}): ${useInfiniteReturnType} {`
                        );
                        lines.push(`    return useInfiniteQuery(${infiniteFnName}(client, ...args));`);
                    } else {
                        lines.push(
                            `export function ${useInfiniteFnName}(client: ClientInstance): ${useInfiniteReturnType} {`
                        );
                        lines.push(`    return useInfiniteQuery(${infiniteFnName}(client));`);
                    }
                    lines.push(`}`);
                    lines.push(``);
                }

                // === Query Options ===
                const queryFnName = `${functionPrefix}Options`;
                const queryReturnType = `{ queryKey: QueryKey; queryFn: () => ${returnTypeName} }`;
                if (hasRequestParams) {
                    lines.push(
                        `export function ${queryFnName}(client: ClientInstance, ...args: ${paramsTypeName}): ${queryReturnType} {`
                    );
                } else {
                    lines.push(`export function ${queryFnName}(client: ClientInstance): ${queryReturnType} {`);
                }
                lines.push(`    return {`);
                if (hasRequestParams) {
                    lines.push(`        queryKey: ${queryKeyFnName}(...args),`);
                    lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(...args),`);
                } else {
                    lines.push(`        queryKey: ${queryKeyFnName}(),`);
                    lines.push(`        queryFn: () => ${clientAccess}.${endpointUnsafeName}(),`);
                }
                lines.push(`    };`);
                lines.push(`}`);
                lines.push(``);

                // === useQuery hook ===
                const useQueryFnName = `use${functionPrefix}`;
                const useQueryReturnType = `UseQueryResult<Awaited<${returnTypeName}>, Error>`;
                if (hasRequestParams) {
                    lines.push(
                        `export function ${useQueryFnName}(client: ClientInstance, ...args: ${paramsTypeName}): ${useQueryReturnType} {`
                    );
                    lines.push(`    return useQuery(${queryFnName}(client, ...args));`);
                } else {
                    lines.push(`export function ${useQueryFnName}(client: ClientInstance): ${useQueryReturnType} {`);
                    lines.push(`    return useQuery(${queryFnName}(client));`);
                }
                lines.push(`}`);
                lines.push(``);

                // === useSuspenseQuery hook ===
                const useSuspenseFnName = `useSuspense${functionPrefix}`;
                const useSuspenseReturnType = `UseSuspenseQueryResult<Awaited<${returnTypeName}>, Error>`;
                if (hasRequestParams) {
                    lines.push(
                        `export function ${useSuspenseFnName}(client: ClientInstance, ...args: ${paramsTypeName}): ${useSuspenseReturnType} {`
                    );
                    lines.push(`    return useSuspenseQuery(${queryFnName}(client, ...args));`);
                } else {
                    lines.push(
                        `export function ${useSuspenseFnName}(client: ClientInstance): ${useSuspenseReturnType} {`
                    );
                    lines.push(`    return useSuspenseQuery(${queryFnName}(client));`);
                }
                lines.push(`}`);
                lines.push(``);

                // === Cache invalidation helpers ===
                const invalidateFnName = `invalidate${functionPrefix}`;
                if (hasRequestParams) {
                    lines.push(
                        `export function ${invalidateFnName}(queryClient: QueryClient, ...args: ${paramsTypeName}): Promise<void> {`
                    );
                    lines.push(`    return queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}(...args) });`);
                } else {
                    lines.push(`export function ${invalidateFnName}(queryClient: QueryClient): Promise<void> {`);
                    lines.push(`    return queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}() });`);
                }
                lines.push(`}`);
                lines.push(``);

                // Invalidate ALL cached entries for this endpoint (regardless of args)
                const invalidateAllFnName = `invalidateAll${functionPrefix}`;
                lines.push(`export function ${invalidateAllFnName}(queryClient: QueryClient): Promise<void> {`);
                lines.push(`    return queryClient.invalidateQueries({ queryKey: [${keySegments.join(", ")}] });`);
                lines.push(`}`);
                lines.push(``);
            } else {
                // === Mutation Options ===
                const mutationFnName = `${functionPrefix}MutationOptions`;
                if (hasRequestParams) {
                    const mutationReturnType = `{ mutationFn: (...args: ${paramsTypeName}) => ${returnTypeName} }`;
                    lines.push(`export function ${mutationFnName}(client: ClientInstance): ${mutationReturnType} {`);
                    lines.push(`    return {`);
                    lines.push(
                        `        mutationFn: (...args: ${paramsTypeName}) => ${clientAccess}.${endpointUnsafeName}(...args),`
                    );
                } else {
                    const mutationReturnType = `{ mutationFn: () => ${returnTypeName} }`;
                    lines.push(`export function ${mutationFnName}(client: ClientInstance): ${mutationReturnType} {`);
                    lines.push(`    return {`);
                    lines.push(`        mutationFn: () => ${clientAccess}.${endpointUnsafeName}(),`);
                }
                lines.push(`    };`);
                lines.push(`}`);
                lines.push(``);

                // === useMutation hook ===
                const useMutationFnName = `use${functionPrefix}Mutation`;
                if (hasRequestParams) {
                    const useMutationReturnType = `UseMutationResult<Awaited<${returnTypeName}>, Error, ${paramsTypeName}, unknown>`;
                    lines.push(
                        `export function ${useMutationFnName}(client: ClientInstance): ${useMutationReturnType} {`
                    );
                    lines.push(
                        `    return useMutation<Awaited<${returnTypeName}>, Error, ${paramsTypeName}, unknown>({`
                    );
                    lines.push(`        mutationFn: (args) => ${clientAccess}.${endpointUnsafeName}(...args),`);
                    lines.push(`    });`);
                } else {
                    const useMutationReturnType = `UseMutationResult<Awaited<${returnTypeName}>, Error, void, unknown>`;
                    lines.push(
                        `export function ${useMutationFnName}(client: ClientInstance): ${useMutationReturnType} {`
                    );
                    lines.push(`    return useMutation<Awaited<${returnTypeName}>, Error, void, unknown>({`);
                    lines.push(`        mutationFn: () => ${clientAccess}.${endpointUnsafeName}(),`);
                    lines.push(`    });`);
                }
                lines.push(`}`);
                lines.push(``);
            }
        }

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

            // Handle root-level services (empty path)
            if (group.servicePath.length === 0) {
                root.isService = true;
            }
        }

        // Generate barrel files by traversing the tree
        const generateBarrel = (node: DirNode, currentPath: string[]): void => {
            // If this node has children, generate a barrel for them
            if (node.children.size > 0) {
                const lines: string[] = [];
                lines.push(`// This file was auto-generated by Fern from our API Definition.`);
                lines.push(``);

                for (const [unsafeName, child] of node.children) {
                    const exportName = child.safeName;
                    if (child.isService && child.children.size === 0) {
                        // Leaf service: namespace re-export from direct child
                        lines.push(`export * as ${exportName} from "./${unsafeName}/index.js";`);
                    } else if (child.isService && child.children.size > 0) {
                        // Service with sub-services: namespace re-export from child barrel
                        lines.push(`export * as ${exportName} from "./${unsafeName}/index.js";`);
                    } else {
                        // Intermediate directory (not a service itself): namespace re-export
                        lines.push(`export * as ${exportName} from "./${unsafeName}/index.js";`);
                    }
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
