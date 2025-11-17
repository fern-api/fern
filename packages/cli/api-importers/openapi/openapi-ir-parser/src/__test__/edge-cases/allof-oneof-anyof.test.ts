import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { OpenAPIV3ParserContext } from "../../openapi/v3/OpenAPIV3ParserContext";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../options";
import { convertForTest } from "./testUtils";

describe("allOf/oneOf/anyOf schema composition", () => {
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

    describe("allOf merging", () => {
        it("should merge properties from multiple schemas", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Base: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                                createdAt: { type: "string", format: "date-time" }
                            },
                            required: ["id"]
                        },
                        Extended: {
                            allOf: [
                                { $ref: "#/components/schemas/Base" },
                                {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        email: { type: "string", format: "email" }
                                    },
                                    required: ["name"]
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

            const schema = openApiDocument.components?.schemas?.Extended as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["Extended"]
            });

            expect(result).toBeDefined();
            expect(result.type).toBe("object");
        });

        it("should handle nested allOf with multiple levels", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Level1: {
                            type: "object",
                            properties: {
                                field1: { type: "string" }
                            }
                        },
                        Level2: {
                            allOf: [
                                { $ref: "#/components/schemas/Level1" },
                                {
                                    type: "object",
                                    properties: {
                                        field2: { type: "string" }
                                    }
                                }
                            ]
                        },
                        Level3: {
                            allOf: [
                                { $ref: "#/components/schemas/Level2" },
                                {
                                    type: "object",
                                    properties: {
                                        field3: { type: "string" }
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

            const schema = openApiDocument.components?.schemas?.Level3 as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["Level3"]
            });

            expect(result).toBeDefined();
        });
    });

    describe("oneOf unions", () => {
        it("should handle oneOf with discriminator", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Pet: {
                            oneOf: [{ $ref: "#/components/schemas/Dog" }, { $ref: "#/components/schemas/Cat" }],
                            discriminator: {
                                propertyName: "petType"
                            }
                        },
                        Dog: {
                            type: "object",
                            properties: {
                                petType: { type: "string", enum: ["dog"] },
                                bark: { type: "boolean" }
                            },
                            required: ["petType"]
                        },
                        Cat: {
                            type: "object",
                            properties: {
                                petType: { type: "string", enum: ["cat"] },
                                meow: { type: "boolean" }
                            },
                            required: ["petType"]
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

            const schema = openApiDocument.components?.schemas?.Pet as OpenAPIV3.SchemaObject;
            const result = convertForTest({ schema: schema, context: context, source: source, breadcrumbs: ["Pet"] });

            expect(result).toBeDefined();
            expect(result.type).toBe("oneOf");
        });

        it("should handle oneOf without discriminator", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Response: {
                            oneOf: [
                                {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        data: { type: "string" }
                                    }
                                },
                                {
                                    type: "object",
                                    properties: {
                                        error: { type: "string" },
                                        code: { type: "integer" }
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

            const schema = openApiDocument.components?.schemas?.Response as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["Response"]
            });

            expect(result).toBeDefined();
        });

        it("should preserve single schema oneOf when flag is enabled", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        SingleOneOf: {
                            oneOf: [
                                {
                                    type: "object",
                                    properties: {
                                        value: { type: "string" }
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
                options: {
                    ...DEFAULT_PARSE_OPENAPI_SETTINGS,
                    preserveSingleSchemaOneOf: true
                },
                source,
                namespace: undefined
            });

            const schema = openApiDocument.components?.schemas?.SingleOneOf as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["SingleOneOf"]
            });

            expect(result).toBeDefined();
        });
    });

    describe("anyOf unions", () => {
        it("should handle anyOf with multiple types", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        FlexibleValue: {
                            anyOf: [
                                { type: "string" },
                                { type: "number" },
                                {
                                    type: "object",
                                    properties: {
                                        complex: { type: "boolean" }
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

            const schema = openApiDocument.components?.schemas?.FlexibleValue as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["FlexibleValue"]
            });

            expect(result).toBeDefined();
        });

        it("should handle anyOf with nullable", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        NullableAnyOf: {
                            anyOf: [{ type: "string" }, { type: "number" }],
                            nullable: true
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

            const schema = openApiDocument.components?.schemas?.NullableAnyOf as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["NullableAnyOf"]
            });

            expect(result).toBeDefined();
        });
    });

    describe("complex combinations", () => {
        it("should handle allOf with oneOf", () => {
            const openApiDocument: OpenAPIV3.Document = {
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
                paths: {},
                components: {
                    schemas: {
                        Base: {
                            type: "object",
                            properties: {
                                id: { type: "string" }
                            }
                        },
                        Complex: {
                            allOf: [
                                { $ref: "#/components/schemas/Base" },
                                {
                                    oneOf: [
                                        {
                                            type: "object",
                                            properties: {
                                                typeA: { type: "string" }
                                            }
                                        },
                                        {
                                            type: "object",
                                            properties: {
                                                typeB: { type: "number" }
                                            }
                                        }
                                    ]
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

            const schema = openApiDocument.components?.schemas?.Complex as OpenAPIV3.SchemaObject;
            const result = convertForTest({
                schema: schema,
                context: context,
                source: source,
                breadcrumbs: ["Complex"]
            });

            expect(result).toBeDefined();
        });
    });
});
