import { describe, expect, it } from "vitest";

import { OpenApiSpecSchema } from "../OpenApiSpecSchema.js";

describe("OpenApiSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                openapi: "./api.yml",
                overrides: "./overrides.yml"
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                openapi: "./api.yml",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept undefined overrides", () => {
            const input = {
                openapi: "./api.yml"
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should reject empty array for overrides", () => {
            const input = {
                openapi: "./api.yml",
                overrides: []
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(false);
        });

        it("should accept single-element array for overrides", () => {
            const input = {
                openapi: "./api.yml",
                overrides: ["./single.yml"]
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should reject non-string array elements", () => {
            const input = {
                openapi: "./api.yml",
                overrides: [123]
            };
            const result = OpenApiSpecSchema.safeParse(input);
            expect(result.success).toBe(false);
        });
    });
});
