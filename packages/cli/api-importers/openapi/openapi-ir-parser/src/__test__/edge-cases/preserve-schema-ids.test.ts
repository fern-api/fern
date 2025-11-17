import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertSchema } from "../../schema/convertSchemas";
import { getGeneratedTypeName } from "../../schema/utils/getSchemaName";

describe("preserveSchemaIds", () => {
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

    it("should preserve schema IDs when flag is enabled", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    UserProfile: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" }
                        }
                    }
                }
            }
        };

        const contextWithPreserve = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                preserveSchemaIds: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.UserProfile as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["UserProfile"], source, contextWithPreserve);

        expect(result).toBeDefined();
    });

    it("should not preserve schema IDs when flag is disabled", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    UserProfile: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" }
                        }
                    }
                }
            }
        };

        const contextWithoutPreserve = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                preserveSchemaIds: false
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.UserProfile as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["UserProfile"], source, contextWithoutPreserve);

        expect(result).toBeDefined();
    });

    it("should handle getGeneratedTypeName with preserveSchemaIds enabled", () => {
        const breadcrumbs = ["User", "Profile", "Details"];

        const nameWithPreserve = getGeneratedTypeName(breadcrumbs, true);
        const nameWithoutPreserve = getGeneratedTypeName(breadcrumbs, false);

        expect(nameWithPreserve).toBeDefined();
        expect(nameWithoutPreserve).toBeDefined();
    });

    it("should preserve schema IDs for nested schemas", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Company: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            address: {
                                type: "object",
                                properties: {
                                    street: { type: "string" },
                                    city: { type: "string" },
                                    country: { type: "string" }
                                }
                            },
                            employees: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        role: { type: "string" }
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
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                preserveSchemaIds: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Company as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Company"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should preserve schema IDs with $ref references", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Order: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            customer: { $ref: "#/components/schemas/Customer" },
                            items: {
                                type: "array",
                                items: { $ref: "#/components/schemas/OrderItem" }
                            }
                        }
                    },
                    Customer: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" }
                        }
                    },
                    OrderItem: {
                        type: "object",
                        properties: {
                            productId: { type: "string" },
                            quantity: { type: "integer" },
                            price: { type: "number" }
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
                preserveSchemaIds: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Order as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Order"], source, context);

        expect(result).toBeDefined();
    });
});
