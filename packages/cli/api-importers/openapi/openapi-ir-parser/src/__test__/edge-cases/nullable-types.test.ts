import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertSchema } from "../../schema/convertSchemas";

describe("nullable types and OpenAPI 3.1 type unions", () => {
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

    it("should handle nullable string in OpenAPI 3.0", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    NullableString: {
                        type: "string",
                        nullable: true
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.NullableString as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NullableString"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle nullable object", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    NullableUser: {
                        type: "object",
                        nullable: true,
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.NullableUser as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NullableUser"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle nullable array", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    NullableArray: {
                        type: "array",
                        nullable: true,
                        items: {
                            type: "string"
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.NullableArray as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NullableArray"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle nullable with $ref", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    User: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
                        }
                    },
                    NullableUserRef: {
                        allOf: [{ $ref: "#/components/schemas/User" }],
                        nullable: true
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.NullableUserRef as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NullableUserRef"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle nullable enum", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    NullableStatus: {
                        type: "string",
                        enum: ["active", "inactive", "pending"],
                        nullable: true
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.NullableStatus as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NullableStatus"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle nullable properties in object", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Profile: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            bio: {
                                type: "string",
                                nullable: true
                            },
                            avatar: {
                                type: "string",
                                nullable: true
                            },
                            website: {
                                type: "string",
                                nullable: true
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
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Profile as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Profile"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should respect nullable flag when disabled", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    MaybeString: {
                        type: "string",
                        nullable: true
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
                respectNullableSchemas: false
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.MaybeString as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["MaybeString"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle wrapReferencesToNullableInOptional flag", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Address: {
                        type: "object",
                        properties: {
                            street: { type: "string" },
                            city: { type: "string" }
                        }
                    },
                    UserWithAddress: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            address: {
                                allOf: [{ $ref: "#/components/schemas/Address" }],
                                nullable: true
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
                wrapReferencesToNullableInOptional: true,
                respectNullableSchemas: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.UserWithAddress as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["UserWithAddress"], source, context);

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });
});
