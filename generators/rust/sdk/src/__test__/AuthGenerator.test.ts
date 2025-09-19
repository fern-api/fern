import * as FernIr from "@fern-fern/ir-sdk/api";

import { HttpEndpoint, HttpService, IntermediateRepresentation, Subpackage } from "@fern-fern/ir-sdk/api";
import { describe, expect, it } from "vitest";
import { RootClientGenerator } from "../generators/RootClientGenerator";
import { SubClientGenerator } from "../generators/SubClientGenerator";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

// Mock function to create IR with specific auth configurations
interface MockAuthConfig {
    requiresAuth?: boolean;
    type?: string;
    name?: string;
    valueType?: FernIr.TypeReference;
    token?: FernIr.TypeReference;
    username?: FernIr.TypeReference;
    password?: FernIr.TypeReference;
    types?: MockAuthConfig[];
}

function createAuthSchemesFromConfig(config: MockAuthConfig): FernIr.AuthScheme[] {
    if (config.type === "or" && config.types) {
        return config.types.map((typeConfig) => createSingleAuthScheme(typeConfig));
    }
    return [createSingleAuthScheme(config)];
}

function createSingleAuthScheme(config: MockAuthConfig): FernIr.AuthScheme {
    switch (config.type) {
        case "bearer":
            return FernIr.AuthScheme.bearer({
                token: {
                    originalName: "token",
                    camelCase: { unsafeName: "token", safeName: "token" },
                    snakeCase: { unsafeName: "token", safeName: "token" },
                    screamingSnakeCase: { unsafeName: "TOKEN", safeName: "TOKEN" },
                    pascalCase: { unsafeName: "Token", safeName: "Token" }
                },
                tokenEnvVar: undefined,
                docs: undefined
            });
        case "basic":
            return FernIr.AuthScheme.basic({
                username: {
                    originalName: "username",
                    camelCase: { unsafeName: "username", safeName: "username" },
                    snakeCase: { unsafeName: "username", safeName: "username" },
                    screamingSnakeCase: { unsafeName: "USERNAME", safeName: "USERNAME" },
                    pascalCase: { unsafeName: "Username", safeName: "Username" }
                },
                usernameEnvVar: undefined,
                password: {
                    originalName: "password",
                    camelCase: { unsafeName: "password", safeName: "password" },
                    snakeCase: { unsafeName: "password", safeName: "password" },
                    screamingSnakeCase: { unsafeName: "PASSWORD", safeName: "PASSWORD" },
                    pascalCase: { unsafeName: "Password", safeName: "Password" }
                },
                passwordEnvVar: undefined,
                docs: undefined
            });
        case "header":
            return FernIr.AuthScheme.header({
                name: {
                    name: {
                        originalName: config.name || "api_key",
                        camelCase: { unsafeName: "apiKey", safeName: "apiKey" },
                        snakeCase: { unsafeName: "api_key", safeName: "api_key" },
                        screamingSnakeCase: { unsafeName: "API_KEY", safeName: "API_KEY" },
                        pascalCase: { unsafeName: "ApiKey", safeName: "ApiKey" }
                    },
                    wireValue: config.name || "X-API-Key"
                },
                valueType:
                    config.valueType ||
                    FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                prefix: undefined,
                headerEnvVar: undefined,
                docs: undefined
            });
        default:
            throw new Error(`Unsupported auth type: ${config.type}`);
    }
}

