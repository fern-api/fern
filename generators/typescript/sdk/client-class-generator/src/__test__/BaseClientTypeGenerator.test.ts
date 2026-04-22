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
    return ir;
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
        coreUtilities: {
            runtime: {
                type: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.type")
                },
                version: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.RUNTIME.version")
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
                NoOpAuthProvider: {
                    _getReferenceTo: () => ts.factory.createIdentifier("core.NoOpAuthProvider")
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
}): BaseClientTypeGenerator {
    return new BaseClientTypeGenerator({
        generateIdempotentRequestOptions: opts?.generateIdempotentRequestOptions ?? false,
        ir: opts?.ir ?? createIR(),
        omitFernHeaders: opts?.omitFernHeaders ?? false
    });
}

// ========================== Tests ==========================

describe("BaseClientTypeGenerator", () => {
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
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
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
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
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
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
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
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
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
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
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
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
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

    describe("ANY auth with all scheme types", () => {
        it("imports all auth provider types for ANY requirement", () => {
            const ir = createIR({
                authSchemes: [
                    FernIr.AuthScheme.bearer({
                        key: "bearer",
                        token: casingsGenerator.generateName("token"),
                        tokenEnvVar: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.basic({
                        key: "basic",
                        username: casingsGenerator.generateName("username"),
                        usernameEnvVar: undefined,
                        usernameOmit: undefined,
                        password: casingsGenerator.generateName("password"),
                        passwordEnvVar: undefined,
                        passwordOmit: undefined,
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
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
                        docs: undefined
                    }),
                    FernIr.AuthScheme.header({
                        key: "apiKey",
                        name: createNameAndWireValue("X-API-Key"),
                        prefix: undefined,
                        headerEnvVar: undefined,
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
});
