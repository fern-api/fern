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

        // Generate per-service files
        for (const group of serviceGroups) {
            const serviceFileContent = this.generateServiceFile(group);
            const serviceDirPath = this.getServiceDirPath(group.servicePath);
            const filepath = `${reactQueryDir}/${serviceDirPath}/index.ts`;

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
        // Service file is at react-query/{servicePath}/index.ts
        // Client is at src/Client.ts (same level as react-query/)
        const depth = servicePath.length + 1; // +1 for the react-query directory itself
        const clientImportPath = "../".repeat(depth) + "Client";

        const lines: string[] = [];
        lines.push(`// This file was auto-generated by Fern from our API Definition.`);
        lines.push(``);
        lines.push(`import type { QueryKey } from "@tanstack/react-query";`);
        lines.push(`import type { ${this.rootClientName} } from "${clientImportPath}";`);
        lines.push(``);
        lines.push(`type ClientInstance = InstanceType<typeof ${this.rootClientName}>;`);
        lines.push(``);

        // Build the client accessor chain using unsafeName
        const clientAccess =
            servicePath.length > 0 ? `client.${servicePath.map((p) => p.unsafeName).join(".")}` : "client";
        const clientTypeAccess = `ClientInstance${servicePath.map((p) => `["${p.unsafeName}"]`).join("")}`;

        for (const { endpoint } of group.endpoints) {
            const endpointName = endpoint.name.camelCase.safeName;
            const isGetMethod = endpoint.method === "GET" || endpoint.method === "HEAD";
            const hasPagination = endpoint.pagination != null;

            // Use just the endpoint name for function prefix (file provides service context)
            const capitalizedEndpointName = endpointName.charAt(0).toUpperCase() + endpointName.slice(1);
            const functionPrefix = capitalizedEndpointName;

            const endpointMethodType = `${clientTypeAccess}["${endpointName}"]`;
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
                `"${endpointName}"`
            ];

            if (isGetMethod) {
                // Generate queryKey function
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
                        lines.push(`        queryFn: () => ${clientAccess}.${endpointName}(...args),`);
                    } else {
                        lines.push(`        queryKey: ${queryKeyFnName}(),`);
                        lines.push(`        queryFn: () => ${clientAccess}.${endpointName}(),`);
                    }
                    lines.push(`        initialPageParam: undefined as unknown,`);
                    lines.push(`        getNextPageParam: (_lastPage: Awaited<${returnTypeName}>): unknown => {`);
                    lines.push(`            return undefined;`);
                    lines.push(`        },`);
                    lines.push(`    };`);
                    lines.push(`}`);
                    lines.push(``);
                }

                // Generate queryOptions
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
                    lines.push(`        queryFn: () => ${clientAccess}.${endpointName}(...args),`);
                } else {
                    lines.push(`        queryKey: ${queryKeyFnName}(),`);
                    lines.push(`        queryFn: () => ${clientAccess}.${endpointName}(),`);
                }
                lines.push(`    };`);
                lines.push(`}`);
                lines.push(``);
            } else {
                // Non-GET = mutation
                const mutationFnName = `${functionPrefix}MutationOptions`;
                if (hasRequestParams) {
                    const mutationReturnType = `{ mutationFn: (...args: ${paramsTypeName}) => ${returnTypeName} }`;
                    lines.push(`export function ${mutationFnName}(client: ClientInstance): ${mutationReturnType} {`);
                    lines.push(`    return {`);
                    lines.push(
                        `        mutationFn: (...args: ${paramsTypeName}) => ${clientAccess}.${endpointName}(...args),`
                    );
                } else {
                    const mutationReturnType = `{ mutationFn: () => ${returnTypeName} }`;
                    lines.push(`export function ${mutationFnName}(client: ClientInstance): ${mutationReturnType} {`);
                    lines.push(`    return {`);
                    lines.push(`        mutationFn: () => ${clientAccess}.${endpointName}(),`);
                }
                lines.push(`    };`);
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

                // If this node is also a service AND has children, the barrel needs to
                // re-export its own service content + child namespaces.
                // We put the service content in a separate _self.ts file and re-export.
                if (node.isService && currentPath.length > 0) {
                    // This directory is both a service and has sub-services
                    // Not common but handle it: put self exports first, then child namespaces
                    const selfLines = [...lines];
                    // The service endpoints are in index.ts of this directory
                    // But we need index.ts for the barrel. Move endpoints to _service.ts
                    // Actually, for simplicity, just put everything in index.ts:
                    // export the service functions directly + namespace re-exports
                    // This is fine since endpoint function names won't collide with namespace names
                    // We'll handle this by making the service file NOT index.ts but a separate file
                    // No - let's keep it simple. The barrel IS the service file with added re-exports.
                    // We don't need separate files here.
                    barrelFiles.push({ path: barrelPath, content: selfLines.join("\n") });
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
