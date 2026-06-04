import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../AbstractConverterContext.js";
import { type AiExampleOverride, ExampleValidator } from "../ExampleValidator.js";

const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

function createMockContext(spec: OpenAPIV3_1.Document): AbstractConverterContext<object> {
    return {
        logger: mockLogger,
        isReferenceObject: vi.fn().mockImplementation((obj: unknown) => {
            return obj != null && typeof obj === "object" && "$ref" in obj;
        }),
        resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => {
            if (schemaOrReference && typeof schemaOrReference === "object" && "$ref" in schemaOrReference) {
                const refPath = (schemaOrReference as { $ref: string }).$ref;
                const parts = refPath.split("/");
                const schemaName = parts[parts.length - 1];
                if (schemaName == null) {
                    return undefined;
                }
                return spec.components?.schemas?.[schemaName] as OpenAPIV3_1.SchemaObject | undefined;
            }
            return schemaOrReference;
        }),
        resolveExample: vi.fn().mockReturnValue(undefined)
    } as unknown as AbstractConverterContext<object>;
}

describe("ExampleValidator - validateAiExamples missing required fields", () => {
    it("should mark AI example as stale when missing required fields", () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {
                "/users": {
                    post: {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/UserPost" }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    UserPost: {
                        type: "object",
                        properties: {
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            email: { type: "string", format: "email" },
                            role: { type: "string" },
                            companyId: { type: "integer" },
                            channelIds: { type: "array", items: { type: "integer" } }
                        },
                        required: ["firstName", "lastName", "email", "role", "companyId", "channelIds"]
                    }
                }
            }
        };

        const context = createMockContext(spec);
        const validator = new ExampleValidator({ context });

        const aiExamples: AiExampleOverride[] = [
            {
                endpointPath: "/users",
                method: "POST",
                request: { body: { channelIds: [101, 202] } }
            }
        ];

        const result = validator.validateAiExamples({ aiExamples, spec });

        expect(result.invalidExamples).toHaveLength(1);
        expect(result.validExamples).toHaveLength(0);
    });

    it("should accept AI example when all required fields are present", () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {
                "/users": {
                    post: {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/UserPost" }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    UserPost: {
                        type: "object",
                        properties: {
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            email: { type: "string", format: "email" },
                            role: { type: "string" },
                            companyId: { type: "integer" },
                            channelIds: { type: "array", items: { type: "integer" } }
                        },
                        required: ["firstName", "lastName", "email", "role", "companyId", "channelIds"]
                    }
                }
            }
        };

        const context = createMockContext(spec);
        const validator = new ExampleValidator({ context });

        const aiExamples: AiExampleOverride[] = [
            {
                endpointPath: "/users",
                method: "POST",
                request: {
                    body: {
                        firstName: "Jane",
                        lastName: "Doe",
                        email: "jane@example.com",
                        role: "admin",
                        companyId: 42,
                        channelIds: [101, 202]
                    }
                }
            }
        ];

        const result = validator.validateAiExamples({ aiExamples, spec });

        expect(result.validExamples).toHaveLength(1);
        expect(result.invalidExamples).toHaveLength(0);
    });

    it("should detect missing required fields from allOf compositions", () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {
                "/users": {
                    post: {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/UserPost" }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    UserBase: {
                        type: "object",
                        properties: {
                            firstName: { type: "string" },
                            lastName: { type: "string" },
                            email: { type: "string" }
                        },
                        required: ["firstName", "lastName", "email"]
                    },
                    UserPost: {
                        allOf: [
                            { $ref: "#/components/schemas/UserBase" },
                            {
                                type: "object",
                                properties: {
                                    channelIds: { type: "array", items: { type: "integer" } }
                                },
                                required: ["channelIds"]
                            }
                        ]
                    }
                }
            }
        };

        const context = createMockContext(spec);
        const validator = new ExampleValidator({ context });

        const aiExamples: AiExampleOverride[] = [
            {
                endpointPath: "/users",
                method: "POST",
                request: { body: { channelIds: [101, 202] } }
            }
        ];

        const result = validator.validateAiExamples({ aiExamples, spec });

        expect(result.invalidExamples).toHaveLength(1);
        expect(result.validExamples).toHaveLength(0);
    });

    it("should not mark as stale when schema has no required fields", () => {
        const spec: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test", version: "1.0.0" },
            paths: {
                "/users": {
                    post: {
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/UserPost" }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            components: {
                schemas: {
                    UserPost: {
                        type: "object",
                        properties: {
                            firstName: { type: "string" },
                            channelIds: { type: "array", items: { type: "integer" } }
                        }
                    }
                }
            }
        };

        const context = createMockContext(spec);
        const validator = new ExampleValidator({ context });

        const aiExamples: AiExampleOverride[] = [
            {
                endpointPath: "/users",
                method: "POST",
                request: { body: { channelIds: [101, 202] } }
            }
        ];

        const result = validator.validateAiExamples({ aiExamples, spec });

        expect(result.validExamples).toHaveLength(1);
        expect(result.invalidExamples).toHaveLength(0);
    });
});
