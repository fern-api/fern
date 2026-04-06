import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { EnvironmentGenerator } from "../environment/EnvironmentGenerator.js";
import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

const caseConverter = new CaseConverter({ generationLanguage: "rust", keywords: undefined, smartCasing: true });

// Mock function to create IR with specific environment configurations
function createMockIR(environmentsConfig?: FernIr.EnvironmentsConfig): FernIr.IntermediateRepresentation {
    return {
        apiName: {
            originalName: "TestAPI",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" },
            pascalCase: { unsafeName: "TestAPI", safeName: "TestAPI" }
        },
        apiVersion: "1.0.0",
        errors: {},
        types: {},
        services: {},
        environments: environmentsConfig
    } as unknown as FernIr.IntermediateRepresentation;
}

// Mock function to create single base URL environment
function createSingleBaseUrlEnvironment(name: string, url: string): FernIr.SingleBaseUrlEnvironment {
    return {
        id: `${name}Id`,
        name: {
            originalName: name,
            camelCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            snakeCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            screamingSnakeCase: {
                unsafeName: name.toUpperCase(),
                safeName: name.toUpperCase()
            },
            pascalCase: { unsafeName: name, safeName: name }
        },
        displayName: name,
        url,
        docs: undefined
    } as unknown as FernIr.SingleBaseUrlEnvironment;
}

// Mock function to create environments union with _visit method
function createSingleBaseUrlEnvironmentsUnion(environments: FernIr.SingleBaseUrlEnvironment[]) {
    return {
        type: "singleBaseUrl",
        environments,
        _visit: (visitor: { singleBaseUrl: (args: { environments: FernIr.SingleBaseUrlEnvironment[] }) => unknown }) =>
            visitor.singleBaseUrl({ environments })
    } as unknown as FernIr.EnvironmentsConfig["environments"];
}

function createMultipleBaseUrlsEnvironmentsUnion(
    environments: FernIr.MultipleBaseUrlsEnvironment[],
    baseUrls: FernIr.EnvironmentBaseUrlWithId[]
) {
    return {
        type: "multipleBaseUrls",
        environments,
        baseUrls,
        _visit: (visitor: {
            multipleBaseUrls: (args: {
                environments: FernIr.MultipleBaseUrlsEnvironment[];
                baseUrls: FernIr.EnvironmentBaseUrlWithId[];
            }) => unknown;
        }) => visitor.multipleBaseUrls({ environments, baseUrls })
    } as unknown as FernIr.EnvironmentsConfig["environments"];
}

// Mock function to create multiple base URLs environment
function createMultipleBaseUrlsEnvironment(name: string, urls: Record<string, string>): FernIr.MultipleBaseUrlsEnvironment {
    return {
        id: `${name}Id`,
        name: {
            originalName: name,
            camelCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            snakeCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            screamingSnakeCase: {
                unsafeName: name.toUpperCase(),
                safeName: name.toUpperCase()
            },
            pascalCase: { unsafeName: name, safeName: name }
        },
        displayName: name,
        urls,
        docs: undefined
    } as unknown as FernIr.MultipleBaseUrlsEnvironment;
}

// Mock function to create environment base URL with ID
function createEnvironmentBaseUrl(id: string, name: string): FernIr.EnvironmentBaseUrlWithId {
    return {
        id,
        name: {
            originalName: name,
            camelCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            snakeCase: {
                unsafeName: name.toLowerCase(),
                safeName: name.toLowerCase()
            },
            screamingSnakeCase: {
                unsafeName: name.toUpperCase(),
                safeName: name.toUpperCase()
            },
            pascalCase: { unsafeName: name, safeName: name }
        },
        displayName: name,
        docs: undefined
    } as FernIr.EnvironmentBaseUrlWithId;
}

// Mock function to create context
function createMockContext(ir: FernIr.IntermediateRepresentation): SdkGeneratorContext {
    return {
        ir,
        case: caseConverter,
        getClientName: () => "TestClient",
        customConfig: {},
        hasEnvironments: () => ir.environments?.environments != null,
        hasMultipleBaseUrls: () => ir.environments?.environments?.type === "multipleBaseUrls",
        getEnvironmentEnumName: () => "Environment"
    } as SdkGeneratorContext;
}