function createMockIRWithAuth(authConfig: MockAuthConfig): IntermediateRepresentation {
    const service: HttpService = {
        availability: undefined,
        name: {
            fernFilepath: {
                allParts: [],
                file: undefined,
                packagePath: []
            }
        },
        displayName: undefined,
        basePath: {
            head: "/api",
            parts: []
        },
        headers: [],
        pathParameters: [],
        encoding: undefined,
        transport: undefined,
        endpoints: [
            {
                id: "getUser",
                name: {
                    originalName: "getUser",
                    camelCase: { unsafeName: "getUser", safeName: "getUser" },
                    snakeCase: { unsafeName: "get_user", safeName: "get_user" },
                    screamingSnakeCase: { unsafeName: "GET_USER", safeName: "GET_USER" },
                    pascalCase: { unsafeName: "GetUser", safeName: "GetUser" }
                },
                displayName: undefined,
                availability: undefined,
                docs: undefined,
                method: "GET",
                baseUrl: undefined,
                v2BaseUrls: [],
                basePath: undefined,
                path: {
                    head: "/users/{id}",
                    parts: [
                        {
                            pathParameter: "id",
                            tail: ""
                        }
                    ]
                },
                fullPath: {
                    head: "/users/{id}",
                    parts: [
                        {
                            pathParameter: "id",
                            tail: ""
                        }
                    ]
                },
                pathParameters: [
                    {
                        name: {
                            originalName: "id",
                            camelCase: { unsafeName: "id", safeName: "id" },
                            snakeCase: { unsafeName: "id", safeName: "id" },
                            screamingSnakeCase: { unsafeName: "ID", safeName: "ID" },
                            pascalCase: { unsafeName: "Id", safeName: "Id" }
                        },
                        valueType: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                        location: FernIr.PathParameterLocation.Endpoint,
                        variable: "id",
                        v2Examples: undefined,
                        docs: undefined
                    }
                ],
                allPathParameters: [
                    {
                        name: {
                            originalName: "id",
                            camelCase: { unsafeName: "id", safeName: "id" },
                            snakeCase: { unsafeName: "id", safeName: "id" },
                            screamingSnakeCase: { unsafeName: "ID", safeName: "ID" },
                            pascalCase: { unsafeName: "Id", safeName: "Id" }
                        },
                        valueType: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                        location: FernIr.PathParameterLocation.Endpoint,
                        variable: "id",
                        v2Examples: undefined,
                        docs: undefined
                    }
                ],
                headers: [],
                queryParameters: [],
                requestBody: undefined,
                sdkRequest: undefined,
                response: {
                    statusCode: 200,
                    body: FernIr.HttpResponseBody.json(
                        FernIr.JsonResponse.response({
                            responseBodyType: FernIr.TypeReference.primitive({
                                v1: FernIr.PrimitiveTypeV1.String,
                                v2: undefined
                            }),
                            docs: undefined,
                            v2Examples: undefined
                        })
                    )
                },
                errors: [],
                auth: authConfig.requiresAuth ? true : false,
                idempotent: false,
                userSpecifiedExamples: [],
                autogeneratedExamples: [],
                v2Examples: undefined,
                transport: undefined,
                source: undefined,
                pagination: undefined
            } as HttpEndpoint
        ]
    };

    const subpackage: Subpackage = {
        name: {
            originalName: "user",
            camelCase: { unsafeName: "user", safeName: "user" },
            snakeCase: { unsafeName: "user", safeName: "user" },
            screamingSnakeCase: { unsafeName: "USER", safeName: "USER" },
            pascalCase: { unsafeName: "User", safeName: "User" }
        },
        fernFilepath: {
            allParts: [],
            file: undefined,
            packagePath: []
        },
        service: "UserService",
        types: [],
        errors: [],
        subpackages: [],
        hasEndpointsInTree: true,
        navigationConfig: undefined,
        webhooks: undefined,
        websocket: undefined,
        docs: undefined
    };

    return {
        fdrApiDefinitionId: undefined,
        apiVersion: undefined,
        apiName: {
            originalName: "TestAPI",
            camelCase: { unsafeName: "testApi", safeName: "testApi" },
            snakeCase: { unsafeName: "test_api", safeName: "test_api" },
            screamingSnakeCase: { unsafeName: "TEST_API", safeName: "TEST_API" },
            pascalCase: { unsafeName: "TestAPI", safeName: "TestAPI" }
        },
        apiDisplayName: undefined,
        apiDocs: undefined,
        auth: {
            requirement: authConfig.type === "or" ? "ANY" : "ALL",
            schemes: authConfig.requiresAuth ? createAuthSchemesFromConfig(authConfig) : [],
            docs: undefined
        },
        headers: [],
        idempotencyHeaders: [],
        types: {},
        services: {
            UserService: service
        },
        webhookGroups: {},
        websocketChannels: undefined,
        errors: {},
        subpackages: {
            user: subpackage
        },
        rootPackage: {
            types: [],
            errors: [],
            subpackages: ["user"],
            hasEndpointsInTree: true,
            fernFilepath: {
                allParts: [],
                file: undefined,
                packagePath: []
            },
            docs: undefined,
            navigationConfig: undefined,
            service: undefined,
            webhooks: undefined,
            websocket: undefined
        },
        constants: {
            errorInstanceIdKey: {
                name: {
                    originalName: "errorInstanceId",
                    camelCase: { unsafeName: "errorInstanceId", safeName: "errorInstanceId" },
                    snakeCase: { unsafeName: "error_instance_id", safeName: "error_instance_id" },
                    screamingSnakeCase: { unsafeName: "ERROR_INSTANCE_ID", safeName: "ERROR_INSTANCE_ID" },
                    pascalCase: { unsafeName: "ErrorInstanceId", safeName: "ErrorInstanceId" }
                },
                wireValue: "errorInstanceId"
            }
        },
        environments: undefined,
        basePath: undefined,
        pathParameters: [],
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy.statusCode(),
        sdkConfig: {
            isAuthMandatory: authConfig.requiresAuth || false,
            hasStreamingEndpoints: false,
            hasFileDownloadEndpoints: false,
            hasPaginatedEndpoints: false,
            platformHeaders: {
                language: "rust",
                sdkName: "test-client",
                sdkVersion: "0.1.0",
                userAgent: undefined
            }
        },
        variables: [],
        serviceTypeReferenceInfo: {
            typesReferencedOnlyByService: {},
            sharedTypes: []
        },
        readmeConfig: undefined,
        sourceConfig: undefined,
        publishConfig: undefined,
        dynamic: undefined,
        selfHosted: undefined,
        audiences: undefined
    } as IntermediateRepresentation;
}

