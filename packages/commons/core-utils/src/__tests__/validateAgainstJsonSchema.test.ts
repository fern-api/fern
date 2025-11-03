import { JSONSchema4 } from "json-schema";

import { validateAgainstJsonSchema } from "../validateAgainstJsonSchema";

describe("validateAgainstJsonSchema", () => {
    const schema: JSONSchema4 = {
        type: "object",
        properties: {
            name: { type: "string" },
            age: { type: "number" },
            email: { type: "string" }
        },
        required: ["name", "age"]
    };

    it("should return success for valid data", () => {
        const validData = {
            name: "John Doe",
            age: 30,
            email: "john@example.com"
        };

        const result = validateAgainstJsonSchema(validData, schema);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validData);
        }
    });

    it("should return failure for invalid data", () => {
        const invalidData = {
            name: "Jane Doe",
            age: "25" // age should be a number
        };

        const result = validateAgainstJsonSchema(invalidData, schema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeDefined();
        }
    });

    it("should return failure when required fields are missing", () => {
        const incompleteData = {
            name: "Alice"
            // missing required 'age' field
        };

        const result = validateAgainstJsonSchema(incompleteData, schema);
        expect(result.success).toBe(false);
        if (!result.success) {
            console.log(result.error);
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBeDefined();
            expect(result.error?.params?.missingProperty).toBe("age");
        }
    });

    it("should include path in error message for missing required property", () => {
        const incompleteData = {
            name: "Alice"
        };

        const result = validateAgainstJsonSchema(incompleteData, schema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.age");
            expect(result.error?.message).toContain("Missing required property");
        }
    });

    it("should include path in error message for additional property", () => {
        const schemaWithNoAdditional: JSONSchema4 = {
            type: "object",
            properties: {
                name: { type: "string" }
            },
            additionalProperties: false
        };

        const dataWithExtra = {
            name: "Alice",
            extra: "value"
        };

        const result = validateAgainstJsonSchema(dataWithExtra, schemaWithNoAdditional);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.extra");
            expect(result.error?.message).toContain("Unexpected property");
        }
    });

    it("should include path in error message for type mismatch", () => {
        const invalidData = {
            name: "Jane Doe",
            age: "25"
        };

        const result = validateAgainstJsonSchema(invalidData, schema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.age");
            expect(result.error?.message).toContain("Incorrect type");
            expect(result.error?.message).toContain("expected number");
            expect(result.error?.message).toContain("received string");
        }
    });

    it("should include path in error message for nested properties", () => {
        const nestedSchema: JSONSchema4 = {
            type: "object",
            properties: {
                person: {
                    type: "object",
                    properties: {
                        address: {
                            type: "object",
                            properties: {
                                city: { type: "string" }
                            },
                            required: ["city"]
                        }
                    }
                }
            }
        };

        const invalidNested = {
            person: {
                address: {}
            }
        };

        const result = validateAgainstJsonSchema(invalidNested, nestedSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.person.address.city");
            expect(result.error?.message).toContain("Missing required property");
        }
    });

    it("should include path in error message for array elements", () => {
        const arraySchema: JSONSchema4 = {
            type: "object",
            properties: {
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            value: { type: "number" }
                        }
                    }
                }
            }
        };

        const invalidArray = {
            items: [{ value: 1 }, { value: "two" }]
        };

        const result = validateAgainstJsonSchema(invalidArray, arraySchema);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error?.message).toContain("$.items[1].value");
            expect(result.error?.message).toContain("Incorrect type");
        }
    });
});
