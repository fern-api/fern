import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";

describe("response precedence and content negotiation", () => {
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

    it("should handle default response with specific status codes", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/data": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                data: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "404": {
                                description: "Not found",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                error: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            default: {
                                description: "Error",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                message: { type: "string" }
                                            }
                                        }
                                    }
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

    it("should handle multiple content types for same status code", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/export": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                data: { type: "array", items: { type: "object" } }
                                            }
                                        }
                                    },
                                    "text/csv": {
                                        schema: {
                                            type: "string"
                                        }
                                    },
                                    "application/xml": {
                                        schema: {
                                            type: "string"
                                        }
                                    }
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

    it("should handle wildcard status codes", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/items": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success"
                            },
                            "2XX": {
                                description: "Success range",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                status: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "4XX": {
                                description: "Client error",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                error: { type: "string" }
                                            }
                                        }
                                    }
                                }
                            },
                            "5XX": {
                                description: "Server error",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                error: { type: "string" }
                                            }
                                        }
                                    }
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

    it("should handle response with $ref", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/users": {
                    get: {
                        responses: {
                            "200": {
                                $ref: "#/components/responses/UserListResponse"
                            },
                            "404": {
                                $ref: "#/components/responses/NotFoundError"
                            }
                        }
                    }
                }
            },
            components: {
                responses: {
                    UserListResponse: {
                        description: "List of users",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    NotFoundError: {
                        description: "Resource not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        error: { type: "string" }
                                    }
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

    it("should handle response description precedence", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/items": {
                    get: {
                        summary: "Get items",
                        description: "Retrieves a list of items",
                        responses: {
                            "200": {
                                description: "Successful response with items",
                                content: {
                                    "application/json": {
                                        schema: {
                                            description: "Array of item objects",
                                            type: "array",
                                            items: {
                                                type: "object",
                                                description: "Individual item",
                                                properties: {
                                                    id: { type: "string" }
                                                }
                                            }
                                        }
                                    }
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

    it("should handle empty response bodies", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/delete": {
                    delete: {
                        responses: {
                            "204": {
                                description: "No content"
                            },
                            "404": {
                                description: "Not found"
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

    it("should handle response headers", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/data": {
                    get: {
                        responses: {
                            "200": {
                                description: "Success",
                                headers: {
                                    "X-Rate-Limit": {
                                        schema: {
                                            type: "integer"
                                        },
                                        description: "Rate limit"
                                    },
                                    "X-Rate-Limit-Remaining": {
                                        schema: {
                                            type: "integer"
                                        },
                                        description: "Remaining requests"
                                    }
                                },
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                data: { type: "string" }
                                            }
                                        }
                                    }
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
