import { describe, expect, it } from "vitest";
import { SdkCustomConfigSchema } from "../SdkCustomConfig.js";

describe("PHP SDK maxRetries config", () => {
    it("should accept valid maxRetries value", () => {
        const result = SdkCustomConfigSchema.safeParse({ maxRetries: 5 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.maxRetries).toBe(5);
        }
    });

    it("should accept zero to disable retries", () => {
        const result = SdkCustomConfigSchema.safeParse({ maxRetries: 0 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.maxRetries).toBe(0);
        }
    });

    it("should accept config without maxRetries (optional)", () => {
        const result = SdkCustomConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.maxRetries).toBeUndefined();
        }
    });

    it("should reject negative maxRetries", () => {
        const result = SdkCustomConfigSchema.safeParse({ maxRetries: -1 });
        expect(result.success).toBe(false);
    });

    it("should reject non-integer maxRetries", () => {
        const result = SdkCustomConfigSchema.safeParse({ maxRetries: 2.5 });
        expect(result.success).toBe(false);
    });

    it("should reject string maxRetries", () => {
        const result = SdkCustomConfigSchema.safeParse({ maxRetries: "2" });
        expect(result.success).toBe(false);
    });
});
