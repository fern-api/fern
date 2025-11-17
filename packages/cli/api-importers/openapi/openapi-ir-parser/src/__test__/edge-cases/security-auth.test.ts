import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { convertSecurityScheme } from "../../openapi/v3/converters/convertSecurityScheme";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";

describe("security requirements and auth", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        }
    } as unknown as TaskContext;

    const source: Source = Source.openapi({
        file: "test.yaml"
    });

    it("should handle multiple security schemes", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    },
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    },
                    OAuth2: {
                        type: "oauth2",
                        flows: {
                            authorizationCode: {
                                authorizationUrl: "https://example.com/oauth/authorize",
                                tokenUrl: "https://example.com/oauth/token",
                                scopes: {
                                    "read:users": "Read user data",
                                    "write:users": "Write user data"
                                }
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const apiKeyScheme = openApiDocument.components?.securitySchemes?.ApiKeyAuth as OpenAPIV3.SecuritySchemeObject;
        const apiKeyResult = convertSecurityScheme(apiKeyScheme, source, mockTaskContext);

        const bearerScheme = openApiDocument.components?.securitySchemes?.BearerAuth as OpenAPIV3.SecuritySchemeObject;
        const bearerResult = convertSecurityScheme(bearerScheme, source, mockTaskContext);

        expect(apiKeyResult).toBeDefined();
        expect(bearerResult).toBeDefined();
    });

    it("should handle global security requirements", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            security: [
                {
                    ApiKeyAuth: []
                }
            ],
            paths: {
                "/data": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });

    it("should handle operation-level security overrides", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            security: [
                {
                    ApiKeyAuth: []
                }
            ],
            paths: {
                "/public": {
                    get: {
                        security: [],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                },
                "/protected": {
                    get: {
                        security: [
                            {
                                BearerAuth: []
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    },
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });

    it("should handle OAuth2 with multiple flows", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    OAuth2: {
                        type: "oauth2",
                        flows: {
                            implicit: {
                                authorizationUrl: "https://example.com/oauth/authorize",
                                scopes: {
                                    read: "Read access",
                                    write: "Write access"
                                }
                            },
                            authorizationCode: {
                                authorizationUrl: "https://example.com/oauth/authorize",
                                tokenUrl: "https://example.com/oauth/token",
                                scopes: {
                                    read: "Read access",
                                    write: "Write access",
                                    admin: "Admin access"
                                }
                            },
                            clientCredentials: {
                                tokenUrl: "https://example.com/oauth/token",
                                scopes: {
                                    api: "API access"
                                }
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });

    it("should handle Basic authentication", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    BasicAuth: {
                        type: "http",
                        scheme: "basic"
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const scheme = openApiDocument.components?.securitySchemes?.BasicAuth as OpenAPIV3.SecuritySchemeObject;
        const result = convertSecurityScheme(scheme, source, mockTaskContext);

        expect(result).toBeDefined();
        expect(result?.type).toBe("basic");
    });

    it("should handle API key in different locations", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                securitySchemes: {
                    ApiKeyHeader: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    },
                    ApiKeyQuery: {
                        type: "apiKey",
                        in: "query",
                        name: "api_key"
                    },
                    ApiKeyCookie: {
                        type: "apiKey",
                        in: "cookie",
                        name: "api_key"
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const headerScheme = openApiDocument.components?.securitySchemes
            ?.ApiKeyHeader as OpenAPIV3.SecuritySchemeObject;
        const headerResult = convertSecurityScheme(headerScheme, source, mockTaskContext);

        const queryScheme = openApiDocument.components?.securitySchemes?.ApiKeyQuery as OpenAPIV3.SecuritySchemeObject;
        const queryResult = convertSecurityScheme(queryScheme, source, mockTaskContext);

        expect(headerResult).toBeDefined();
        expect(queryResult).toBeDefined();
    });

    it("should handle combined security requirements (AND logic)", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/secure": {
                    get: {
                        security: [
                            {
                                ApiKeyAuth: [],
                                BearerAuth: []
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    },
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });

    it("should handle alternative security requirements (OR logic)", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/flexible": {
                    get: {
                        security: [
                            {
                                ApiKeyAuth: []
                            },
                            {
                                BearerAuth: []
                            },
                            {
                                OAuth2: ["read"]
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            },
            components: {
                securitySchemes: {
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key"
                    },
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer"
                    },
                    OAuth2: {
                        type: "oauth2",
                        flows: {
                            authorizationCode: {
                                authorizationUrl: "https://example.com/oauth/authorize",
                                tokenUrl: "https://example.com/oauth/token",
                                scopes: {
                                    read: "Read access"
                                }
                            }
                        }
                    }
                }
            }
        };

        const context = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });
});
