import { HttpEndpoint, HttpService, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { ExportsManager, ImportsManager, PackageId } from "@fern-typescript/commons";
import { SdkContext } from "@fern-typescript/contexts";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

export declare namespace ReactQueryHooksGenerator {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        packageResolver: PackageResolver;
        namespaceExport: string;
    }
}

export class ReactQueryHooksGenerator {
    private intermediateRepresentation: IntermediateRepresentation;
    private packageResolver: PackageResolver;
    private namespaceExport: string;

    constructor({ intermediateRepresentation, packageResolver, namespaceExport }: ReactQueryHooksGenerator.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.packageResolver = packageResolver;
        this.namespaceExport = namespaceExport;
    }

    public generateHooksForService({
        service,
        packageId,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        packageId: PackageId;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        for (const endpoint of service.endpoints) {
            this.generateHookForEndpoint({
                service,
                endpoint,
                packageId,
                file,
                importsManager,
                exportsManager,
                context
            });
        }
    }

    private generateHookForEndpoint({
        service,
        endpoint,
        packageId,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        packageId: PackageId;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        const isQuery = this.isQueryEndpoint(endpoint);
        const hookName = this.getHookName(service, endpoint, isQuery);
        const suspenseHookName = this.getSuspenseHookName(service, endpoint);
        const infiniteHookName = this.getInfiniteHookName(service, endpoint);

        if (isQuery) {
            this.generateQueryHook({
                service,
                endpoint,
                hookName,
                file,
                importsManager,
                exportsManager,
                context
            });

            this.generateSuspenseQueryHook({
                service,
                endpoint,
                suspenseHookName,
                file,
                importsManager,
                exportsManager,
                context
            });

            if (this.supportsPagination(endpoint)) {
                this.generateInfiniteQueryHook({
                    service,
                    endpoint,
                    infiniteHookName,
                    file,
                    importsManager,
                    exportsManager,
                    context
                });
            }
        } else {
            this.generateMutationHook({
                service,
                endpoint,
                hookName,
                file,
                importsManager,
                exportsManager,
                context
            });
        }

        this.generateInvalidationUtilities({
            service,
            endpoint,
            file,
            importsManager,
            exportsManager,
            context
        });

        this.generatePrefetchUtilities({
            service,
            endpoint,
            file,
            importsManager,
            exportsManager,
            context
        });
    }

    private isQueryEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.method === "GET";
    }

    private supportsPagination(endpoint: HttpEndpoint): boolean {
        const response = endpoint.response;
        if (response?.body?.type === "json") {
            return false;
        }
        return false;
    }

    private getHookName(service: HttpService, endpoint: HttpEndpoint, isQuery: boolean): string {
        const serviceName = this.getServiceName(service);
        const endpointName = this.getEndpointName(endpoint);
        const suffix = isQuery ? "" : "Mutation";
        return `use${serviceName}${endpointName}${suffix}`;
    }

    private getSuspenseHookName(service: HttpService, endpoint: HttpEndpoint): string {
        const serviceName = this.getServiceName(service);
        const endpointName = this.getEndpointName(endpoint);
        return `use${serviceName}${endpointName}Suspense`;
    }

    private getInfiniteHookName(service: HttpService, endpoint: HttpEndpoint): string {
        const serviceName = this.getServiceName(service);
        const endpointName = this.getEndpointName(endpoint);
        return `use${serviceName}${endpointName}Infinite`;
    }

    private getServiceName(service: HttpService): string {
        const name = service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join("");
        return name || "Service";
    }

    private getEndpointName(endpoint: HttpEndpoint): string {
        return endpoint.name.pascalCase.safeName;
    }

    private generateQueryHook({
        service,
        endpoint,
        hookName,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        hookName: string;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["useQuery", "UseQueryOptions", "UseQueryResult"]
        });

        importsManager.addImport("react", {
            namedImports: ["useContext"]
        });

        importsManager.addImport("./index", {
            namedImports: ["SdkClientContext"]
        });

        const hookCode = `
export function ${hookName}(
    options?: UseQueryOptions<unknown, Error, unknown, string[]>
): UseQueryResult<unknown, Error> {
    const client = useContext(SdkClientContext);
    if (!client) {
        throw new Error("${hookName} must be used within a provider");
    }

    return useQuery({
        queryKey: ["${this.getQueryKey(service, endpoint)}"],
        queryFn: async () => {
            return await client.${this.getClientMethodPath(service, endpoint)}();
        },
        ...options
    });
}
`;

        file.addStatements(hookCode);
    }

    private generateSuspenseQueryHook({
        service,
        endpoint,
        suspenseHookName,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        suspenseHookName: string;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["useSuspenseQuery", "UseSuspenseQueryOptions", "UseSuspenseQueryResult"]
        });

        importsManager.addImport("react", {
            namedImports: ["useContext"]
        });

        importsManager.addImport("./index", {
            namedImports: ["SdkClientContext"]
        });

