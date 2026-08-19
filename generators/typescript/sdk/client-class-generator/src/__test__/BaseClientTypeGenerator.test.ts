import { FernIr } from "@fern-fern/ir-sdk";
import { caseConverter, casingsGenerator, createMinimalIR, createNameAndWireValue } from "@fern-typescript/test-utils";
import { StructureKind, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { BaseClientTypeGenerator } from "../BaseClientTypeGenerator.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function createIR(opts?: {
    authSchemes?: FernIr.AuthScheme[];
    authRequirement?: FernIr.AuthSchemesRequirement;
    headers?: FernIr.HttpHeader[];
    pathParameters?: FernIr.PathParameter[];
}): FernIr.IntermediateRepresentation {
    const ir = createMinimalIR();
    if (opts?.authSchemes || opts?.authRequirement) {
        ir.auth = {
            docs: undefined,
            requirement: opts?.authRequirement ?? "ALL",
            schemes: opts?.authSchemes ?? []
        };
    }
    if (opts?.headers) {
        ir.headers = opts.headers;
    }
    if (opts?.pathParameters) {
        ir.pathParameters = opts.pathParameters;
    }
    return ir;
}

function createRootPathParameter(opts: { name: string; clientDefault?: FernIr.Literal }): FernIr.PathParameter {
    return {
        name: casingsGenerator.generateName(opts.name),
        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        location: "ROOT",
        variable: undefined,
        clientDefault: opts.clientDefault,
        v2Examples: undefined,
        explode: undefined,
        docs: undefined
    };
}

function createHeader(opts: {
    wireValue: string;
    camelCase: string;
    valueType?: FernIr.TypeReference;
}): FernIr.HttpHeader {
    return {
        name: {
            name: casingsGenerator.generateName(opts.camelCase),
            wireValue: opts.wireValue
        },
        valueType: opts.valueType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        env: undefined,
        availability: undefined,
        docs: undefined,
        clientDefault: undefined,
        defaultValue: undefined,
        v2Examples: undefined
    };
}

/**
 * Creates a mock FileContext for BaseClientTypeGenerator.writeToFile().
 * Tracks all statements/interfaces/imports added to sourceFile.
 */
function createMockContext(opts?: {
    generateOAuthClients?: boolean;
    npmPackage?: { packageName: string; version: string } | null;
    hasVersion?: boolean;
    defaultVersion?: string | null;
    // biome-ignore lint/suspicious/noExplicitAny: test mock needs to satisfy complex FileContext interface
}): any {
    const statements: string[] = [];
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const interfaces: any[] = [];
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    const importDeclarations: any[] = [];
    const importFromRootCalls: { path: string; namedImports: string[] }[] = [];

    return {
        _captured: { statements, interfaces, importDeclarations, importFromRootCalls },
        generateOAuthClients: opts?.generateOAuthClients ?? false,
        npmPackage:
            opts?.npmPackage === null
                ? undefined
                : (opts?.npmPackage ?? { packageName: "@test/sdk", version: "1.0.0" }),
        sourceFile: {
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addInterface: (iface: any) => {
                interfaces.push(iface);
            },
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addStatements: (code: any) => {
                statements.push(code);
            },
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addImportDeclaration: (decl: any) => {
                importDeclarations.push(decl);
            }
        },
        importsManager: {
            // biome-ignore lint/suspicious/noExplicitAny: test mock
            addImportFromRoot: (path: string, opts: any) => {
                importFromRootCalls.push({
                    path,
                    namedImports:
                        opts.namedImports?.map((n: string | { name: string }) =>
                            typeof n === "string" ? n : n.name
                        ) ?? []
                });
            }
        },
        baseClient: {
            generateBaseClientOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseClientOptions",
                isExported: true,
                properties: [
                    { name: "environment", type: "string", hasQuestionToken: true, docs: undefined },
                    { name: "baseUrl", type: "string", hasQuestionToken: true, docs: undefined },
                    {
                        name: "fetch",
                        type: "FetchFunction",
                        hasQuestionToken: true,
                        docs: ["Custom fetch implementation"]
                    }
                ]
            }),
            generateBaseRequestOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseRequestOptions",
                isExported: true,
                properties: [
                    { name: "timeoutInSeconds", type: "number", hasQuestionToken: true },
                    { name: "maxRetries", type: "number", hasQuestionToken: true }
                ]
            }),
            generateBaseIdempotentRequestOptionsInterface: () => ({
                kind: StructureKind.Interface,
                name: "BaseIdempotentRequestOptions",
                isExported: true,
                properties: [{ name: "idempotencyKey", type: "string", hasQuestionToken: true }]
            })
        },
        environments: {
            getReferenceToEnvironmentsEnum: () => ({
                getExpression: () => ts.factory.createIdentifier("environments.TestEnvironment")
            }),
            getReferenceToEnvironmentUrls: () => ({
                getTypeNode: () => ts.factory.createTypeReferenceNode("environments.TestEnvironmentUrls")
            })
        },
        coreUtilities: {
            runtime: {
                type: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.type")
                },
                version: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.version")
                },
                os: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.os")
                },
                arch: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.arch")
                },
                userAgent: {
                    _invoke: (sdkName: ts.Expression, sdkVersion: ts.Expression) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.getUserAgent"), undefined, [
                            sdkName,
                            sdkVersion
                        ])
                }
            },
            logging: {
                createLogger: {
                    _invoke: (arg: ts.Expression) =>
                        ts.factory.createCallExpression(ts.factory.createIdentifier("core.createLogger"), undefined, [
                            arg
                        ])
                },
                Logger: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.Logger")
                }
            },
            auth: {
                AuthProvider: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.AuthProvider")
                },
                AuthRequest: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.AuthRequest")
                },
                NoOpAuthProvider: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.NoOpAuthProvider")
                },
                isAuthProvider: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.isAuthProvider")
                }
            },
            fetcher: {
                EndpointMetadata: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.EndpointMetadata")
                }
            }
        },
        type: {
            resolveTypeReference: () => ({
                type: "primitive",
                primitive: { v1: "STRING", v2: undefined }
            })
        },
        versionContext: {
            getGeneratedVersion: () => {
                if (!opts?.hasVersion) {
                    return undefined;
                }
                return {
                    getHeader: () => createHeader({ wireValue: "X-API-Version", camelCase: "version" }),
                    getDefaultVersion: () => opts?.defaultVersion ?? null
                };
            }
        },
        case: caseConverter
    };
}

