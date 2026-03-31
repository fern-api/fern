import type { Logger } from "@fern-api/logger";
import { PrimitiveSchemaValueWithExample, SchemaWithExample } from "@fern-api/openapi-ir";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../../../options.js";
import type { SchemaParserContext } from "../../SchemaParserContext.js";
import { ExampleTypeFactory } from "../ExampleTypeFactory.js";

function createMockLogger(): Logger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
}

function createMockContext(logger: Logger): SchemaParserContext {
    const ctx: SchemaParserContext = {
        logger,
        DUMMY: undefined as unknown as SchemaParserContext,
        options: DEFAULT_PARSE_OPENAPI_SETTINGS,
        referenceExists: () => false,
        resolveSchemaReference: () => ({}) as never,
        resolveGroupName: (name) => name,
        markSchemaAsReferencedByNonRequest: () => {
            /* noop */
        },
        markSchemaAsReferencedByRequest: () => {
            /* noop */
        },
        markReferencedByDiscriminatedUnion: () => {
            /* noop */
        },
        markSchemaWithDiscriminantValue: () => {
            /* noop */
        },
        getNamespace: () => undefined
    };
    ctx.DUMMY = ctx;
    return ctx;
}

function makePrimitiveSchema(primitiveValue: PrimitiveSchemaValueWithExample): SchemaWithExample {
    return SchemaWithExample.primitive({
        schema: primitiveValue,
        description: undefined,
        availability: undefined,
        generatedName: "TestSchema",
        nameOverride: undefined,
        groupName: undefined,
        namespace: undefined,
        title: undefined
    });
}

function makeEnumSchema(values: string[]): SchemaWithExample {
    return SchemaWithExample.enum({
        values: values.map((v) => ({
            value: v,
            description: undefined,
            availability: undefined,
            nameOverride: undefined,
            generatedName: v,
            casing: { snake: v, screamingSnake: v.toUpperCase(), camel: v, pascal: v }
        })),
        description: undefined,
        availability: undefined,
        generatedName: "TestEnum",
        nameOverride: undefined,
        groupName: undefined,
        namespace: undefined,
        default: undefined,
        example: undefined,
        source: undefined,
        title: undefined,
        inline: undefined
    });
}

const DEFAULT_OPTIONS: ExampleTypeFactory.Options = {
    ignoreOptionals: false,
    isParameter: false
};

describe("ExampleTypeFactory", () => {
    let mockLogger: Logger;
    let factory: ExampleTypeFactory;

    beforeEach(() => {
        mockLogger = createMockLogger();
        const context = createMockContext(mockLogger);
        factory = new ExampleTypeFactory({}, new Set(), context);
    });

    describe("primitive type mismatch warnings", () => {
        it("should warn when string schema receives a number example", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: 42,
                options: { ...DEFAULT_OPTIONS, name: "myField" }
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("Invalid example for 'myField'"));
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("expected string but got number"));
            // Should still return a fallback value
            expect(result).toBeDefined();
        });

        it("should warn when boolean schema receives a string example", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.boolean({
                    default: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "not-a-boolean",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("expected boolean but got string"));
            expect(result).toBeDefined();
        });

        it("should warn when int schema receives a string example", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.int({
                    default: undefined,
                    minimum: undefined,
                    maximum: undefined,
                    exclusiveMinimum: undefined,
                    exclusiveMaximum: undefined,
                    multipleOf: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "not-a-number",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(mockLogger.warn).toHaveBeenCalledWith(
                expect.stringContaining("expected number (int) but got string")
            );
            expect(result).toBeDefined();
        });

        it("should NOT warn when valid string example is provided", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "valid-string",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result?.type).toBe("primitive");
        });

        it("should NOT warn when valid number example is provided", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.double({
                    default: undefined,
                    minimum: undefined,
                    maximum: undefined,
                    exclusiveMinimum: undefined,
                    exclusiveMaximum: undefined,
                    multipleOf: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: 3.14,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should NOT warn when example is undefined (auto-generated)", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: undefined,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should NOT warn when example is null (treated same as undefined)", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: null,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should preserve falsy schema.example=false via ?? operator", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.boolean({
                    default: undefined,
                    example: false
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "wrong-type",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(result).toBeDefined();
            // The ?? operator should preserve `false` (not fall through to Examples.BOOLEAN)
            if (result?.type === "primitive" && result.value.type === "boolean") {
                expect(result.value.value).toBe(false);
            }
        });

        it("should preserve falsy schema.example=0 via ?? operator", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.int({
                    default: undefined,
                    minimum: undefined,
                    maximum: undefined,
                    exclusiveMinimum: undefined,
                    exclusiveMaximum: undefined,
                    multipleOf: undefined,
                    example: 0
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "wrong-type",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(result).toBeDefined();
            // The ?? operator should preserve `0` (not fall through to Examples.INT)
            if (result?.type === "primitive" && result.value.type === "int") {
                expect(result.value.value).toBe(0);
            }
        });

        it("should use schema.example as fallback when example type mismatches", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: "schema-level-example"
                })
            );

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: 42,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(result).toBeDefined();
            if (result?.type === "primitive" && result.value.type === "string") {
                expect(result.value.value).toBe("schema-level-example");
            }
        });
    });

    describe("enum mismatch warnings", () => {
        it("should warn when enum receives an invalid value", () => {
            const schema = makeEnumSchema(["active", "inactive", "pending"]);

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "invalid_value",
                options: { ...DEFAULT_OPTIONS, name: "status" }
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("not a valid enum value"));
            expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("active, inactive, pending"));
            expect(result).toBeDefined();
        });

        it("should NOT warn when enum receives a valid value", () => {
            const schema = makeEnumSchema(["active", "inactive", "pending"]);

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: "active",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).not.toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result?.type).toBe("enum");
            if (result?.type === "enum") {
                expect(result.value).toBe("active");
            }
        });

        it("should warn when enum receives a non-string value", () => {
            const schema = makeEnumSchema(["active", "inactive"]);

            const result = factory.buildExample({
                schema,
                exampleId: undefined,
                example: 123,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            expect(result).toBeDefined();
        });
    });

    describe("warning message truncation", () => {
        it("should truncate large example values in warning messages", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    example: undefined
                })
            );

            // Create a deeply nested object that will produce verbose JSON
            const largeExample = {
                deeply: {
                    nested: {
                        object: {
                            with: {
                                many: {
                                    levels: "this is a very long value that should be truncated in the warning message"
                                }
                            }
                        }
                    }
                }
            };

            factory.buildExample({
                schema,
                exampleId: undefined,
                example: largeExample,
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            const warnMsg = (mockLogger.warn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
            // The JSON.stringify of largeExample is > 100 chars, so it should be truncated
            expect(warnMsg).toContain("...");
        });

        it("should not truncate small example values", () => {
            const schema = makePrimitiveSchema(
                PrimitiveSchemaValueWithExample.boolean({
                    default: undefined,
                    example: undefined
                })
            );

            factory.buildExample({
                schema,
                exampleId: undefined,
                example: "short",
                options: DEFAULT_OPTIONS
            });

            expect(mockLogger.warn).toHaveBeenCalledOnce();
            const warnMsg = (mockLogger.warn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
            expect(warnMsg).toContain('"short"');
            expect(warnMsg).not.toContain("...");
        });
    });
});
