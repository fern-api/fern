import { FernIr } from "@fern-fern/ir-sdk";
import {
    caseConverter,
    casingsGenerator,
    createHttpEndpoint,
    createHttpService,
    createMinimalIR,
    createPathParameter,
    createSdkRequestBody
} from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { ReactQueryGenerator } from "../react-query/ReactQueryGenerator.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: test mock for PackageResolver
function createMockPackageResolver(ir: FernIr.IntermediateRepresentation): any {
    return {
        getServiceDeclaration: (packageId: { isRoot: boolean; subpackageId?: string }) => {
            if (packageId.isRoot) {
                const rootServiceId = ir.rootPackage.service;
                if (rootServiceId != null) {
                    return ir.services[rootServiceId];
                }
                return undefined;
            }
            const subpackage = ir.subpackages[packageId.subpackageId ?? ""];
            if (subpackage?.service != null) {
                return ir.services[subpackage.service];
            }
            return undefined;
        }
    };
}

function createEndpointWithMethod(
    name: string,
    method: FernIr.HttpMethod,
    opts?: {
        pathParameters?: FernIr.PathParameter[];
        sdkRequest?: FernIr.SdkRequest;
        docs?: string;
    }
): FernIr.HttpEndpoint {
    const base = createHttpEndpoint({
        pathParameters: opts?.pathParameters,
        allPathParameters: opts?.pathParameters,
        sdkRequest: opts?.sdkRequest,
        docs: opts?.docs
    });
    return {
        ...base,
        id: `endpoint_${name}`,
        name: casingsGenerator.generateName(name),
        method
    };
}

function createIRWithService(opts: {
    serviceName: string;
    endpoints: FernIr.HttpEndpoint[];
    subpackageName?: string;
}): FernIr.IntermediateRepresentation {
    const serviceId = `service_${opts.serviceName}`;
    const service = {
        ...createHttpService(),
        endpoints: opts.endpoints,
        name: {
            fernFilepath: {
                allParts: opts.subpackageName ? [casingsGenerator.generateName(opts.subpackageName)] : [],
                packagePath: opts.subpackageName ? [casingsGenerator.generateName(opts.subpackageName)] : [],
                file: opts.subpackageName ? casingsGenerator.generateName(opts.subpackageName) : undefined
            }
        }
    };

    const ir = createMinimalIR({ services: { [serviceId]: service } });

    if (opts.subpackageName) {
        const subpackageId = `subpackage_${opts.subpackageName}`;
        ir.subpackages[subpackageId] = {
            name: casingsGenerator.generateName(opts.subpackageName),
            fernFilepath: {
                allParts: [casingsGenerator.generateName(opts.subpackageName)],
                packagePath: [casingsGenerator.generateName(opts.subpackageName)],
                file: casingsGenerator.generateName(opts.subpackageName)
            },
            service: serviceId,
            types: [],
            errors: [],
            subpackages: [],
            hasEndpointsInTree: true,
            docs: undefined,
            websocket: undefined,
            webhooks: undefined,
            navigationConfig: undefined,
            displayName: undefined
            // biome-ignore lint/suspicious/noExplicitAny: minimal subpackage mock — some rarely-used fields omitted
        } as any;
        ir.rootPackage.subpackages = [subpackageId];
    } else {
        ir.rootPackage.service = serviceId;
    }

    return ir;
}

function createGenerator(
    ir: FernIr.IntermediateRepresentation,
    opts?: {
        clientClassName?: string;
        npmPackageName?: string;
    }
): ReactQueryGenerator {
    return new ReactQueryGenerator({
        intermediateRepresentation: ir,
        packageResolver: createMockPackageResolver(ir),
        namespaceExport: "SeedApi",
        clientClassName: opts?.clientClassName ?? "SeedApiClient",
        caseConverter,
        npmPackageName: opts?.npmPackageName ?? "@fern/test-sdk",
        relativePackagePath: "src"
    });
}

