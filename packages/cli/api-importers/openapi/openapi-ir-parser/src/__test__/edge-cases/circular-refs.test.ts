import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertForTest } from "./testUtils";

describe("circular references and deep $ref chains", () => {
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

    it("should handle simple circular reference", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Node: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            value: { type: "string" },
                            next: { $ref: "#/components/schemas/Node" }
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

        const schema = openApiDocument.components?.schemas?.Node as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Node"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle mutual circular references", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Author: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            books: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Book" }
                            }
                        }
                    },
                    Book: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            author: { $ref: "#/components/schemas/Author" }
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

        const authorSchema = openApiDocument.components?.schemas?.Author as OpenAPIV3.SchemaObject;
        const authorResult = convertForTest({
            schema: authorSchema,
            context: context,
            source: source,
            breadcrumbs: ["Author"]
        });

        const bookSchema = openApiDocument.components?.schemas?.Book as OpenAPIV3.SchemaObject;
        const bookResult = convertForTest({
            schema: bookSchema,
            context: context,
            source: source,
            breadcrumbs: ["Book"]
        });

        expect(authorResult).toBeDefined();
        expect(bookResult).toBeDefined();
    });

    it("should handle tree structure with circular references", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    TreeNode: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            value: { type: "string" },
                            parent: { $ref: "#/components/schemas/TreeNode" },
                            children: {
                                type: "array",
                                items: { $ref: "#/components/schemas/TreeNode" }
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

        const schema = openApiDocument.components?.schemas?.TreeNode as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["TreeNode"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle deep $ref chains", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Level1: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            level2: { $ref: "#/components/schemas/Level2" }
                        }
                    },
                    Level2: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            level3: { $ref: "#/components/schemas/Level3" }
                        }
                    },
                    Level3: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            level4: { $ref: "#/components/schemas/Level4" }
                        }
                    },
                    Level4: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            level5: { $ref: "#/components/schemas/Level5" }
                        }
                    },
                    Level5: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            value: { type: "string" }
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

        const schema = openApiDocument.components?.schemas?.Level1 as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Level1"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle circular references with allOf", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    BaseEntity: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            createdAt: { type: "string", format: "date-time" }
                        }
                    },
                    Category: {
                        allOf: [
                            { $ref: "#/components/schemas/BaseEntity" },
                            {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    parent: { $ref: "#/components/schemas/Category" },
                                    subcategories: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Category" }
                                    }
                                }
                            }
                        ]
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

        const schema = openApiDocument.components?.schemas?.Category as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Category"] });

        expect(result).toBeDefined();
    });

    it("should handle complex graph structure", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    GraphNode: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            label: { type: "string" },
                            edges: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Edge" }
                            }
                        }
                    },
                    Edge: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            weight: { type: "number" },
                            from: { $ref: "#/components/schemas/GraphNode" },
                            to: { $ref: "#/components/schemas/GraphNode" }
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

        const nodeSchema = openApiDocument.components?.schemas?.GraphNode as OpenAPIV3.SchemaObject;
        const nodeResult = convertForTest({
            schema: nodeSchema,
            context: context,
            source: source,
            breadcrumbs: ["GraphNode"]
        });

        const edgeSchema = openApiDocument.components?.schemas?.Edge as OpenAPIV3.SchemaObject;
        const edgeResult = convertForTest({
            schema: edgeSchema,
            context: context,
            source: source,
            breadcrumbs: ["Edge"]
        });

        expect(nodeResult).toBeDefined();
        expect(edgeResult).toBeDefined();
    });
});