// Mock function to create context
function createMockContext(ir: IntermediateRepresentation): SdkGeneratorContext {
    const mockContext: Partial<SdkGeneratorContext> = {
        ir,
        customConfig: { generateExamples: false },
        config: {
            organization: "test-org",
            workspaceName: "test-workspace"
        },
        generatorNotificationService: {
            sendUpdate: () => {
                // Mock implementation
            },
            sendError: () => {
                // Mock implementation
            }
        },
        logger: {
            debug: () => {
                // Mock implementation
            },
            info: () => {
                // Mock implementation
            },
            warn: () => {
                // Mock implementation
            },
            error: () => {
                // Mock implementation
            }
        },
        project: {
            directory: "/tmp/test",
            packageName: "test-client",
            packageVersion: "0.1.0"
        },
        generatorAgent: {
            getAllTypes: () => [],
            getTypeById: () => undefined
        },
        getClientName: () => "TestClient",
        getApiClientBuilderClientName: () => "TestClient",
        getClientBuilderName: () => "TestClientBuilder",
        getCoreAsIsFiles: () => [],
        getHttpServiceOrThrow: (serviceId: string) => ir.services[serviceId as keyof typeof ir.services],
        getSubpackageOrThrow: (subpackageId: string) => ir.subpackages[subpackageId as keyof typeof ir.subpackages],
        getSubpackagesOrThrow: (packageOrSubpackage: { subpackages: string[] }) => {
            return packageOrSubpackage.subpackages.map((subpackageId: string) => [
                subpackageId,
                ir.subpackages[subpackageId as keyof typeof ir.subpackages]
            ]);
        },
        getDirectoryForFernFilepath: (fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> }) => {
            return fernFilepath.allParts.map((part) => part.snakeCase.safeName).join("/");
        },
        // Add the centralized methods that SubClientGenerator expects
        getUniqueFilenameForSubpackage: (subpackage: {
            fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
        }) => {
            const pathParts = subpackage.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            return `${pathParts.join("_")}.rs`;
        },
        getUniqueClientNameForSubpackage: (subpackage: {
            fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        }) => {
            const pathParts = subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
            return pathParts.join("") + "Client";
        },
        getUniqueFilenameForType: (typeDeclaration: {
            name: {
                fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
                name: { snakeCase: { safeName: string } };
            };
        }) => {
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            const typeName = typeDeclaration.name.name.snakeCase.safeName;
            const fullPath = [...pathParts, typeName];
            return `${fullPath.join("_")}.rs`;
        },
        getModulePathForType: (typeNameSnake: string) => typeNameSnake,
        configManager: {
            get: (key: string, defaultValue?: unknown) => {
                const configs: Record<string, unknown> = {
                    clientName: "TestClient",
                    packageName: "test-client",
                    packageVersion: "0.1.0",
                    extraDependencies: {},
                    extraDevDependencies: {}
                };
                return configs[key] ?? defaultValue;
            },
            getPackageName: () => "test-client",
            getPackageVersion: () => "0.1.0",
            escapeRustKeyword: (name: string) => name,
            escapeRustReservedType: (name: string) => name
        },
        toModelGeneratorContext: () => ({
            ir,
            config: mockContext.config,
            customConfig: {
                packageName: "test-client",
                packageVersion: "0.1.0",
                extraDependencies: {},
                extraDevDependencies: {},
                generateBuilders: false,
                deriveDebug: true,
                deriveClone: true
            },
            generatorNotificationService: mockContext.generatorNotificationService,
            configManager: mockContext.configManager,
            project: mockContext.project
        })
    };
    return mockContext as SdkGeneratorContext;
}

