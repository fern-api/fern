import { describe, expect, it } from "vitest";
import { CsharpConfigSchema } from "../CsharpConfigSchema.js";

describe("C# server-url-variables config", () => {
    it("should accept server-url-variables set to true", () => {
        const result = CsharpConfigSchema.safeParse({ "server-url-variables": true });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["server-url-variables"]).toBe(true);
        }
    });

    it("should accept server-url-variables set to false", () => {
        const result = CsharpConfigSchema.safeParse({ "server-url-variables": false });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["server-url-variables"]).toBe(false);
        }
    });

    it("should accept config without server-url-variables (optional, defaults are applied downstream)", () => {
        const result = CsharpConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["server-url-variables"]).toBeUndefined();
        }
    });

    it("should reject non-boolean server-url-variables", () => {
        const result = CsharpConfigSchema.safeParse({ "server-url-variables": "true" });
        expect(result.success).toBe(false);
    });
});