function createGenerator(opts?: {
    generateIdempotentRequestOptions?: boolean;
    ir?: FernIr.IntermediateRepresentation;
    omitFernHeaders?: boolean;
    includePlatformHeaders?: boolean;
    allowUserAgentAppInfo?: boolean;
}): BaseClientTypeGenerator {
    return new BaseClientTypeGenerator({
        generateIdempotentRequestOptions: opts?.generateIdempotentRequestOptions ?? false,
        ir: opts?.ir ?? createIR(),
        omitFernHeaders: opts?.omitFernHeaders ?? false,
        includePlatformHeaders: opts?.includePlatformHeaders ?? false,
        allowUserAgentAppInfo: opts?.allowUserAgentAppInfo ?? false,
        retainOriginalCasing: false,
        parameterNaming: "default",
        caseConverter
    });
}

// ========================== Tests ==========================

describe("BaseClientTypeGenerator", () => {
    describe("root path parameter clientDefault substitution", () => {
        it("does not emit substitution when no root path params have clientDefault", () => {
            const ir = createIR({
                pathParameters: [createRootPathParameter({ name: "apiVersion" })]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunction = context._captured.statements.find((s: string) =>
                s.includes("export function normalizeClientOptions")
            );
            expect(normalizeFunction).toBeDefined();
            expect(normalizeFunction).not.toContain("apiVersion:");
        });

        it('emits `apiVersion: options?.apiVersion ?? "v1beta"` when clientDefault is set', () => {
            const ir = createIR({
                pathParameters: [
                    createRootPathParameter({
                        name: "apiVersion",
                        clientDefault: FernIr.Literal.string("v1beta")
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunction = context._captured.statements.find((s: string) =>
                s.includes("export function normalizeClientOptions")
            );
            expect(normalizeFunction).toBeDefined();
            expect(normalizeFunction).toContain('apiVersion: options?.apiVersion ?? "v1beta"');
        });

        it("skips non-ROOT path parameters even when clientDefault is set", () => {
            const ir = createIR({
                pathParameters: [
                    {
                        ...createRootPathParameter({
                            name: "userId",
                            clientDefault: FernIr.Literal.string("me")
                        }),
                        location: "ENDPOINT"
                    }
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunction = context._captured.statements.find((s: string) =>
                s.includes("export function normalizeClientOptions")
            );
            expect(normalizeFunction).toBeDefined();
            expect(normalizeFunction).not.toContain("userId:");
        });
    });

    describe("OPTIONS_PARAMETER_NAME", () => {
        it("is 'options'", () => {
            expect(BaseClientTypeGenerator.OPTIONS_PARAMETER_NAME).toBe("options");
        });
    });

    describe("writeToFile", () => {
        it("generates base types without auth and without idempotent options", () => {
            const gen = createGenerator();
            const context = createMockContext();
            gen.writeToFile(context);

            // Should add interface for BaseClientOptions (no auth schemes → plain interface)
            expect(context._captured.interfaces.length).toBe(2); // BaseClientOptions + BaseRequestOptions
            expect(context._captured.interfaces[0].name).toBe("BaseClientOptions");
            expect(context._captured.interfaces[1].name).toBe("BaseRequestOptions");

            // Should have statements for NormalizedClientOptions and normalizeClientOptions
            expect(context._captured.statements.length).toBeGreaterThanOrEqual(2);

            // No auth import
            expect(
                context._captured.importFromRootCalls.find((c: { path: string }) => c.path === "core/auth")
            ).toBeUndefined();
        });

        it("generates idempotent request options when enabled", () => {
            const gen = createGenerator({ generateIdempotentRequestOptions: true });
            const context = createMockContext();
            gen.writeToFile(context);

            // Should have 3 interfaces: BaseClientOptions, BaseRequestOptions, BaseIdempotentRequestOptions
            expect(context._captured.interfaces.length).toBe(3);
            expect(context._captured.interfaces[2].name).toBe("BaseIdempotentRequestOptions");
        });

        it("imports AuthProvider when auth schemes exist", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authImport = context._captured.importFromRootCalls.find(
                (c: { path: string }) => c.path === "core/auth"
            );
            expect(authImport).toBeDefined();
            expect(authImport.namedImports).toContain("AuthProvider");
        });

        it("generates auth type intersection for bearer auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            // BaseClientOptions should be a type (with auth intersection), not an interface
            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toBeDefined();
            expect(baseClientStatement).toContain("BearerAuthProvider.AuthOptions");
        });

        it("generates auth type for basic auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("BasicAuthProvider.AuthOptions");
        });

        it("generates auth type for header auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("HeaderAuthProvider.AuthOptions");
        });

        it("generates auth type for oauth when generateOAuthClients is true", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.oauth({
                        key: "oauth",
                        configuration: FernIr.OAuthConfiguration.clientCredentials({
                            clientIdEnvVar: undefined,
                            clientSecretEnvVar: undefined,
                            tokenPrefix: undefined,
                            tokenHeader: undefined,
                            scopes: undefined,
                            tokenEndpoint: {
                                endpointReference: {
                                    endpointId: "getToken",
                                    serviceId: "auth",
                                    subpackageId: undefined
                                },
                                requestProperties: {
                                    clientId: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientId"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    clientSecret: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientSecret"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    scopes: undefined,
                                    customProperties: undefined
                                },
                                responseProperties: {
                                    accessToken: {
                                        propertyPath: undefined,
                                        property: {
                                            name: createNameAndWireValue("accessToken"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        }
                                    },
                                    expiresIn: undefined,
                                    refreshToken: undefined
                                }
                            },
                            refreshEndpoint: undefined
                        }),
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext({ generateOAuthClients: true });
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("OAuthAuthProvider.AuthOptions");
        });

        it("skips oauth auth type when generateOAuthClients is false", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.oauth({
                        key: "oauth",
                        configuration: FernIr.OAuthConfiguration.clientCredentials({
                            clientIdEnvVar: undefined,
                            clientSecretEnvVar: undefined,
                            tokenPrefix: undefined,
                            tokenHeader: undefined,
                            scopes: undefined,
                            tokenEndpoint: {
                                endpointReference: {
                                    endpointId: "getToken",
                                    serviceId: "auth",
                                    subpackageId: undefined
                                },
                                requestProperties: {
                                    clientId: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientId"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    clientSecret: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientSecret"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    scopes: undefined,
                                    customProperties: undefined
                                },
                                responseProperties: {
                                    accessToken: {
                                        propertyPath: undefined,
                                        property: {
                                            name: createNameAndWireValue("accessToken"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        }
                                    },
                                    expiresIn: undefined,
                                    refreshToken: undefined
                                }
                            },
                            refreshEndpoint: undefined
                        }),
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext({ generateOAuthClients: false });
            gen.writeToFile(context);

            // No auth type intersection since oauth was skipped
            expect(
                context._captured.interfaces.find((i: { name: string }) => i.name === "BaseClientOptions")
            ).toBeDefined();
        });

        it("generates auth type for inferred auth", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.inferred({
                        key: "inferred",
                        tokenEndpoint: {
                            endpoint: {
                                endpointId: "getToken",
                                serviceId: "auth",
                                subpackageId: undefined
                            },
                            expiryProperty: undefined,
                            authenticatedRequestHeaders: []
                        },
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("InferredAuthProvider.AuthOptions");
        });

        it("generates AnyAuthProvider type for ANY auth requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ANY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("AnyAuthProvider.AuthOptions");
            expect(baseClientStatement).toContain("BearerAuthProvider.AuthOptions");
            expect(baseClientStatement).toContain("HeaderAuthProvider.AuthOptions");
        });

        it("generates RoutingAuthProvider type for ENDPOINT_SECURITY auth requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ENDPOINT_SECURITY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const baseClientStatement = context._captured.statements.find((s: string) =>
                s.includes("BaseClientOptions")
            );
            expect(baseClientStatement).toContain("RoutingAuthProvider.AuthOptions");
        });
    });

    describe("normalizeClientOptions function", () => {
        it("includes fern headers when omitFernHeaders is false", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.language = "X-Fern-Language";
            ir.sdkConfig.platformHeaders.sdkName = "X-Fern-SDK-Name";
            ir.sdkConfig.platformHeaders.sdkVersion = "X-Fern-SDK-Version";
            const gen = createGenerator({ omitFernHeaders: false, ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toBeDefined();
            expect(normalizeFunc).toContain("X-Fern-Language");
            expect(normalizeFunc).toContain("JavaScript");
            expect(normalizeFunc).toContain("mergeHeaders");
        });

        it("includes SDK name/version headers when npmPackage is set", () => {
            const gen = createGenerator({ omitFernHeaders: false });
            const context = createMockContext({ npmPackage: { packageName: "@acme/sdk", version: "2.0.0" } });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("@acme/sdk");
            expect(normalizeFunc).toContain("2.0.0");
        });

        it("emits a bare User-Agent + discrete runtime headers by default (includePlatformHeaders false)", () => {
            const gen = createGenerator({ omitFernHeaders: false });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toBeDefined();
            // Default output is unchanged: bare User-Agent + discrete runtime headers,
            // and no structured User-Agent / platform header.
            expect(normalizeFunc).toContain('"@test/sdk/1.0.0"');
            expect(normalizeFunc).toContain("X-Fern-Runtime");
            expect(normalizeFunc).not.toContain("core.getUserAgent");
            expect(normalizeFunc).not.toContain("X-Fern-Platform");
        });

        it("emits a structured User-Agent and drops discrete runtime headers when includePlatformHeaders is true", () => {
            const gen = createGenerator({ omitFernHeaders: false, includePlatformHeaders: true });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            // The rich User-Agent consolidates the platform + runtime information.
            expect(normalizeFunc).toContain("core.getUserAgent");
            expect(normalizeFunc).toContain('"@test/sdk"');
            expect(normalizeFunc).toContain("User-Agent");
            expect(normalizeFunc).not.toContain("X-Fern-Runtime");
            expect(normalizeFunc).not.toContain("X-Fern-Platform");
        });

        it("structured User-Agent supersedes the IR default userAgent when includePlatformHeaders is true", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "@test/sdk/1.0.0"
            };
            const gen = createGenerator({ omitFernHeaders: false, includePlatformHeaders: true, ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            // The rich User-Agent wins over the auto-populated `{package}/{version}` value.
            expect(normalizeFunc).toContain("core.getUserAgent");
            expect(normalizeFunc).not.toContain('"@test/sdk/1.0.0"');
            expect(normalizeFunc).not.toContain("X-Fern-Runtime");
        });

        it("uses the configured user-agent template over the package name when includePlatformHeaders is true", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "acme-sdk-internal/1.0.0"
            };
            const gen = createGenerator({ omitFernHeaders: false, includePlatformHeaders: true, ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("core.getUserAgent");
            expect(normalizeFunc).toContain('"acme-sdk-internal"');
            expect(normalizeFunc).toContain('"1.0.0"');
            expect(normalizeFunc).not.toContain('core.getUserAgent("@test/sdk"');
        });

        it("falls back to the plain user-agent value when it has no version segment", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "acme-sdk-internal"
            };
            const gen = createGenerator({ omitFernHeaders: false, includePlatformHeaders: true, ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).not.toContain("core.getUserAgent");
            expect(normalizeFunc).toContain('"acme-sdk-internal"');
        });

        it("does not treat a trailing name segment as a version", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "acme/sdk-python"
            };
            const gen = createGenerator({ omitFernHeaders: false, includePlatformHeaders: true, ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).not.toContain("core.getUserAgent");
            expect(normalizeFunc).toContain('"acme/sdk-python"');
        });

        it("omits all fern headers when omitFernHeaders is true even if includePlatformHeaders is true", () => {
            const gen = createGenerator({ omitFernHeaders: true, includePlatformHeaders: true });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).not.toContain("core.getUserAgent");
            expect(normalizeFunc).not.toContain("X-Fern-Platform");
            expect(normalizeFunc).not.toContain("X-Fern-Runtime");
        });

        it("omits fern headers when omitFernHeaders is true", () => {
            const gen = createGenerator({ omitFernHeaders: true });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toBeDefined();
            // Should not contain fern-specific headers
            expect(normalizeFunc).not.toContain("X-Fern-Language");
        });

        it("includes mergeHeaders import when there are root headers", () => {
            const ir = createIR({
                headers: [createHeader({ wireValue: "X-Custom-Header", camelCase: "customHeader" })]
            });
            const gen = createGenerator({ ir, omitFernHeaders: true });
            const context = createMockContext();
            gen.writeToFile(context);

            const mergeHeadersImport = context._captured.importFromRootCalls.find(
                (c: { path: string; namedImports: string[] }) =>
                    c.path === "core/headers" && c.namedImports.includes("mergeHeaders")
            );
            expect(mergeHeadersImport).toBeDefined();
        });

        it("includes root headers in normalizeClientOptions", () => {
            const ir = createIR({
                headers: [createHeader({ wireValue: "X-Custom-Header", camelCase: "customHeader" })]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("X-Custom-Header");
        });

        it("filters out authorization headers from root headers", () => {
            const ir = createIR({
                headers: [
                    createHeader({ wireValue: "Authorization", camelCase: "authorization" }),
                    createHeader({ wireValue: "X-Custom-Header", camelCase: "customHeader" })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("X-Custom-Header");
            // Authorization header should be filtered out
            expect(normalizeFunc).not.toContain('"Authorization"');
        });

        it("does not include npmPackage headers when npmPackage is undefined", () => {
            const gen = createGenerator({ omitFernHeaders: false });
            const context = createMockContext({ npmPackage: null });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).not.toContain("@test/sdk");
        });
    });

    describe("normalizeClientOptionsWithAuth function", () => {
        it("generates bearer auth provider creation for ALL requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toBeDefined();
            expect(authFunc).toContain("new BearerAuthProvider");
            // Should import BearerAuthProvider
            const importDecl = context._captured.importDeclarations.find((d: { namedImports: string[] }) =>
                d.namedImports.includes("BearerAuthProvider")
            );
            expect(importDecl).toBeDefined();
        });

        it("generates basic auth provider creation for ALL requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ALL"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("new BasicAuthProvider");
        });

        it("generates header auth provider creation for ALL requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ALL"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("new HeaderAuthProvider");
        });

        it("generates inferred auth provider creation for ALL requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.inferred({
                        key: "inferred",
                        tokenEndpoint: {
                            endpoint: {
                                endpointId: "getToken",
                                serviceId: "auth",
                                subpackageId: undefined
                            },
                            expiryProperty: undefined,
                            authenticatedRequestHeaders: []
                        },
                        docs: undefined
                    })
                ],
                authRequirement: "ALL"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("new InferredAuthProvider");
        });

        it("generates oauth auth provider creation for ALL requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.oauth({
                        key: "oauth",
                        configuration: FernIr.OAuthConfiguration.clientCredentials({
                            clientIdEnvVar: undefined,
                            clientSecretEnvVar: undefined,
                            tokenPrefix: undefined,
                            tokenHeader: undefined,
                            scopes: undefined,
                            tokenEndpoint: {
                                endpointReference: {
                                    endpointId: "getToken",
                                    serviceId: "auth",
                                    subpackageId: undefined
                                },
                                requestProperties: {
                                    clientId: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientId"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    clientSecret: {
                                        propertyPath: undefined,
                                        property: FernIr.RequestPropertyValue.body({
                                            name: createNameAndWireValue("clientSecret"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        })
                                    },
                                    scopes: undefined,
                                    customProperties: undefined
                                },
                                responseProperties: {
                                    accessToken: {
                                        propertyPath: undefined,
                                        property: {
                                            name: createNameAndWireValue("accessToken"),
                                            valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                                            availability: undefined,
                                            docs: undefined,
                                            propertyAccess: undefined,
                                            defaultValue: undefined,
                                            v2Examples: undefined
                                        }
                                    },
                                    expiresIn: undefined,
                                    refreshToken: undefined
                                }
                            },
                            refreshEndpoint: undefined
                        }),
                        docs: undefined
                    })
                ],
                authRequirement: "ALL"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("OAuthAuthProvider.createInstance");
        });

        it("generates AnyAuthProvider.createInstance for ANY requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    })
                ],
                authRequirement: "ANY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("AnyAuthProvider.createInstance");
            expect(authFunc).toContain("BearerAuthProvider, HeaderAuthProvider");

            // Should import AnyAuthProvider
            const anyImport = context._captured.importDeclarations.find((d: { namedImports: string[] }) =>
                d.namedImports.includes("AnyAuthProvider")
            );
            expect(anyImport).toBeDefined();
        });

        it("generates RoutingAuthProvider.createInstance for ENDPOINT_SECURITY requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    })
                ],
                authRequirement: "ENDPOINT_SECURITY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toContain("RoutingAuthProvider.createInstance");
            expect(authFunc).toContain("BearerAuthProvider, BasicAuthProvider");

            // Should import RoutingAuthProvider
            const routingImport = context._captured.importDeclarations.find((d: { namedImports: string[] }) =>
                d.namedImports.includes("RoutingAuthProvider")
            );
            expect(routingImport).toBeDefined();
        });

        it("does not generate normalizeClientOptionsWithAuth when no auth", () => {
            const gen = createGenerator();
            const context = createMockContext();
            gen.writeToFile(context);

            const authFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptionsWithAuth")
            );
            expect(authFunc).toBeUndefined();
        });
    });

    describe("NormalizedClientOptions types", () => {
        it("generates NormalizedClientOptions without authProvider when no auth", () => {
            const gen = createGenerator();
            const context = createMockContext();
            gen.writeToFile(context);

            const typesStatement = context._captured.statements.find((s: string) =>
                s.includes("NormalizedClientOptions")
            );
            expect(typesStatement).toBeDefined();
            expect(typesStatement).toContain("logging:");
            expect(typesStatement).not.toContain("authProvider");
        });

        it("generates NormalizedClientOptions with authProvider when auth exists", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const typesStatement = context._captured.statements.find((s: string) =>
                s.includes("NormalizedClientOptionsWithAuth")
            );
            expect(typesStatement).toBeDefined();
            expect(typesStatement).toContain("authProvider");
        });
    });

    describe("version header", () => {
        it("includes version header with default version", () => {
            const ir = createIR();
            const gen = createGenerator({ ir });
            const context = createMockContext({ hasVersion: true, defaultVersion: "2024-01-01" });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("X-API-Version");
            expect(normalizeFunc).toContain("2024-01-01");
        });

        it("includes version header without default version", () => {
            const ir = createIR();
            const gen = createGenerator({ ir });
            const context = createMockContext({ hasVersion: true, defaultVersion: null });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("X-API-Version");
        });
    });

    describe("literal headers", () => {
        it("handles boolean literal header value", () => {
            const ir = createIR({
                headers: [
                    createHeader({
                        wireValue: "X-Boolean-Flag",
                        camelCase: "booleanFlag",
                        valueType: FernIr.TypeReference.container(
                            FernIr.ContainerType.literal(FernIr.Literal.boolean(true))
                        )
                    })
                ]
            });
            const gen = createGenerator({ ir });
            // Mock context that resolves the literal type
            const context = createMockContext();
            context.type.resolveTypeReference = () => ({
                type: "container",
                container: {
                    type: "literal",
                    literal: { type: "boolean", boolean: true }
                }
            });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("toString");
        });

        it("handles string literal header value", () => {
            const ir = createIR({
                headers: [
                    createHeader({
                        wireValue: "X-String-Literal",
                        camelCase: "stringLiteral",
                        valueType: FernIr.TypeReference.container(
                            FernIr.ContainerType.literal(FernIr.Literal.string("fixed-value"))
                        )
                    })
                ]
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            context.type.resolveTypeReference = () => ({
                type: "container",
                container: {
                    type: "literal",
                    literal: { type: "string", string: "fixed-value" }
                }
            });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("fixed-value");
        });
    });

    describe("userAgent header", () => {
        it("includes custom userAgent header when configured in IR", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "my-sdk/1.0"
            };
            const gen = createGenerator({ ir, omitFernHeaders: false });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("User-Agent");
            expect(normalizeFunc).toContain("my-sdk/1.0");
        });

        it("falls back to User-Agent with package name when no custom userAgent", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = undefined;
            const gen = createGenerator({ ir, omitFernHeaders: false });
            const context = createMockContext({ npmPackage: { packageName: "@acme/sdk", version: "2.0.0" } });
            gen.writeToFile(context);

            const normalizeFunc = context._captured.statements.find((s: string) =>
                s.includes("normalizeClientOptions")
            );
            expect(normalizeFunc).toContain("User-Agent");
            expect(normalizeFunc).toContain("@acme/sdk/2.0.0");
        });
    });

    describe("allowUserAgentAppInfo", () => {
        const HELPER_NAME = "appendAppInfoToUserAgent";

        function getNormalizeFunc(context: ReturnType<typeof createMockContext>): string {
            return context._captured.statements.find((s: string) => s.includes("normalizeClientOptions"));
        }

        function getHelper(context: ReturnType<typeof createMockContext>): string | undefined {
            return context._captured.statements.find((s: string) => s.includes(`function ${HELPER_NAME}(`));
        }

        it("emits no appInfo references and no helper when the flag is off (byte-identical default)", () => {
            const gen = createGenerator({ omitFernHeaders: false, allowUserAgentAppInfo: false });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = getNormalizeFunc(context);
            expect(normalizeFunc).toBeDefined();
            expect(normalizeFunc).not.toContain("appInfo");
            expect(normalizeFunc).not.toContain(HELPER_NAME);
            expect(getHelper(context)).toBeUndefined();
        });

        it("wraps the getUserAgent branch with the append helper when includePlatformHeaders is true", () => {
            const gen = createGenerator({
                omitFernHeaders: false,
                includePlatformHeaders: true,
                allowUserAgentAppInfo: true
            });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = getNormalizeFunc(context);
            expect(normalizeFunc).toContain(`${HELPER_NAME}(core.getUserAgent(`);
            expect(normalizeFunc).toContain("options?.appInfo");
            // Helper is emitted exactly once, into this file.
            expect(getHelper(context)).toBeDefined();
        });

        it("wraps the default `{package}/{version}` branch when includePlatformHeaders is false", () => {
            const gen = createGenerator({
                omitFernHeaders: false,
                includePlatformHeaders: false,
                allowUserAgentAppInfo: true
            });
            const context = createMockContext({ npmPackage: { packageName: "@acme/sdk", version: "2.0.0" } });
            gen.writeToFile(context);

            const normalizeFunc = getNormalizeFunc(context);
            expect(normalizeFunc).toContain(`${HELPER_NAME}("@acme/sdk/2.0.0", options?.appInfo)`);
            expect(getHelper(context)).toBeDefined();
        });

        it("wraps the IR `user-agent` template branch", () => {
            const ir = createIR();
            ir.sdkConfig.platformHeaders.userAgent = {
                header: "User-Agent",
                value: "my-sdk/1.0"
            };
            const gen = createGenerator({
                omitFernHeaders: false,
                includePlatformHeaders: false,
                allowUserAgentAppInfo: true,
                ir
            });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = getNormalizeFunc(context);
            expect(normalizeFunc).toContain(`${HELPER_NAME}("my-sdk/1.0", options?.appInfo)`);
            expect(getHelper(context)).toBeDefined();
        });

        it("does not emit the helper when omitFernHeaders suppresses the User-Agent even with the flag on", () => {
            const gen = createGenerator({
                omitFernHeaders: true,
                includePlatformHeaders: true,
                allowUserAgentAppInfo: true
            });
            const context = createMockContext();
            gen.writeToFile(context);

            const normalizeFunc = getNormalizeFunc(context);
            expect(normalizeFunc).not.toContain(HELPER_NAME);
            expect(getHelper(context)).toBeUndefined();
        });

        it("emits a self-contained, sanitizing helper (token/comment encoders, blank handling)", () => {
            const gen = createGenerator({
                omitFernHeaders: false,
                includePlatformHeaders: false,
                allowUserAgentAppInfo: true
            });
            const context = createMockContext();
            gen.writeToFile(context);

            const helper = getHelper(context);
            expect(helper).toBeDefined();
            // Sanitizes name/version to RFC 7230 tchar, and comment delimiters/control chars.
            expect(helper).toContain("percentEncodeChar");
            expect(helper).toContain("encodeToken");
            expect(helper).toContain("encodeComment");
            // Blank/absent handling (no literal `undefined` or empty parens).
            expect(helper).toContain("if (name.length === 0)");
            expect(helper).toContain("if (appInfo == null)");
        });
    });

    describe("ANY auth with all scheme types", () => {
        it("imports all auth provider types for ANY requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        usernamePlaceholder: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        passwordPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    }),
                    FernIr.AuthScheme.inferred({
                        key: "inferred",
                        tokenEndpoint: {
                            endpoint: {
                                endpointId: "getToken",
                                serviceId: "auth",
                                subpackageId: undefined
                            },
                            expiryProperty: undefined,
                            authenticatedRequestHeaders: []
                        },
                        docs: undefined
                    })
                ],
                authRequirement: "ANY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            // Should import all provider types
            const importedNames = context._captured.importDeclarations
                .map((d: { namedImports: string[] }) => d.namedImports)
                .flat();
            expect(importedNames).toContain("AnyAuthProvider");
            expect(importedNames).toContain("BearerAuthProvider");
            expect(importedNames).toContain("BasicAuthProvider");
            expect(importedNames).toContain("HeaderAuthProvider");
            expect(importedNames).toContain("InferredAuthProvider");
        });
    });

    describe("ENDPOINT_SECURITY auth with all scheme types", () => {
        it("imports all auth provider types for ENDPOINT_SECURITY requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        tokenPlaceholder: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
                        headerPlaceholder: undefined,
                        valueType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                        docs: undefined
                    }),
                    FernIr.AuthScheme.inferred({
                        key: "inferred",
                        tokenEndpoint: {
                            endpoint: {
                                endpointId: "getToken",
                                serviceId: "auth",
                                subpackageId: undefined
                            },
                            expiryProperty: undefined,
                            authenticatedRequestHeaders: []
                        },
                        docs: undefined
                    })
                ],
                authRequirement: "ENDPOINT_SECURITY"
            });
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);

            const importedNames = context._captured.importDeclarations
                .map((d: { namedImports: string[] }) => d.namedImports)
                .flat();
            expect(importedNames).toContain("RoutingAuthProvider");
            expect(importedNames).toContain("BearerAuthProvider");
            expect(importedNames).toContain("HeaderAuthProvider");
            expect(importedNames).toContain("InferredAuthProvider");
        });
    });

    describe("server URL variables (region/edge routing)", () => {
        function createServerVariable(opts: {
            id: string;
            name: string;
            default?: string;
            values?: string[];
        }): FernIr.ServerVariable {
            return {
                id: opts.id,
                name: casingsGenerator.generateName(opts.name),
                default: opts.default,
                values: opts.values
            };
        }

        function createMultipleBaseUrlsIR(): FernIr.IntermediateRepresentation {
            const region = createServerVariable({
                id: "region",
                name: "region",
                default: "us-east-1",
                values: ["us-east-1", "us-west-2", "eu-west-1"]
            });
            // "environment" collides with the reserved BaseClientOptions.environment option
            const environment = createServerVariable({
                id: "environment",
                name: "environment",
                default: "prod",
                values: ["prod", "staging", "dev"]
            });
            const ir = createIR();
            ir.environments = {
                defaultEnvironment: "RegionalApiServer",
                environments: FernIr.Environments.multipleBaseUrls({
                    baseUrls: [
                        { id: "base", name: casingsGenerator.generateName("base") },
                        { id: "auth", name: casingsGenerator.generateName("auth") }
                    ],
                    environments: [
                        {
                            id: "RegionalApiServer",
                            name: casingsGenerator.generateName("Regional API Server"),
                            urls: {
                                base: "https://api.example.com/v1",
                                auth: "https://auth.example.com"
                            },
                            urlTemplates: {
                                base: "https://api.{region}.{environment}.example.com/v1",
                                auth: "https://auth.{region}.example.com"
                            },
                            urlVariables: {
                                base: [region, environment],
                                auth: [region]
                            },
                            audiences: undefined,
                            defaultUrls: undefined,
                            docs: undefined
                        }
                    ]
                })
            };
            return ir;
        }

        function createSingleBaseUrlIR(): FernIr.IntermediateRepresentation {
            const region = createServerVariable({
                id: "region",
                name: "region",
                default: "us-east-1",
                values: ["us-east-1", "eu-west-1"]
            });
            const ir = createIR();
            ir.environments = {
                defaultEnvironment: "Default",
                environments: FernIr.Environments.singleBaseUrl({
                    environments: [
                        {
                            id: "Default",
                            name: casingsGenerator.generateName("Default"),
                            url: "https://api.example.com",
                            urlTemplate: "https://api.{region}.example.com",
                            urlVariables: [region],
                            audiences: undefined,
                            defaultUrl: undefined,
                            docs: undefined
                        }
                    ]
                })
            };
            return ir;
        }

        function getNormalizeFunction(ir: FernIr.IntermediateRepresentation): string {
            const gen = createGenerator({ ir });
            const context = createMockContext();
            gen.writeToFile(context);
            const normalizeFunction = context._captured.statements.find((s: string) =>
                s.includes("export function normalizeClientOptions")
            );
            if (normalizeFunction == null) {
                throw new Error("normalizeClientOptions function was not generated");
            }
            return normalizeFunction;
        }

        it("does not emit interpolation when the IR has no environments config", () => {
            const normalizeFunction = getNormalizeFunction(createIR());
            expect(normalizeFunction).not.toContain("_region");
        });

        it("interpolates server variables into multiple base URLs", () => {
            const normalizeFunction = getNormalizeFunction(createMultipleBaseUrlsIR());
            // Both server variables gate the interpolation
            expect(normalizeFunction).toContain("options?.region != null");
            expect(normalizeFunction).toContain("options?.serverUrlEnvironment != null");
            // Local declarations fall back to the variable defaults
            expect(normalizeFunction).toContain('const _region = options?.region ?? "us-east-1"');
            expect(normalizeFunction).toContain(
                'const _serverUrlEnvironment = options?.serverUrlEnvironment ?? "prod"'
            );
            // Each base URL is rebuilt from its template
            expect(normalizeFunction).toContain(
                "base: `https://api.${_region}.${_serverUrlEnvironment}.example.com/v1`"
            );
            expect(normalizeFunction).toContain("auth: `https://auth.${_region}.example.com`");
            // The selected environment's templates are used; custom environments are untouched
            expect(normalizeFunction).toContain("environments.TestEnvironment.RegionalApiServer");
            expect(normalizeFunction).toContain("environment = _environmentUrls.get(environment) ?? environment;");
            expect(normalizeFunction).toContain("if (environment == null) {");
        });

        it("interpolates server variables into a single base URL", () => {
            const normalizeFunction = getNormalizeFunction(createSingleBaseUrlIR());
            expect(normalizeFunction).toContain("options?.region != null");
            expect(normalizeFunction).toContain('const _region = options?.region ?? "us-east-1"');
            // The selected environment's template is used; an explicit baseUrl is not overridden
            expect(normalizeFunction).toContain("if (baseUrl == null) {");
            expect(normalizeFunction).toContain(
                "[environments.TestEnvironment.Default, `https://api.${_region}.example.com`]"
            );
            expect(normalizeFunction).toContain(
                "baseUrl = _environmentUrls.get(options?.environment) ?? `https://api.${_region}.example.com`;"
            );
        });
    });
});