describe("EnvironmentGenerator", () => {
    describe("generate", () => {
        it("should return null when no environments config exists", () => {
            const ir = createMockIR();
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).toBeNull();
        });

        it("should return null when environments config has no environments", () => {
            const environmentsConfig = {
                environments: undefined,
                defaultEnvironment: undefined
            } as unknown as FernIr.EnvironmentsConfig;
            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).toBeNull();
        });
    });

    describe("single base URL environments", () => {
        it("should generate basic single URL environment with production and staging", async () => {
            const environments = [
                createSingleBaseUrlEnvironment("Production", "https://api.example.com"),
                createSingleBaseUrlEnvironment("Staging", "https://staging-api.example.com")
            ];

            const environmentsConfig = {
                environments: createSingleBaseUrlEnvironmentsUnion(environments),
                defaultEnvironment: "ProductionId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/single-url-basic.rs");
        });

        it("should generate single URL environment with multiple environments", async () => {
            const environments = [
                createSingleBaseUrlEnvironment("Production", "https://api.example.com"),
                createSingleBaseUrlEnvironment("Staging", "https://staging-api.example.com"),
                createSingleBaseUrlEnvironment("Development", "https://dev-api.example.com"),
                createSingleBaseUrlEnvironment("Local", "http://localhost:3000")
            ];

            const environmentsConfig = {
                environments: createSingleBaseUrlEnvironmentsUnion(environments),
                defaultEnvironment: "ProductionId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/single-url-multiple.rs");
        });

        it("should generate single URL environment with naming edge cases", async () => {
            const environments = [
                createSingleBaseUrlEnvironment("Prod-API", "https://prod-api.example.com"),
                createSingleBaseUrlEnvironment("staging_env", "https://staging.example.com"),
                createSingleBaseUrlEnvironment("dev-environment", "https://dev.example.com")
            ];

            const environmentsConfig = {
                environments: createSingleBaseUrlEnvironmentsUnion(environments),
                defaultEnvironment: "Prod-APIId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/single-url-naming-edge-cases.rs");
        });

        it("should generate single URL environment with no default", async () => {
            const environments = [
                createSingleBaseUrlEnvironment("Production", "https://api.example.com"),
                createSingleBaseUrlEnvironment("Staging", "https://staging-api.example.com")
            ];

            const environmentsConfig = {
                environments: createSingleBaseUrlEnvironmentsUnion(environments),
                defaultEnvironment: undefined
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/single-url-no-default.rs");
        });
    });

    describe("multiple base URLs environments", () => {
        it("should generate basic multiple URLs environment", async () => {
            const baseUrls = [createEnvironmentBaseUrl("api", "api"), createEnvironmentBaseUrl("auth", "auth")];

            const environments = [
                createMultipleBaseUrlsEnvironment("Production", {
                    api: "https://api.example.com",
                    auth: "https://auth.example.com"
                }),
                createMultipleBaseUrlsEnvironment("Staging", {
                    api: "https://staging-api.example.com",
                    auth: "https://staging-auth.example.com"
                })
            ];

            const environmentsConfig = {
                environments: createMultipleBaseUrlsEnvironmentsUnion(environments, baseUrls),
                defaultEnvironment: "ProductionId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/multi-url-basic.rs");
        });

        it("should generate multiple URLs environment with many services", async () => {
            const baseUrls = [
                createEnvironmentBaseUrl("api", "api"),
                createEnvironmentBaseUrl("auth", "auth"),
                createEnvironmentBaseUrl("storage", "storage"),
                createEnvironmentBaseUrl("analytics", "analytics")
            ];

            const environments = [
                createMultipleBaseUrlsEnvironment("Production", {
                    api: "https://api.example.com",
                    auth: "https://auth.example.com",
                    storage: "https://storage.example.com",
                    analytics: "https://analytics.example.com"
                }),
                createMultipleBaseUrlsEnvironment("Staging", {
                    api: "https://staging-api.example.com",
                    auth: "https://staging-auth.example.com",
                    storage: "https://staging-storage.example.com",
                    analytics: "https://staging-analytics.example.com"
                }),
                createMultipleBaseUrlsEnvironment("Development", {
                    api: "https://dev-api.example.com",
                    auth: "https://dev-auth.example.com",
                    storage: "https://dev-storage.example.com",
                    analytics: "https://dev-analytics.example.com"
                })
            ];

            const environmentsConfig = {
                environments: createMultipleBaseUrlsEnvironmentsUnion(environments, baseUrls),
                defaultEnvironment: "ProductionId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/multi-url-many-services.rs");
        });

        it("should generate multiple URLs environment with mixed protocols", async () => {
            const baseUrls = [
                createEnvironmentBaseUrl("api", "api"),
                createEnvironmentBaseUrl("websocket", "websocket")
            ];

            const environments = [
                createMultipleBaseUrlsEnvironment("Production", {
                    api: "https://api.example.com",
                    websocket: "wss://ws.example.com"
                }),
                createMultipleBaseUrlsEnvironment("Local", {
                    api: "http://localhost:3000",
                    websocket: "ws://localhost:3001"
                })
            ];

            const environmentsConfig = {
                environments: createMultipleBaseUrlsEnvironmentsUnion(environments, baseUrls),
                defaultEnvironment: "ProductionId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            const result = generator.generate();
            expect(result).not.toBeNull();
            await expect(result?.fileContents).toMatchFileSnapshot("snapshots/multi-url-mixed-protocols.rs");
        });
    });

    describe("error handling", () => {
        it("should throw error for unknown environment type", () => {
            const environmentsConfig = {
                environments: {
                    type: "unknownType",
                    _visit: (_visitor: { [key: string]: unknown }) => {
                        throw new Error("Unknown environments type: unknownType");
                    }
                } as unknown as FernIr.EnvironmentsConfig["environments"],
                defaultEnvironment: undefined
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            expect(() => generator.generate()).toThrow("Unknown environments type: unknownType");
        });

        it("should throw error when no environments found for Default implementation", () => {
            const environmentsConfig = {
                environments: createSingleBaseUrlEnvironmentsUnion([]),
                defaultEnvironment: "nonExistentId"
            } as FernIr.EnvironmentsConfig;

            const ir = createMockIR(environmentsConfig);
            const context = createMockContext(ir);
            const generator = new EnvironmentGenerator({ context });

            expect(() => generator.generate()).toThrow("No environments found for Default implementation");
        });
    });
});
