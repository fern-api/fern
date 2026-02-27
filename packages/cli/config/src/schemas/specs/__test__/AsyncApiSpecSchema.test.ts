import { describe, expect, it } from "vitest";

import { AsyncApiSpecSchema } from "../AsyncApiSpecSchema.js";

describe("AsyncApiSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                asyncapi: "./api.yml",
                overrides: "./overrides.yml"
            };
            const result = AsyncApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                asyncapi: "./api.yml",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = AsyncApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept undefined overrides", () => {
            const input = {
                asyncapi: "./api.yml"
            };
            const result = AsyncApiSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
