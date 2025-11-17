import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertSchema } from "../../schema/convertSchemas";

describe("enum normalization and edge cases", () => {
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

    it("should handle string enum", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Status: {
                        type: "string",
                        enum: ["active", "inactive", "pending", "archived"]
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

        const schema = openApiDocument.components?.schemas?.Status as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Status"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle enum with special characters", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    SpecialEnum: {
                        type: "string",
                        enum: ["value-with-dash", "value_with_underscore", "value.with.dot", "value with space"]
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

        const schema = openApiDocument.components?.schemas?.SpecialEnum as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["SpecialEnum"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle numeric enum", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Priority: {
                        type: "integer",
                        enum: [1, 2, 3, 4, 5]
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

        const schema = openApiDocument.components?.schemas?.Priority as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Priority"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle enum with empty string", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    EmptyEnum: {
                        type: "string",
                        enum: ["", "value1", "value2"]
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

        const schema = openApiDocument.components?.schemas?.EmptyEnum as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["EmptyEnum"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle enum with numeric-like strings", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    NumericStrings: {
                        type: "string",
                        enum: ["1", "2", "3", "100", "999"]
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

        const schema = openApiDocument.components?.schemas?.NumericStrings as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["NumericStrings"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle coerceEnumsToLiterals flag", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Color: {
                        type: "string",
                        enum: ["red", "green", "blue"]
                    }
                }
            }
        };

        const contextWithCoercion = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                coerceEnumsToLiterals: true
            },
            source,
            namespace: undefined
        });

        const contextWithoutCoercion = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                coerceEnumsToLiterals: false
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Color as OpenAPIV3.SchemaObject;
        const resultWith = convertSchema(schema, ["Color"], source, contextWithCoercion);
        const resultWithout = convertSchema(schema, ["Color"], source, contextWithoutCoercion);

        expect(resultWith).toBeDefined();
        expect(resultWithout).toBeDefined();
    });

    it("should handle enum with x-fern-enum extension", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Role: {
                        type: "string",
                        enum: ["admin", "user", "guest"],
                        "x-fern-enum": {
                            admin: {
                                name: "Administrator",
                                description: "Full system access"
                            },
                            user: {
                                name: "RegularUser",
                                description: "Standard user access"
                            },
                            guest: {
                                name: "GuestUser",
                                description: "Limited access"
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

        const schema = openApiDocument.components?.schemas?.Role as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["Role"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle forward compatible enums", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    ApiVersion: {
                        type: "string",
                        enum: ["v1", "v2", "v3"]
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
                respectForwardCompatibleEnums: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.ApiVersion as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["ApiVersion"], source, context);

        expect(result).toBeDefined();
    });

    it("should handle enum casing variations", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    MixedCase: {
                        type: "string",
                        enum: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE", "kebab-case"]
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

        const schema = openApiDocument.components?.schemas?.MixedCase as OpenAPIV3.SchemaObject;
        const result = convertSchema(schema, ["MixedCase"], source, context);

        expect(result).toBeDefined();
    });
});