        const hookCode = `
export function ${suspenseHookName}(
    options?: UseSuspenseQueryOptions<unknown, Error, unknown, string[]>
): UseSuspenseQueryResult<unknown, Error> {
    const client = useContext(SdkClientContext);
    if (!client) {
        throw new Error("${suspenseHookName} must be used within a provider");
    }

    return useSuspenseQuery({
        queryKey: ["${this.getQueryKey(service, endpoint)}"],
        queryFn: async () => {
            return await client.${this.getClientMethodPath(service, endpoint)}();
        },
        ...options
    });
}
`;

        file.addStatements(hookCode);
    }

    private generateInfiniteQueryHook({
        service,
        endpoint,
        infiniteHookName,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        infiniteHookName: string;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["useInfiniteQuery", "UseInfiniteQueryOptions", "UseInfiniteQueryResult"]
        });

        importsManager.addImport("react", {
            namedImports: ["useContext"]
        });

        importsManager.addImport("./index", {
            namedImports: ["SdkClientContext"]
        });

        const hookCode = `
export function ${infiniteHookName}(
    options?: UseInfiniteQueryOptions<unknown, Error, unknown, unknown, string[]>
): UseInfiniteQueryResult<unknown, Error> {
    const client = useContext(SdkClientContext);
    if (!client) {
        throw new Error("${infiniteHookName} must be used within a provider");
    }

    return useInfiniteQuery({
        queryKey: ["${this.getQueryKey(service, endpoint)}"],
        queryFn: async ({ pageParam }) => {
            return await client.${this.getClientMethodPath(service, endpoint)}({ cursor: pageParam });
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        ...options
    });
}
`;

        file.addStatements(hookCode);
    }

    private generateMutationHook({
        service,
        endpoint,
        hookName,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        hookName: string;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["useMutation", "UseMutationOptions", "UseMutationResult"]
        });

        importsManager.addImport("react", {
            namedImports: ["useContext"]
        });

        importsManager.addImport("./index", {
            namedImports: ["SdkClientContext"]
        });

        const hookCode = `
export function ${hookName}(
    options?: UseMutationOptions<unknown, Error, any, unknown>
): UseMutationResult<unknown, Error, any, unknown> {
    const client = useContext(SdkClientContext);
    if (!client) {
        throw new Error("${hookName} must be used within a provider");
    }

    return useMutation({
        mutationFn: async (variables) => {
            return await client.${this.getClientMethodPath(service, endpoint)}(variables);
        },
        ...options
    });
}
`;

        file.addStatements(hookCode);
    }

    private generateInvalidationUtilities({
        service,
        endpoint,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["QueryClient"]
        });

        const serviceName = this.getServiceName(service);
        const endpointName = this.getEndpointName(endpoint);
        const queryKey = this.getQueryKey(service, endpoint);

        const invalidateFunctionName = `invalidate${serviceName}${endpointName}`;
        const invalidateCode = `
export function ${invalidateFunctionName}(
    queryClient: QueryClient,
    filters?: any
): Promise<void> {
    return queryClient.invalidateQueries({
        queryKey: ["${queryKey}"],
        ...filters
    });
}
`;

        file.addStatements(invalidateCode);

        const invalidateAllFunctionName = `invalidateAll${serviceName}`;
        const invalidateAllCode = `
export function ${invalidateAllFunctionName}(
    queryClient: QueryClient
): Promise<void> {
    return queryClient.invalidateQueries({
        predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === "string" && key.startsWith("${serviceName.toLowerCase()}");
        }
    });
}
`;

        const existingFunction = file.getFunction(invalidateAllFunctionName);
        if (!existingFunction) {
            file.addStatements(invalidateAllCode);
        }
    }

    private generatePrefetchUtilities({
        service,
        endpoint,
        file,
        importsManager,
        exportsManager,
        context
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        file: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        context: SdkContext;
    }): void {
        if (!this.isQueryEndpoint(endpoint)) {
            return;
        }

        importsManager.addImport("@tanstack/react-query", {
            namedImports: ["QueryClient"]
        });

        const serviceName = this.getServiceName(service);
        const endpointName = this.getEndpointName(endpoint);
        const queryKey = this.getQueryKey(service, endpoint);

        const prefetchFunctionName = `prefetch${serviceName}${endpointName}`;
        const prefetchCode = `
export async function ${prefetchFunctionName}(
    client: any,
    queryClient: QueryClient
): Promise<void> {
    await queryClient.prefetchQuery({
        queryKey: ["${queryKey}"],
        queryFn: async () => {
            return await client.${this.getClientMethodPath(service, endpoint)}();
        }
    });
}
`;

        file.addStatements(prefetchCode);
    }

    private getQueryKey(service: HttpService, endpoint: HttpEndpoint): string {
        const serviceName = this.getServiceName(service).toLowerCase();
        const endpointName = this.getEndpointName(endpoint).toLowerCase();
        return `${serviceName}.${endpointName}`;
    }

    private getClientMethodPath(service: HttpService, endpoint: HttpEndpoint): string {
        const servicePath = service.name.fernFilepath.allParts.map((part) => part.camelCase.safeName).join(".");
        const endpointName = endpoint.name.camelCase.safeName;

        if (servicePath) {
            return `${servicePath}.${endpointName}`;
        }
        return endpointName;
    }
}
