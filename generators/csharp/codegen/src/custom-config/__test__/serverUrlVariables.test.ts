import { describe, expect, it } from "vitest";
import { CsharpConfigSchema } from "../CsharpConfigSchema.js";

describe("C# serverUrlVariables config", () => {
    it("should accept serverUrlVariables set to true", () => {
        const result = CsharpConfigSchema.safeParse({ serverUrlVariables: true });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.serverUrlVariables).toBe(true);
        }
    });

    it("should accept serverUrlVariables set to false", () => {
        const result = CsharpConfigSchema.safeParse({ serverUrlVariables: false });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.serverUrlVariables).toBe(false);
        }
    });

    it("should accept config without serverUrlVariables (optional, defaults are applied downstream)", () => {
        const result = CsharpConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.serverUrlVariables).toBeUndefined();
        }
    });

    it("should reject non-boolean serverUrlVariables", () => {
        const result = CsharpConfigSchema.safeParse({ serverUrlVariables: "true" });
        expect(result.success).toBe(false);
    });
});