describe("AuthGenerator - Client Generation", () => {
    describe("API Key Authentication", () => {
        it("should generate client with API key authentication support", async () => {
            const authConfig = {
                type: "header",

                name: "X-API-Key",
                valueType: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/api-key-auth-client.rs");
        });
    });

    describe("Bearer Token Authentication", () => {
        it("should generate client with Bearer token authentication support", async () => {
            const authConfig = {
                type: "bearer",
                token: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/bearer-token-auth-client.rs");
        });
    });

    describe("Basic Authentication", () => {
        it("should generate client with Basic authentication support", async () => {
            const authConfig = {
                type: "basic",
                username: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                password: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/basic-auth-client.rs");
        });
    });

    describe("Custom Header Authentication", () => {
        it("should generate client with custom header authentication support", async () => {
            const authConfig = {
                type: "header",
                name: "X-Custom-Auth",
                valueType: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/custom-header-auth-client.rs");
        });
    });

    describe("Multiple Authentication Methods", () => {
        it("should generate client supporting multiple auth methods", async () => {
            const authConfig = {
                type: "or",
                types: [
                    {
                        type: "header",
                        name: "X-API-Key",
                        valueType: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
                    },
                    {
                        type: "bearer",
                        token: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined })
                    }
                ],
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/multiple-auth-methods-client.rs");
        });
    });

    describe("No Authentication", () => {
        it("should generate client without authentication requirements", async () => {
            const authConfig = {
                requiresAuth: false
            };

            const ir = createMockIRWithAuth(authConfig);
            const context = createMockContext(ir);
            const userSubpackage = ir.subpackages.user;
            if (!userSubpackage) {
                throw new Error("User subpackage not found");
            }
            const generator = new SubClientGenerator(context, userSubpackage);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/no-auth-client.rs");
        });
    });
});

describe("AuthGenerator - Root Client Generation", () => {
    describe("Multi-service authentication", () => {
        it("should generate root client that properly handles auth across multiple services", async () => {
            const authConfig = {
                type: "bearer",
                token: FernIr.TypeReference.primitive({ v1: FernIr.PrimitiveTypeV1.String, v2: undefined }),
                requiresAuth: true
            };

            const ir = createMockIRWithAuth(authConfig);
            // Add a second subpackage to trigger root client generation
            ir.rootPackage.subpackages.push("admin");
            ir.subpackages.admin = {
                ...ir.subpackages.user,
                name: {
                    originalName: "admin",
                    camelCase: { unsafeName: "admin", safeName: "admin" },
                    snakeCase: { unsafeName: "admin", safeName: "admin" },
                    screamingSnakeCase: { unsafeName: "ADMIN", safeName: "ADMIN" },
                    pascalCase: { unsafeName: "Admin", safeName: "Admin" }
                },
                fernFilepath: {
                    allParts: [],
                    file: undefined,
                    packagePath: []
                },
                service: "AdminService",
                types: [],
                errors: [],
                subpackages: [],
                hasEndpointsInTree: true,
                navigationConfig: undefined,
                webhooks: undefined,
                websocket: undefined,
                docs: undefined
            };
            ir.services.AdminService = {
                ...ir.services.UserService,
                availability: undefined,
                displayName: undefined,
                basePath: {
                    head: "/admin",
                    parts: []
                },
                endpoints: [],
                headers: [],
                pathParameters: [],
                encoding: undefined,
                transport: undefined,
                name: {
                    fernFilepath: {
                        allParts: [],
                        file: undefined,
                        packagePath: []
                    }
                }
            };

            const context = createMockContext(ir);
            const generator = new RootClientGenerator(context);

            const result = generator.generate();
            await expect(result.fileContents).toMatchFileSnapshot("snapshots/multi-service-auth-root-client.rs");
        });
    });
});
