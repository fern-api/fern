import { OpenAPIV3_1 } from "openapi-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AbstractConverterContext } from "../../AbstractConverterContext";
import { ExampleConverter } from "../ExampleConverter";

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
});
