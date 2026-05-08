import { describe, expect, it } from "vitest";
import { CsharpConfigSchema } from "../CsharpConfigSchema.js";

describe("C# default-timeout-in-seconds config", () => {
    it("should accept a positive number", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 60 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(60);
        }
    });

    it("should accept fractional seconds", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 1.5 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(1.5);
        }
    });

    it("should accept the literal 'infinity'", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": "infinity" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe("infinity");
        }
    });

    it("should accept config without the option (optional)", () => {
        const result = CsharpConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBeUndefined();
        }
    });

    it("should reject zero", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 0 });
        expect(result.success).toBe(false);
    });

    it("should reject negative numbers", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": -1 });
        expect(result.success).toBe(false);
    });

    it("should reject other strings", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": "60" });
        expect(result.success).toBe(false);
    });
});
