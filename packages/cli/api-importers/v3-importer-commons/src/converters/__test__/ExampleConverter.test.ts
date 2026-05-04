import { OpenAPIV3_1 } from "openapi-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../../AbstractConverterContext.js";
import { ExampleConverter } from "../ExampleConverter.js";

// Mock logger
const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

// Mock context
const mockContext = {
    logger: mockLogger,
    isReferenceObject: vi.fn().mockReturnValue(false),
    resolveMaybeReference: vi.fn()
} as unknown as AbstractConverterContext<object>;

describe("ExampleConverter", () => {
    let converter: ExampleConverter;

    // Helper function to access private method
    const callAdjustNumberToConstraints = (number: number, schemaObj?: OpenAPIV3_1.SchemaObject): number => {
        return (
            converter as unknown as {
                adjustNumberToConstraints: (number: number, schemaObj?: OpenAPIV3_1.SchemaObject) => number;
            }
        ).adjustNumberToConstraints(number, schemaObj);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        converter = new ExampleConverter({
            breadcrumbs: [],
            context: mockContext,
            schema: { type: "number" },
            example: 42
        });
    });

    describe("adjustNumberToConstraints", () => {
        it("should return original number when schemaObj is undefined", () => {
            const result = callAdjustNumberToConstraints(42, undefined);

            expect(result).toBe(42);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[ExampleConverter.adjustNumberToConstraints] Schema object is null, returning original number",
                "number:",
                "42"
            );
        });

        it("should return original number when no constraints are defined", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = { type: "number" };
            const result = callAdjustNumberToConstraints(42, schemaObj);

            expect(result).toBe(42);
        });

        it("should handle minimum constraint", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10
            };
            const result = callAdjustNumberToConstraints(5, schemaObj);

            expect(result).toBeGreaterThanOrEqual(10);
            expect(result).toBeLessThanOrEqual(11); // Should be lowerBound + 10% of lowerBound = 10 + 1 = 11
        });

        it("should handle maximum constraint", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                maximum: 100
            };
            const result = callAdjustNumberToConstraints(150, schemaObj);

            expect(result).toBeLessThanOrEqual(100);
            expect(result).toBeGreaterThanOrEqual(90); // Should be upperBound - 10% of upperBound = 100 - 10 = 90
        });

        it("should handle both minimum and maximum constraints", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10,
                maximum: 100
            };
            const result = callAdjustNumberToConstraints(5, schemaObj);

            expect(result).toBeGreaterThanOrEqual(10);
            expect(result).toBeLessThanOrEqual(100);
        });

        it("should handle both minimum and maximum constraints when number is above maximum", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10,
                maximum: 100
            };
            const result = callAdjustNumberToConstraints(150, schemaObj);

            expect(result).toBeGreaterThanOrEqual(10);
            expect(result).toBeLessThanOrEqual(100);
        });

        it("should handle exclusiveMinimum as boolean true", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10,
                exclusiveMinimum: true
            };
            const result = callAdjustNumberToConstraints(5, schemaObj);

            expect(result).toBeGreaterThan(10);
            expect(result).toBeLessThanOrEqual(11); // Should be lowerBound + 10% of lowerBound
        });

        it("should handle exclusiveMinimum as number", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                exclusiveMinimum: 10
            };
            const result = callAdjustNumberToConstraints(5, schemaObj);

            expect(result).toBeGreaterThan(10);
            expect(result).toBeLessThanOrEqual(11); // Should be lowerBound + 10% of lowerBound
        });

        it("should handle exclusiveMaximum as boolean true", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                maximum: 100,
                exclusiveMaximum: true
            };
            const result = callAdjustNumberToConstraints(150, schemaObj);

            expect(result).toBeLessThan(100);
            expect(result).toBeGreaterThanOrEqual(90); // Should be upperBound - 10% of upperBound
        });

        it("should handle exclusiveMaximum as number", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                exclusiveMaximum: 100
            };
            const result = callAdjustNumberToConstraints(150, schemaObj);

            expect(result).toBeLessThan(100);
            expect(result).toBeGreaterThanOrEqual(90); // Should be upperBound - 10% of upperBound
        });

        it("should not adjust number when it's within bounds", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10,
                maximum: 100
            };
            const result = callAdjustNumberToConstraints(50, schemaObj);

            expect(result).toBe(50);
        });

        it("should not adjust number when it's within exclusive bounds", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                exclusiveMinimum: 10,
                exclusiveMaximum: 100
            };
            const result = callAdjustNumberToConstraints(50, schemaObj);

            expect(result).toBe(50);
        });

        it("should round result to 3 significant digits", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 10,
                maximum: 100
            };

            const result = callAdjustNumberToConstraints(5, schemaObj);
            // Should be rounded to 3 significant digits
            expect(result.toString()).toMatch(/^\d+\.?\d*$/);
            expect(result.toString().length).toBeLessThanOrEqual(4); // 3 digits + potential decimal
        });

        it("should handle edge case with exclusiveMinimum boolean and no minimum", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                exclusiveMinimum: true
            };
            const result = callAdjustNumberToConstraints(5, schemaObj);

            // Should return original number since no minimum is defined
            expect(result).toBe(5);
        });

        it("should handle edge case with exclusiveMaximum boolean and no maximum", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                exclusiveMaximum: true
            };
            const result = callAdjustNumberToConstraints(150, schemaObj);

            // Should return original number since no maximum is defined
            expect(result).toBe(150);
        });

        it("should handle zero values correctly", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 0,
                maximum: 10
            };
            const result = callAdjustNumberToConstraints(-5, schemaObj);

            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(10);
        });

        it("should handle negative numbers with constraints", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: -10,
                maximum: -5
            };
            const result = callAdjustNumberToConstraints(-15, schemaObj);

            expect(result).toBeGreaterThanOrEqual(-10);
            expect(result).toBeLessThanOrEqual(-5);
        });

        it("should handle very small numbers with precision", () => {
            const schemaObj: OpenAPIV3_1.SchemaObject = {
                type: "number",
                minimum: 0.001,
                maximum: 0.01
            };
            const result = callAdjustNumberToConstraints(0.0001, schemaObj);

            expect(result).toBeGreaterThanOrEqual(0.001);
            expect(result).toBeLessThanOrEqual(0.01);
        });
    });

    describe("additionalProperties", () => {
        it("should preserve additional properties when additionalProperties is true", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" },
                    slug: { type: "string" }
                },
                required: ["name", "slug"],
                additionalProperties: true
            };

            const example = {
                name: "My Item",
                slug: "my-item",
                customField: "custom value",
                anotherField: 42
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual({
                name: "My Item",
                slug: "my-item",
                customField: "custom value",
                anotherField: 42
            });
            expect(result.errors).toHaveLength(0);
        });

        it("should reject additional properties when additionalProperties is false", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: false
            };

            const example = {
                name: "My Item",
                extraField: "should not be allowed"
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]?.message).toContain("extraField");
        });

        it("should preserve additional properties with various types when additionalProperties is true", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: true
            };

            const example = {
                name: "Test",
                stringField: "hello",
                numberField: 123,
                booleanField: true,
                arrayField: [1, 2, 3],
                objectField: { nested: "value" }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is a string schema", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    id: { type: "string" }
                },
                required: ["id"],
                additionalProperties: { type: "string" }
            };

            const example = {
                id: "123",
                customField1: "value1",
                customField2: "value2"
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is a number schema", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: { type: "number" }
            };

            const example = {
                name: "Metrics",
                score: 95.5,
                count: 42,
                rating: 4.8
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is an object schema", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: {
                    type: "object",
                    properties: {
                        value: { type: "string" }
                    }
                }
            };

            const example = {
                name: "Container",
                metadata1: { value: "first" },
                metadata2: { value: "second", extra: "data" }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is an array schema", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: {
                    type: "array",
                    items: { type: "string" }
                }
            };

            const example = {
                name: "Lists",
                tags: ["tag1", "tag2"],
                categories: ["cat1", "cat2", "cat3"]
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is an empty object (any type)", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: {}
            };

            const example = {
                name: "Flexible",
                stringProp: "hello",
                numberProp: 42,
                boolProp: true,
                arrayProp: [1, 2, 3],
                objectProp: { nested: "value" }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve additional properties when additionalProperties is undefined (default allows)", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"]
            };

            const example = {
                name: "Default",
                extraField: "should be preserved"
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should preserve nested additional properties in fieldData-like structures", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    id: { type: "string" },
                    fieldData: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            slug: { type: "string" }
                        },
                        required: ["name", "slug"],
                        additionalProperties: true
                    }
                },
                required: ["id", "fieldData"]
            };

            const example = {
                id: "123",
                fieldData: {
                    name: "Test Item",
                    slug: "test-item",
                    "plain-text": "Some text content",
                    "rich-text": "<p>HTML content</p>",
                    "main-image": {
                        fileId: "abc123",
                        url: "/files/abc123.png"
                    },
                    "is-featured": true,
                    "view-count": 42
                }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual(example);
            expect(result.errors).toHaveLength(0);
        });

        it("should report error when additionalProperties is string schema but example contains array", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    id: { type: "string" }
                },
                required: ["id"],
                additionalProperties: { type: "string" }
            };

            const example = {
                id: "123",
                invalidField: ["not", "a", "string"]
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should coerce number to string when additionalProperties is string schema", () => {
            // Numbers can be coerced to strings, so this should be valid with coercion
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    id: { type: "string" }
                },
                required: ["id"],
                additionalProperties: { type: "string" }
            };

            const example = {
                id: "123",
                coercedField: 42
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            // Numbers are coerced to strings, so this is valid
            expect(result.isValid).toBe(true);
            expect(result.validExample).toEqual({
                id: "123",
                coercedField: "42"
            });
        });

        it("should report error when additionalProperties is number schema but example contains string", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: { type: "number" }
            };

            const example = {
                name: "Test",
                invalidField: "not a number"
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should report error when additionalProperties is object schema with required fields but example contains string", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: {
                    type: "object",
                    properties: {
                        value: { type: "string" }
                    },
                    required: ["value"]
                }
            };

            const example = {
                name: "Test",
                invalidField: "not an object"
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should report error when additionalProperties is array schema but example contains object", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: {
                    type: "array",
                    items: { type: "string" }
                }
            };

            const example = {
                name: "Test",
                invalidField: { not: "an array" }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should report error when additionalProperties is boolean schema but example contains array", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: { type: "boolean" }
            };

            const example = {
                name: "Test",
                invalidField: [1, 2, 3]
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should report multiple errors when multiple additional properties have type mismatches", () => {
            // Using number schema since strings/numbers/booleans can be coerced to strings
            // but arrays/objects/strings cannot be coerced to numbers
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" }
                },
                required: ["name"],
                additionalProperties: { type: "number" }
            };

            const example = {
                name: "Test",
                invalidField1: "not a number",
                invalidField2: ["array"],
                invalidField3: { object: true }
            };

            const mockContextWithResolve = {
                ...mockContext,
                resolveMaybeReference: vi.fn().mockImplementation(({ schemaOrReference }) => schemaOrReference)
            } as unknown as AbstractConverterContext<object>;

            const converter = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example
            });

            const result = converter.convert();

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe("anyOf unions", () => {
        const mockContextWithResolve = {
            ...mockContext,
            resolveMaybeReference: vi
                .fn()
                .mockImplementation(({ schemaOrReference }: { schemaOrReference: unknown }) => schemaOrReference)
        } as unknown as AbstractConverterContext<object>;

        it("should select the correct variant when example matches a non-first anyOf variant", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["waiting"], default: "waiting" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["progress"], default: "progress" },
                            total: { type: "number" },
                            done: { type: "number" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["success"], default: "success" },
                            uuid: { type: "string" }
                        }
                    }
                ]
            };

            const progressExample = { status: "progress", total: 732434, done: 134427 };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: progressExample
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(true);
            expect(result.validExample).toEqual(expect.objectContaining({ status: "progress" }));
        });

        it("should select the last variant when example matches only the last anyOf variant", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["waiting"], default: "waiting" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["error"], default: "error" },
                            error: { type: "string" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["unknown"], default: "unknown" }
                        }
                    }
                ]
            };

            const unknownExample = { status: "unknown" };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: unknownExample
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(true);
            expect(result.validExample).toEqual(expect.objectContaining({ status: "unknown" }));
        });

        it("should fall back to first valid variant when example matches no variant", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["waiting"], default: "waiting" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["progress"], default: "progress" }
                        }
                    }
                ]
            };

            const nomatchExample = { status: "nonexistent" };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: nomatchExample
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(false);
        });

        it("should validate null example against anyOf with null type variant", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                anyOf: [{ type: "string" }, { type: "null" }]
            };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: null
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(true);
            expect(result.validExample).toBeNull();
        });

        it("should validate null example in an object property with anyOf string/null", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" },
                    query: {
                        anyOf: [{ type: "string" }, { type: "null" }]
                    }
                },
                required: ["name", "query"]
            };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: { name: "test", query: null }
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(true);
            expect(result.validExample).toEqual({ name: "test", query: null });
        });

        it("should produce a valid result when no example is provided (auto-generation)", () => {
            const schema: OpenAPIV3_1.SchemaObject = {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["waiting"], default: "waiting" }
                        }
                    },
                    {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["progress"], default: "progress" }
                        }
                    }
                ]
            };

            const conv = new ExampleConverter({
                breadcrumbs: [],
                context: mockContextWithResolve,
                schema,
                example: undefined
            });

            const result = conv.convert();

            expect(result.isValid).toBe(true);
            expect(result.usedProvidedExample).toBe(false);
        });
    });
});
