import { describe, expect, it, vi } from "vitest";
import type { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { extractAuthProperties } from "../authPropertyUtils.js";

interface MockContextOverrides {
    schemes?: Record<string, unknown>[];
    headers?: Record<string, unknown>[];
    isAuthMandatory?: boolean;
    oauth?: Record<string, unknown>;
    inferredAuth?: Record<string, unknown>;
    csharpTypeMapper?: Record<string, unknown>;
    getHttpService?: ReturnType<typeof vi.fn>;
    resolveEndpoint?: ReturnType<typeof vi.fn>;
    generateOauthClients?: boolean;
}

/**
 * Creates a minimal mock of SdkGeneratorContext with just the properties
 * needed by extractAuthProperties. This avoids constructing the full
 * context (which requires IR, config, formatters, etc.).
 */
function createMockContext(overrides: MockContextOverrides): SdkGeneratorContext {
    return {
        ir: {
            auth: {
                schemes: overrides.schemes ?? []
            },
            headers: overrides.headers ?? [],
            sdkConfig: {
                isAuthMandatory: overrides.isAuthMandatory ?? false
            }
        },
        getOauth: vi.fn().mockReturnValue(overrides.oauth ?? undefined),
        getInferredAuth: vi.fn().mockReturnValue(overrides.inferredAuth ?? undefined),
        csharpTypeMapper: overrides.csharpTypeMapper ?? {
            convert: vi.fn().mockReturnValue({ isOptional: false })
        },
        getHttpService: overrides.getHttpService ?? vi.fn().mockReturnValue(undefined),
        resolveEndpoint: overrides.resolveEndpoint ?? vi.fn().mockReturnValue(undefined),
        config: {
            generateOauthClients: overrides.generateOauthClients ?? true
        }
    } as unknown as SdkGeneratorContext;
}

/** Helper to create a Name object with camelCase/pascalCase/screamingSnakeCase variants */
function makeName(camel: string, pascal: string): Record<string, Record<string, string>> {
    return {
        camelCase: { safeName: camel, unsafeName: camel },
        pascalCase: { safeName: pascal, unsafeName: pascal },
        screamingSnakeCase: { safeName: camel.toUpperCase(), unsafeName: camel.toUpperCase() }
    };
}

describe("authPropertyUtils", () => {
    describe("extractAuthProperties", () => {
        it("returns empty array when no auth schemes or headers", () => {
            const ctx = createMockContext({});
            const result = extractAuthProperties(ctx);
            expect(result).toEqual([]);
        });

        describe("header auth scheme", () => {
            it("extracts header auth property with correct name and docs", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: "Your API key",
                            headerEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    name: "apiKey",
                    pascalName: "ApiKey",
                    docs: "Your API key",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("uses default docs when scheme.docs is undefined", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: undefined,
                            headerEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.docs).toBe("The apiKey to use for authentication.");
            });

            it("sets hasEnvironmentVariable when headerEnvVar is present", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: undefined,
                            headerEnvVar: "MY_API_KEY"
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.hasEnvironmentVariable).toBe(true);
            });

            it("mirrors isAuthMandatory as isOptional (pre-existing inversion)", () => {
                const ctx = createMockContext({
                    isAuthMandatory: true,
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: undefined,
                            headerEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                // isAuthMandatory=true => isOptional=true (intentional inversion for consistency)
                expect(result[0]?.isOptional).toBe(true);
            });
        });

        describe("bearer auth scheme", () => {
            it("extracts bearer token property", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "bearer",
                            token: makeName("token", "Token"),
                            docs: "Bearer token",
                            tokenEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    name: "token",
                    pascalName: "Token",
                    docs: "Bearer token",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("sets hasEnvironmentVariable when tokenEnvVar is present", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "bearer",
                            token: makeName("token", "Token"),
                            docs: undefined,
                            tokenEnvVar: "MY_TOKEN"
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.hasEnvironmentVariable).toBe(true);
            });
        });

        describe("basic auth scheme", () => {
            it("extracts username and password properties", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "basic",
                            username: makeName("username", "Username"),
                            password: makeName("password", "Password"),
                            usernameEnvVar: null,
                            passwordEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(2);
                expect(result[0]).toEqual({
                    name: "username",
                    pascalName: "Username",
                    docs: "The username to use for authentication.",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
                expect(result[1]).toEqual({
                    name: "password",
                    pascalName: "Password",
                    docs: "The password to use for authentication.",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("tracks environment variables independently for username and password", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "basic",
                            username: makeName("username", "Username"),
                            password: makeName("password", "Password"),
                            usernameEnvVar: "MY_USER",
                            passwordEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.hasEnvironmentVariable).toBe(true);
                expect(result[1]?.hasEnvironmentVariable).toBe(false);
            });
        });

        describe("oauth auth scheme", () => {
            it("extracts clientId and clientSecret for oauth", () => {
                const oauthScheme = {
                    type: "oauth" as const,
                    configuration: {
                        clientIdEnvVar: null,
                        clientSecretEnvVar: null,
                        tokenEndpoint: {
                            requestProperties: {
                                customProperties: [],
                                scopes: undefined
                            }
                        }
                    }
                };
                const ctx = createMockContext({
                    schemes: [oauthScheme],
                    oauth: oauthScheme
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(2);
                expect(result[0]).toEqual({
                    name: "clientId",
                    pascalName: "ClientId",
                    docs: "The client ID for OAuth authentication.",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
                expect(result[1]).toEqual({
                    name: "clientSecret",
                    pascalName: "ClientSecret",
                    docs: "The client secret for OAuth authentication.",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("tracks env vars for clientId and clientSecret", () => {
                const oauthScheme = {
                    type: "oauth" as const,
                    configuration: {
                        clientIdEnvVar: "OAUTH_CLIENT_ID",
                        clientSecretEnvVar: "OAUTH_CLIENT_SECRET",
                        tokenEndpoint: {
                            requestProperties: {
                                customProperties: [],
                                scopes: undefined
                            }
                        }
                    }
                };
                const ctx = createMockContext({
                    schemes: [oauthScheme],
                    oauth: oauthScheme
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.hasEnvironmentVariable).toBe(true);
                expect(result[1]?.hasEnvironmentVariable).toBe(true);
            });

            it("returns empty when getOauth() returns undefined", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "oauth",
                            configuration: {}
                        }
                    ],
                    oauth: undefined
                });
                const result = extractAuthProperties(ctx);
                expect(result).toEqual([]);
            });

            it("includes non-literal, non-optional custom properties", () => {
                const oauthScheme = {
                    type: "oauth" as const,
                    configuration: {
                        clientIdEnvVar: null,
                        clientSecretEnvVar: null,
                        tokenEndpoint: {
                            requestProperties: {
                                customProperties: [
                                    {
                                        property: {
                                            name: { name: makeName("audience", "Audience") },
                                            valueType: {
                                                type: "primitive",
                                                primitive: { v1: "STRING", v2: undefined }
                                            }
                                        }
                                    }
                                ],
                                scopes: undefined
                            }
                        }
                    }
                };
                const ctx = createMockContext({
                    schemes: [oauthScheme],
                    oauth: oauthScheme,
                    csharpTypeMapper: {
                        convert: vi.fn().mockReturnValue({ isOptional: false })
                    }
                });
                const result = extractAuthProperties(ctx);
                // clientId, clientSecret, audience
                expect(result).toHaveLength(3);
                expect(result[2]).toEqual({
                    name: "audience",
                    pascalName: "Audience",
                    docs: "The audience for OAuth authentication.",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("filters out literal custom properties", () => {
                const oauthScheme = {
                    type: "oauth" as const,
                    configuration: {
                        clientIdEnvVar: null,
                        clientSecretEnvVar: null,
                        tokenEndpoint: {
                            requestProperties: {
                                customProperties: [
                                    {
                                        property: {
                                            name: { name: makeName("grantType", "GrantType") },
                                            valueType: {
                                                type: "container",
                                                container: {
                                                    type: "literal",
                                                    literal: { type: "string", string: "client_credentials" }
                                                }
                                            }
                                        }
                                    }
                                ],
                                scopes: undefined
                            }
                        }
                    }
                };
                const ctx = createMockContext({
                    schemes: [oauthScheme],
                    oauth: oauthScheme
                });
                const result = extractAuthProperties(ctx);
                // Only clientId and clientSecret, grantType filtered out
                expect(result).toHaveLength(2);
                expect(result.find((p) => p.name === "grantType")).toBeUndefined();
            });

            it("filters out optional-typed custom properties", () => {
                const oauthScheme = {
                    type: "oauth" as const,
                    configuration: {
                        clientIdEnvVar: null,
                        clientSecretEnvVar: null,
                        tokenEndpoint: {
                            requestProperties: {
                                customProperties: [
                                    {
                                        property: {
                                            name: { name: makeName("scope", "Scope") },
                                            valueType: {
                                                type: "primitive",
                                                primitive: { v1: "STRING", v2: undefined }
                                            }
                                        }
                                    }
                                ],
                                scopes: undefined
                            }
                        }
                    }
                };
                const ctx = createMockContext({
                    schemes: [oauthScheme],
                    oauth: oauthScheme,
                    csharpTypeMapper: {
                        convert: vi.fn().mockReturnValue({ isOptional: true })
                    }
                });
                const result = extractAuthProperties(ctx);
                // Only clientId and clientSecret, scope filtered because type mapper says optional
                expect(result).toHaveLength(2);
                expect(result.find((p) => p.name === "scope")).toBeUndefined();
            });
        });

        describe("global headers", () => {
            it("extracts non-literal headers", () => {
                const ctx = createMockContext({
                    headers: [
                        {
                            name: { name: makeName("xRequestId", "XRequestId"), wireValue: "X-Request-Id" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } },
                            docs: "Request tracking ID"
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                expect(result[0]).toEqual({
                    name: "xRequestId",
                    pascalName: "XRequestId",
                    docs: "Request tracking ID",
                    isOptional: false,
                    hasEnvironmentVariable: false
                });
            });

            it("skips literal headers", () => {
                const ctx = createMockContext({
                    headers: [
                        {
                            name: { name: makeName("xApiVersion", "XApiVersion"), wireValue: "X-Api-Version" },
                            valueType: {
                                type: "container",
                                container: {
                                    type: "literal",
                                    literal: { type: "string", string: "2024-01-01" }
                                }
                            },
                            docs: undefined
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toEqual([]);
            });

            it("marks optional headers correctly", () => {
                const ctx = createMockContext({
                    headers: [
                        {
                            name: { name: makeName("xTraceId", "XTraceId"), wireValue: "X-Trace-Id" },
                            valueType: {
                                type: "container",
                                container: {
                                    type: "optional",
                                    optional: { type: "primitive", primitive: { v1: "STRING", v2: undefined } }
                                }
                            },
                            docs: undefined
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                expect(result[0]?.isOptional).toBe(true);
            });

            it("uses default docs when header.docs is undefined", () => {
                const ctx = createMockContext({
                    headers: [
                        {
                            name: { name: makeName("xRequestId", "XRequestId"), wireValue: "X-Request-Id" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } },
                            docs: undefined
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result[0]?.docs).toBe("The xRequestId header value.");
            });
        });

        describe("deduplication", () => {
            it("deduplicates properties with the same name across schemes", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: "First occurrence",
                            headerEnvVar: null
                        },
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: "Duplicate occurrence",
                            headerEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                expect(result[0]?.docs).toBe("First occurrence");
            });

            it("deduplicates auth scheme properties vs global headers", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("authorization", "Authorization") },
                            docs: "Auth header from scheme",
                            headerEnvVar: null
                        }
                    ],
                    headers: [
                        {
                            name: {
                                name: makeName("authorization", "Authorization"),
                                wireValue: "Authorization"
                            },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } },
                            docs: "Auth header from global headers"
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(1);
                // Auth scheme wins (comes first)
                expect(result[0]?.docs).toBe("Auth header from scheme");
            });
        });

        describe("ordering", () => {
            it("returns auth scheme properties before global headers", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: undefined,
                            headerEnvVar: null
                        }
                    ],
                    headers: [
                        {
                            name: { name: makeName("xRequestId", "XRequestId"), wireValue: "X-Request-Id" },
                            valueType: { type: "primitive", primitive: { v1: "STRING", v2: undefined } },
                            docs: undefined
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(2);
                expect(result[0]?.name).toBe("apiKey");
                expect(result[1]?.name).toBe("xRequestId");
            });
        });

        describe("multiple auth schemes combined", () => {
            it("extracts properties from multiple different scheme types", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "header",
                            name: { name: makeName("apiKey", "ApiKey") },
                            docs: undefined,
                            headerEnvVar: "API_KEY"
                        },
                        {
                            type: "bearer",
                            token: makeName("bearerToken", "BearerToken"),
                            docs: undefined,
                            tokenEnvVar: null
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toHaveLength(2);
                expect(result[0]?.name).toBe("apiKey");
                expect(result[0]?.hasEnvironmentVariable).toBe(true);
                expect(result[1]?.name).toBe("bearerToken");
                expect(result[1]?.hasEnvironmentVariable).toBe(false);
            });
        });

        describe("unknown scheme type", () => {
            it("returns empty for unknown scheme types", () => {
                const ctx = createMockContext({
                    schemes: [
                        {
                            type: "unknownSchemeType"
                        }
                    ]
                });
                const result = extractAuthProperties(ctx);
                expect(result).toEqual([]);
            });
        });
    });
});
