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
            expect(files["src/react-query/options.ts"]).toBeUndefined();
            expect(files["src/react-query/invalidation.ts"]).toBeUndefined();
        });

        it("generates hooks.ts, options.ts, and invalidation.ts when endpoints exist", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();

            expect(files["src/react-query/hooks.ts"]).toBeDefined();
            expect(files["src/react-query/options.ts"]).toBeDefined();
            expect(files["src/react-query/invalidation.ts"]).toBeDefined();
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
        it("does not export hooks when no endpoints exist", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).not.toContain("hooks.js");
            expect(index).toContain("context.js");
            expect(index).toContain("types.js");
        });

        it("exports hooks, options, and invalidation when endpoints exist", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain('export * from "./hooks.js"');
            expect(index).toContain('export * from "./options.js"');
            expect(index).toContain('export * from "./invalidation.js"');
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

        it("exports QueryKey and hook option types", () => {
            const ir = createMinimalIR();
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const index = files["src/react-query/index.ts"];

            expect(index).toContain("QueryKey");
            expect(index).toContain("QueryHookOptions");
            expect(index).toContain("SuspenseQueryHookOptions");
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

    describe("query hooks (GET endpoints)", () => {
        it("generates useQuery, useSuspenseQuery, useInfiniteQuery, and useSuspenseInfiniteQuery hooks for GET endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export function useUserList(");
            expect(hooks).toContain("export function useUserListSuspense(");
            expect(hooks).toContain("export function useUserListInfinite<TPageParam = unknown>(");
            expect(hooks).toContain("export function useUserListSuspenseInfinite<TPageParam = unknown>(");
        });

        it("generates query key function for each GET endpoint", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export function useUserListQueryKey()");
            expect(hooks).toContain('return ["@fern/test-sdk", "user.list"]');
        });

        it("generates no-args hooks when endpoint has no parameters", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useUserList(\n    options?:");
            expect(hooks).toContain("...UserListQueryOptions(client)");
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
            expect(hooks).toContain("...UserGetQueryOptions(client, args)");
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
            expect(hooks).toContain("...SearchQueryQueryOptions(client, args)");
        });

        it("includes query key args when endpoint has parameters", () => {
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

            expect(hooks).toContain("useUserGetQueryKey(...args: Parameters<");
            expect(hooks).toContain('"user.get", ...args]');
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
        it("generates useMutation hook for POST endpoints", () => {
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

            expect(hooks).toContain("export function useUserCreateMutation(");
            expect(hooks).toContain("useMutation({");
            expect(hooks).toContain("mutationFn: (args) => client.user.create(...args)");
        });

        it("generates useMutation hook for DELETE endpoints", () => {
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

            expect(hooks).toContain("export function useUserDeleteMutation(");
            expect(hooks).toContain("mutationFn: (args) => client.user.delete(...args)");
        });

        it("generates useMutation hook for PUT endpoints", () => {
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

            expect(hooks).toContain("export function useUserUpdateMutation(");
        });

        it("generates useMutation hook for PATCH endpoints", () => {
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

            expect(hooks).toContain("useUserPatchMutation(");
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

        it("does not generate useQuery or useSuspenseQuery for mutations", () => {
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

            expect(hooks).not.toContain("useUserCreate(");
            expect(hooks).not.toContain("useUserCreateSuspense(");
            expect(hooks).toContain("useUserCreateMutation(");
        });

        it("includes mutation key", () => {
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

            expect(hooks).toContain('mutationKey: ["@fern/test-sdk", "user.create"]');
        });
    });

    describe("mixed endpoints", () => {
        it("separates query and mutation hooks correctly", () => {
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

            // Query hooks
            expect(hooks).toContain("useUserList(");
            expect(hooks).toContain("useUserListSuspense(");
            expect(hooks).toContain("useUserListInfinite<");
            expect(hooks).toContain("useUserListSuspenseInfinite<");
            expect(hooks).toContain("useUserGet(");
            expect(hooks).toContain("useUserGetSuspense(");
            expect(hooks).toContain("useUserGetInfinite<");
            expect(hooks).toContain("useUserGetSuspenseInfinite<");

            // Mutation hooks
            expect(hooks).toContain("useUserCreateMutation(");
            expect(hooks).toContain("useUserDeleteMutation(");

            // No mutation for GET
            expect(hooks).not.toContain("useUserListMutation");
            expect(hooks).not.toContain("useUserGetMutation");
        });

        it("only imports useQuery/useSuspenseQuery/useInfiniteQuery when there are query endpoints", () => {
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
        it("generates hooks for root-level endpoints without service prefix in accessor", () => {
            const ir = createIRWithService({
                serviceName: "root",
                endpoints: [createEndpointWithMethod("health", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("useHealth(");
            expect(hooks).toContain("...HealthQueryOptions(client)");
            expect(hooks).toContain('return ["@fern/test-sdk", "health"]');
        });
    });

    describe("query key prefix", () => {
        it("uses npm package name when available", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir, { npmPackageName: "@acme/sdk" });
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain('["@acme/sdk", "user.list"]');
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

            expect(hooks).toContain('["AcmeApi", "user.list"]');
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

            expect(hooks).toContain("useHealthCheck(");
            expect(hooks).toContain("useHealthCheckSuspense(");
            expect(hooks).not.toContain("useHealthCheckMutation");
            expect(hooks).not.toContain("useMutation(");
        });
    });

    describe("queryOptions (options.ts)", () => {
        it("generates queryOptions factory for GET endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const options = getFile(files, "src/react-query/options.ts");

            expect(options).toContain("export function UserListQueryOptions(");
            expect(options).toContain("client: SeedApiClient");
            expect(options).toContain("queryKey:");
            expect(options).toContain("queryFn:");
        });

        it("generates queryOptions with args for endpoints with parameters", () => {
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
            const options = getFile(files, "src/react-query/options.ts");

            expect(options).toContain("export function UserGetQueryOptions(");
            expect(options).toContain("client: SeedApiClient");
            expect(options).toContain("args: Parameters<");
            expect(options).toContain("queryFn: () => client.user.get(...args)");
        });

        it("does not generate queryOptions for mutation endpoints", () => {
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
            const options = getFile(files, "src/react-query/options.ts");

            expect(options).not.toContain("UserCreateQueryOptions");
        });

        it("uses client accessor from options, not context hook", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const options = getFile(files, "src/react-query/options.ts");

            expect(options).not.toContain("useContext");
            expect(options).not.toContain("useSeedApiClientContext");
            expect(options).toContain("client: SeedApiClient");
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
            const options = getFile(files, "src/react-query/options.ts");

            expect(options).toContain("/** List all users */");
        });
    });

    describe("cache invalidation (invalidation.ts)", () => {
        it("generates invalidateAll for the SDK", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const invalidation = getFile(files, "src/react-query/invalidation.ts");

            expect(invalidation).toContain("export function invalidateAllSeedApiClientQueries(");
            expect(invalidation).toContain('queryKey: ["@fern/test-sdk"]');
        });

        it("generates per-endpoint invalidation helpers", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const invalidation = getFile(files, "src/react-query/invalidation.ts");

            expect(invalidation).toContain("export function invalidateAllUserListQueries(");
            expect(invalidation).toContain("export function invalidateUserListQuery(");
        });

        it("generates invalidation helpers with correct query keys", () => {
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
            const invalidation = getFile(files, "src/react-query/invalidation.ts");

            expect(invalidation).toContain('queryKey: ["@fern/test-sdk", "user.get"]');
            expect(invalidation).toContain('queryKey: ["@fern/test-sdk", "user.get", ...args]');
        });

        it("imports QueryClient type", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const invalidation = getFile(files, "src/react-query/invalidation.ts");

            expect(invalidation).toContain('import type { QueryClient } from "@tanstack/react-query"');
        });

        it("does not generate invalidation helpers for mutation-only endpoints", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [
                    createEndpointWithMethod("list", "GET"),
                    createEndpointWithMethod("create", "POST", {
                        sdkRequest: createSdkRequestBody()
                    })
                ]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const invalidation = getFile(files, "src/react-query/invalidation.ts");

            expect(invalidation).toContain("invalidateAllUserListQueries");
            expect(invalidation).not.toContain("invalidateUserCreate");
        });
    });

    describe("infinite query hooks", () => {
        it("generates infinite query hook with required pagination options", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export function useUserListInfinite<TPageParam = unknown>(");
            expect(hooks).toContain("initialPageParam: TPageParam");
            expect(hooks).toContain("getNextPageParam:");
            expect(hooks).toContain("useInfiniteQuery(");
        });

        it("generates suspense infinite query hook", () => {
            const ir = createIRWithService({
                serviceName: "user",
                subpackageName: "user",
                endpoints: [createEndpointWithMethod("list", "GET")]
            });
            const generator = createGenerator(ir);
            const files = generator.generateFiles();
            const hooks = getFile(files, "src/react-query/hooks.ts");

            expect(hooks).toContain("export function useUserListSuspenseInfinite<TPageParam = unknown>(");
            expect(hooks).toContain("useSuspenseInfiniteQuery(");
        });

        it("does not generate infinite query hooks for mutation endpoints", () => {
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

        it("passes args through to infinite query hooks", () => {
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

            expect(hooks).toContain("useUserGetInfinite<TPageParam = unknown>(\n    args:");
        });
    });

    describe("snapshot", () => {
        it("generates complete hooks file snapshot", () => {
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
            expect(files["src/react-query/options.ts"]).toMatchSnapshot();
            expect(files["src/react-query/invalidation.ts"]).toMatchSnapshot();
        });
    });
});
