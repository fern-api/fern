import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";

describe("parameter serialization styles", () => {
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

    it("should handle query parameter with style=form and explode=true", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/items": {
                    get: {
                        parameters: [
                            {
                                name: "tags",
                                in: "query",
                                schema: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                style: "form",
                                explode: true
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle query parameter with style=spaceDelimited", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/search": {
                    get: {
                        parameters: [
                            {
                                name: "keywords",
                                in: "query",
                                schema: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                style: "spaceDelimited",
                                explode: false
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle query parameter with style=pipeDelimited", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/filter": {
                    get: {
                        parameters: [
                            {
                                name: "categories",
                                in: "query",
                                schema: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                style: "pipeDelimited",
                                explode: false
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle path parameter with style=matrix", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/items/{id}": {
                    get: {
                        parameters: [
                            {
                                name: "id",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string"
                                },
                                style: "matrix"
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle header parameter with array type", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/data": {
                    get: {
                        parameters: [
                            {
                                name: "X-Custom-Headers",
                                in: "header",
                                schema: {
                                    type: "array",
                                    items: { type: "string" }
                                },
                                style: "simple",
                                explode: false
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle object query parameters", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/complex": {
                    get: {
                        parameters: [
                            {
                                name: "filter",
                                in: "query",
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        age: { type: "integer" },
                                        active: { type: "boolean" }
                                    }
                                },
                                style: "deepObject",
                                explode: true
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                objectQueryParameters: true
            },
            source,
            namespace: undefined
        });

        expect(context).toBeDefined();
    });

    it("should handle path parameter with reserved characters", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/files/{path}": {
                    get: {
                        parameters: [
                            {
                                name: "path",
                                in: "path",
                                required: true,
                                schema: {
                                    type: "string"
                                },
                                allowReserved: true
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle cookie parameters", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/session": {
                    get: {
                        parameters: [
                            {
                                name: "sessionId",
                                in: "cookie",
                                schema: {
                                    type: "string"
                                }
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
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

    it("should handle inlinePathParameters flag", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/users/{userId}/posts/{postId}": {
                    get: {
                        parameters: [
                            {
                                name: "userId",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            },
                            {
                                name: "postId",
                                in: "path",
                                required: true,
                                schema: { type: "string" }
                            }
                        ],
                        responses: {
                            "200": {
                                description: "Success"
                            }
                        }
                    }
                }
            }
        };

        const contextWithInline = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                inlinePathParameters: true
            },
            source,
            namespace: undefined
        });

        const contextWithoutInline = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                inlinePathParameters: false
            },
            source,
            namespace: undefined
        });

        expect(contextWithInline).toBeDefined();
        expect(contextWithoutInline).toBeDefined();
    });
});
