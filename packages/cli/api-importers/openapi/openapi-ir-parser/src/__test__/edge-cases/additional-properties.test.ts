import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertForTest } from "./testUtils";

describe("additionalProperties edge cases", () => {
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

    it("should handle additionalProperties: true", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    FlexibleObject: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
                        },
                        additionalProperties: true
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

        const schema = openApiDocument.components?.schemas?.FlexibleObject as OpenAPIV3.SchemaObject;
        const result = convertForTest({
            schema: schema,
            context: context,
            source: source,
            breadcrumbs: ["FlexibleObject"]
        });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle additionalProperties: false", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    StrictObject: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
                        },
                        additionalProperties: false
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

        const schema = openApiDocument.components?.schemas?.StrictObject as OpenAPIV3.SchemaObject;
        const result = convertForTest({
            schema: schema,
            context: context,
            source: source,
            breadcrumbs: ["StrictObject"]
        });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle additionalProperties with typed schema", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    StringMap: {
                        type: "object",
                        properties: {
                            id: { type: "string" }
                        },
                        additionalProperties: {
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
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.StringMap as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["StringMap"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle additionalProperties with complex object schema", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    ObjectMap: {
                        type: "object",
                        additionalProperties: {
                            type: "object",
                            properties: {
                                value: { type: "string" },
                                count: { type: "integer" }
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

        const schema = openApiDocument.components?.schemas?.ObjectMap as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["ObjectMap"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle additionalProperties with $ref", () => {
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
                    UserMap: {
                        type: "object",
                        additionalProperties: {
                            $ref: "#/components/schemas/User"
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

        const schema = openApiDocument.components?.schemas?.UserMap as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["UserMap"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle optionalAdditionalProperties flag", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Config: {
                        type: "object",
                        properties: {
                            version: { type: "string" }
                        },
                        additionalProperties: {
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
                optionalAdditionalProperties: true
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.Config as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Config"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });

    it("should handle additionalPropertiesDefaultsTo flag", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    ImplicitAdditionalProps: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" }
                        }
                    }
                }
            }
        };

        const contextDefaultTrue = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                additionalPropertiesDefaultsTo: true
            },
            source,
            namespace: undefined
        });

        const contextDefaultFalse = new OpenAPIV3ParserContext({
            document: openApiDocument,
            taskContext: mockTaskContext,
            authHeaders: new Set(),
            options: {
                ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                additionalPropertiesDefaultsTo: false
            },
            source,
            namespace: undefined
        });

        const schema = openApiDocument.components?.schemas?.ImplicitAdditionalProps as OpenAPIV3.SchemaObject;
        const resultTrue = convertForTest({
            schema: schema,
            context: contextDefaultTrue,
            source: source,
            breadcrumbs: ["ImplicitAdditionalProps"]
        });
        const resultFalse = convertForTest({
            schema: schema,
            context: contextDefaultFalse,
            source: source,
            breadcrumbs: ["ImplicitAdditionalProps"]
        });

        expect(resultTrue).toBeDefined();
        expect(resultFalse).toBeDefined();
    });

    it("should handle additionalProperties with array type", () => {
        const openApiDocument: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    ArrayMap: {
                        type: "object",
                        additionalProperties: {
                            type: "array",
                            items: {
                                type: "string"
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

        const schema = openApiDocument.components?.schemas?.ArrayMap as OpenAPIV3.SchemaObject;
        const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["ArrayMap"] });

        expect(result).toBeDefined();
        expect(result.type).toBe("object");
    });
});