function getFile(files: Record<string, string>, path: string): string {
    const content = files[path];
    if (content == null) {
        throw new Error(`Expected file "${path}" to exist in generated files`);
    }
    return content;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("ReactQueryGenerator", () => {
    describe("generateFiles", () => {
        it("generates context, types, and index files for API with no endpoints", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();

            expect(files["src/react-query/context.ts"]).toBeDefined();
            expect(files["src/react-query/types.ts"]).toBeDefined();
            expect(files["src/react-query/index.ts"]).toBeDefined();
            expect(files["src/react-query/hooks.ts"]).toBeUndefined();
        });

        it("generates hooks.ts when endpoints exist (no separate options/invalidation files)", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();

            expect(files["src/react-query/hooks.ts"]).toBeDefined();
            // tRPC-style: no separate options.ts or invalidation.ts
            expect(files["src/react-query/options.ts"]).toBeUndefined();
            expect(files["src/react-query/invalidation.ts"]).toBeUndefined();
        });

        it("uses correct file path prefix from relativePackagePath", () => {
            const ir = createMinimalIR();
            const generator = new ReactQueryGenerator({
                intermediateRepresentation: ir,
                packageResolver: createMockPackageResolver(ir),
                namespaceExport: "SeedApi",
                clientClassName: "SeedApiClient",
                caseConverter,
                npmPackageName: "@fern/test-sdk",
                relativePackagePath: "custom/path"
            });
            const files = generator.generateFiles();

            expect(files["custom/path/react-query/context.ts"]).toBeDefined();
            expect(files["custom/path/react-query/types.ts"]).toBeDefined();
            expect(files["custom/path/react-query/index.ts"]).toBeDefined();
        });
    });

    describe("index.ts", () => {
        it("does not export hooks namespace when no endpoints exist", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).not.toContain("hooks.js");
            expect(index).toContain("context.js");
            expect(index).toContain("types.js");
        });

        it("exports namespace from hooks.ts when endpoints exist", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain('export { seedApi } from "./hooks.js"');
        });

        it("exports provider and context hook", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain("SeedApiClientProvider");
            expect(index).toContain("useSeedApiClientContext");
            expect(index).toContain("SeedApiClientProviderProps");
        });

        it("exports QueryKey and all hook option types", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain("QueryKey");
            expect(index).toContain("QueryHookOptions");
            expect(index).toContain("SuspenseQueryHookOptions");
            expect(index).toContain("InfiniteQueryHookOptions");
            expect(index).toContain("SuspenseInfiniteQueryHookOptions");
            expect(index).toContain("MutationHookOptions");
        });
    });

    describe("context.ts", () => {
        it("uses createElement instead of JSX", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const context = files["src/react-query/context.ts"];

            expect(context).toContain("createElement");
            expect(context).not.toContain("<SeedApiClientContext.Provider");
        });

        it("creates context with null default", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const context = files["src/react-query/context.ts"];

            expect(context).toContain("createContext<SeedApiClient | null>(null)");
        });

        it("throws descriptive error when context is not provided", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const context = files["src/react-query/context.ts"];

            expect(context).toContain("if (value === null)");
            expect(context).toContain("SeedApiClient not initialized");
        });

        it("imports client from parent index", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const context = files["src/react-query/context.ts"];

            expect(context).toContain('from "../index.js"');
        });

        it("uses custom client class name", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir, { clientClassName: "AcmeClient" });
            const files = generator.generateFiles();
            const context = files["src/react-query/context.ts"];

            expect(context).toContain("AcmeClient");
            expect(context).toContain("AcmeClientProvider");
            expect(context).toContain("useAcmeClientContext");
            expect(context).toContain("AcmeClientProviderProps");
        });
    });

    describe("types.ts", () => {
        it("defines QueryHookOptions omitting queryKey and queryFn", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const types = files["src/react-query/types.ts"];

            expect(types).toContain('Omit<\n    UseQueryOptions<TData, TError>,\n    "queryKey" | "queryFn"\n>');
        });

        it("defines SuspenseQueryHookOptions omitting queryKey and queryFn", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const types = files["src/react-query/types.ts"];

            expect(types).toContain(
                'Omit<\n    UseSuspenseQueryOptions<TData, TError>,\n    "queryKey" | "queryFn"\n>'
            );
        });

        it("defines MutationHookOptions omitting mutationKey and mutationFn", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const types = files["src/react-query/types.ts"];

            expect(types).toContain(
                'Omit<\n    UseMutationOptions<TData, TError, TVariables>,\n    "mutationKey" | "mutationFn"\n>'
            );
        });
    });

    describe("namespace name derivation", () => {
        it("derives seedApi from SeedApiClient", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export const seedApi =");
        });

        it("derives acme from AcmeClient", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir, { clientClassName: "AcmeClient" });
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export const acme =");
        });

        it("derives myApi from MyApiClient", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir, { clientClassName: "MyApiClient" });
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export const myApi =");
        });

        it("index exports the correct namespace name", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir, { clientClassName: "AcmeClient" });
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain('export { acme } from "./hooks.js"');
        });
    });

    describe("tRPC-style namespace structure", () => {
        it("generates namespace object with service-level grouping", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export const seedApi = {");
            expect(hooks).toContain("user: {");
            expect(hooks).toContain("list: {");
        });

        it("generates useQuery method on each query endpoint node", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useQuery(");
            expect(hooks).toContain("useSuspenseQuery(");
            expect(hooks).toContain("useInfiniteQuery<TPageParam = unknown>(");
            expect(hooks).toContain("useSuspenseInfiniteQuery<TPageParam = unknown>(");
        });

        it("generates useMutation method on each mutation endpoint node", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("create: {");
            expect(hooks).toContain("useMutation(");
            expect(hooks).toContain("mutationFn: (args) => client.user.create(...args)");
        });

        it("generates getQueryKey method on query endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("getQueryKey()");
            expect(hooks).toContain('"@fern/test-sdk", "user", "list"');
        });

        it("generates getQueryOptions method on query endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("getQueryOptions(");
            expect(hooks).toContain("client: SeedApiClient");
            expect(hooks).toContain("queryKey:");
            expect(hooks).toContain("queryFn:");
        });

        it("generates invalidate method on each endpoint node", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("invalidate(queryClient: QueryClient, ...args: unknown[]): Promise<void>");
        });
    });

    describe("structured query keys", () => {
        it("uses structured array keys instead of dot-joined strings", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            // Structured: ["@fern/test-sdk", "user", "list"] not ["@fern/test-sdk", "user.list"]
            expect(hooks).toContain('"@fern/test-sdk", "user", "list"');
            expect(hooks).not.toContain('"user.list"');
        });

        it("uses npm package name as query key prefix", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir, { npmPackageName: "@acme/sdk" });
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('"@acme/sdk", "user", "list"');
        });

        it("falls back to namespace export when npm package name is undefined", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = new ReactQueryGenerator({
                intermediateRepresentation: ir,
                packageResolver: createMockPackageResolver(ir),
                namespaceExport: "AcmeApi",
                clientClassName: "SeedApiClient",
                caseConverter,
                npmPackageName: undefined,
                relativePackagePath: "src"
            });
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('"AcmeApi", "user", "list"');
        });

        it("includes args in query key for endpoints with parameters", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("get", "GET", {
                        pathParameters: [createPathParameter("userId")]
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('"@fern/test-sdk", "user", "get", ...args');
        });
    });

    describe("hierarchical invalidation", () => {
        it("generates SDK-level invalidate on root namespace", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('queryKey: ["@fern/test-sdk"]');
        });

        it("generates service-level invalidate on each service namespace", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('queryKey: ["@fern/test-sdk", "user"]');
        });

        it("generates endpoint-level invalidate with prefix matching", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('queryKey: ["@fern/test-sdk", "user", "list", ...args]');
        });
    });

    describe("query hooks (GET endpoints)", () => {
        it("generates no-args hooks when endpoint has no parameters", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useQuery(\n                options?:");
            expect(hooks).toContain("queryFn: () => client.user.list()");
        });

        it("generates args-accepting hooks when endpoint has path parameters", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("get", "GET", {
                        pathParameters: [createPathParameter("userId")]
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("args: Parameters<");
            expect(hooks).toContain("queryFn: () => client.user.get(...args)");
        });

        it("generates args-accepting hooks when endpoint has request body", () => {
            const ir = createIRWithService({
                serviceName: "search",
                subpackageName: "search",
                endpoints: [
                    createEndpointWithMethod("query", "GET", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("args: Parameters<");
            expect(hooks).toContain("queryFn: () => client.search.query(...args)");
        });

        it("includes JSDoc when endpoint has docs", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("list", "GET", {
                        docs: "List all users"
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("/** List all users */");
        });
    });

    describe("mutation hooks (POST/PUT/DELETE/PATCH endpoints)", () => {
        it("generates useMutation for POST endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("create: {");
            expect(hooks).toContain("useMutation(");
            expect(hooks).toContain("mutationFn: (args) => client.user.create(...args)");
        });

        it("generates useMutation for DELETE endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("delete", "DELETE", {
                        pathParameters: [createPathParameter("userId")]
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("delete: {");
            expect(hooks).toContain("mutationFn: (args) => client.user.delete(...args)");
        });

        it("generates useMutation for PUT endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("update", "PUT", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("update: {");
            expect(hooks).toContain("useMutation(");
        });

        it("generates useMutation for PATCH endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("patch", "PATCH", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("patch: {");
            expect(hooks).toContain("useMutation(");
        });

        it("generates void variables for mutation without arguments", () => {
            const ir = createIRWithService({
                serviceName: "cache",
                subpackageName: "cache",
                endpoints: [createEndpointWithMethod("clear", "POST")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("MutationHookOptions<");
            expect(hooks).toContain(", Error, void>");
            expect(hooks).toContain("mutationFn: () => client.cache.clear()");
        });

        it("generates Parameters variables for mutation with arguments", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('Parameters<SeedApiClient["user"]["create"]>');
        });

        it("mutation endpoints do not have useQuery methods", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            // The create endpoint node should only have useMutation, not useQuery
            expect(hooks).toContain("useMutation(");
            expect(hooks).not.toContain("getQueryKey");
            expect(hooks).not.toContain("getQueryOptions");
        });

        it("includes mutation key with structured format", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('mutationKey: ["@fern/test-sdk", "user", "create"]');
        });
    });

    describe("mixed endpoints", () => {
        it("separates query and mutation endpoints in namespace correctly", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("list", "GET"),
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    }),
                    createEndpointWithMethod("get", "GET", {
                        pathParameters: [createPathParameter("userId")]
                    }),
                    createEndpointWithMethod("delete", "DELETE", {
                        pathParameters: [createPathParameter("userId")]
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            // Query endpoints have all query methods
            expect(hooks).toContain("list: {");
            expect(hooks).toContain("get: {");

            // Mutation endpoints
            expect(hooks).toContain("create: {");
            expect(hooks).toContain("delete: {");
        });

        it("only imports useQuery-related when there are query endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).not.toContain("useQuery,");
            expect(hooks).not.toContain("useSuspenseQuery");
            expect(hooks).not.toContain("useInfiniteQuery");
            expect(hooks).toContain("useMutation");
        });

        it("only imports useMutation when there are mutation endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useQuery");
            expect(hooks).not.toContain("useMutation");
        });
    });

    describe("root-level endpoints", () => {
        it("places root-level endpoints directly on the namespace object", () => {
            const ir = createIRWithService({
                serviceName: "root",
                endpoints: [createEndpointWithMethod("health", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            // Root endpoint directly on namespace (no service nesting)
            expect(hooks).toContain("health: {");
            expect(hooks).toContain("queryFn: () => client.health()");
            expect(hooks).toContain('"@fern/test-sdk", "health"');
        });
    });

    describe("HEAD endpoints", () => {
        it("treats HEAD as a query method", () => {
            const ir = createIRWithService({
                serviceName: "health",
                subpackageName: "health",
                endpoints: [createEndpointWithMethod("check", "HEAD")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("check: {");
            expect(hooks).toContain("useQuery(");
            expect(hooks).toContain("useSuspenseQuery(");
            expect(hooks).not.toContain("useMutation(");
        });
    });

    describe("infinite query methods", () => {
        it("generates infinite query method with required pagination options", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useInfiniteQuery<TPageParam = unknown>(");
            expect(hooks).toContain("initialPageParam: TPageParam");
            expect(hooks).toContain("getNextPageParam:");
        });

        it("generates suspense infinite query method", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useSuspenseInfiniteQuery<TPageParam = unknown>(");
        });

        it("does not generate infinite query for mutation endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).not.toContain("Infinite");
        });

        it("passes args through to infinite query methods", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("get", "GET", {
                        pathParameters: [createPathParameter("userId")]
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useInfiniteQuery<TPageParam = unknown>(\n                args:");
        });
    });

    describe("snapshot", () => {
        it("generates complete namespace snapshot", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("list", "GET", { docs: "List all users" }),
                    createEndpointWithMethod("get", "GET", {
                        pathParameters: [createPathParameter("userId")],
                        docs: "Get a user by ID"
                    }),
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody(),
                        docs: "Create a new user"
                    }),
                    createEndpointWithMethod("delete", "DELETE", {
                        pathParameters: [createPathParameter("userId")],
                        docs: "Delete a user"
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();

            expect(files["src/react-query/hooks.ts"]).toMatchSnapshot();
            expect(files["src/react-query/context.ts"]).toMatchSnapshot();
            expect(files["src/react-query/types.ts"]).toMatchSnapshot();
            expect(files["src/react-query/index.ts"]).toMatchSnapshot();
        });
    });
});
