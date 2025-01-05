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
});
