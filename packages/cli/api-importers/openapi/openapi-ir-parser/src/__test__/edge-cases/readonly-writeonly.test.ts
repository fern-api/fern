import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertSchema } from "../../schema/convertSchemas";

describe("readOnly and writeOnly directionality", () => {
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

    it("should handle readOnly properties in response schemas", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                readOnly: true
                            },
                            createdAt: {
                                type: "string",
                                format: "date-time",
                                readOnly: true
                            },
                            updatedAt: {
                                type: "string",
                                format: "date-time",
                                readOnly: true
                            },
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string"
                            }
                        },
                        required: ["id", "name", "email"]
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
                respectReadonlySchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.User as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["User"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle writeOnly properties in request schemas", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    UserCreate: {
                        type: "object",
                        properties: {
                            username: {
                                type: "string"
                            },
                            password: {
                                type: "string",
                                writeOnly: true
                            },
                            confirmPassword: {
                                type: "string",
                                writeOnly: true
                            },
                            email: {
                                type: "string"
                            }
                        },
                        required: ["username", "password", "email"]
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
                respectReadonlySchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.UserCreate as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["UserCreate"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle mixed readOnly and writeOnly properties", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Account: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                readOnly: true
                            },
                            accountNumber: {
                                type: "string",
                                readOnly: true
                            },
                            balance: {
                                type: "number",
                                readOnly: true
                            },
                            pin: {
                                type: "string",
                                writeOnly: true
                            },
                            securityQuestion: {
                                type: "string",
                                writeOnly: true
                            },
                            name: {
                                type: "string"
                            },
                            email: {
                                type: "string"
                            }
                        },
                        required: ["id", "name"]
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
                respectReadonlySchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Account as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Account"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle readOnly in nested objects", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Order: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                readOnly: true
                            },
                            status: {
                                type: "string",
                                readOnly: true
                            },
                            customer: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                        readOnly: true
                                    },
                                    name: {
                                        type: "string"
                                    },
                                    email: {
                                        type: "string"
                                    }
                                }
                            },
                            items: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            readOnly: true
                                        },
                                        productId: {
                                            type: "string"
                                        },
                                        quantity: {
                                            type: "integer"
                                        },
                                        price: {
                                            type: "number",
                                            readOnly: true
                                        }
                                    }
                                }
                            }
                        },
                        required: ["id", "customer", "items"]
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
                respectReadonlySchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Order as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Order"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should respect readOnly flag when disabled", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Product: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                readOnly: true
                            },
                            name: {
                                type: "string"
                            },
                            price: {
                                type: "number"
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
                respectReadonlySchemas: false
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Product as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Product"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });
});
