import { describe, expect, it } from "vitest";
import { resolveTimeoutInMilliseconds, TypescriptCustomConfigSchema } from "../TypescriptCustomConfigSchema.js";

describe("TypeScript defaultTimeout config", () => {
    describe("schema validation", () => {
        it("should accept a numeric defaultTimeout (milliseconds)", () => {
            const result = TypescriptCustomConfigSchema.safeParse({ defaultTimeout: 30000 });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.defaultTimeout).toBe(30000);
            }
        });

        it('should accept "infinity" as defaultTimeout', () => {
            const result = TypescriptCustomConfigSchema.safeParse({ defaultTimeout: "infinity" });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.defaultTimeout).toBe("infinity");
            }
        });

        it("should accept config without defaultTimeout (optional)", () => {
            const result = TypescriptCustomConfigSchema.safeParse({});
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.defaultTimeout).toBeUndefined();
            }
        });

        it("should reject a non-numeric, non-infinity defaultTimeout", () => {
            const result = TypescriptCustomConfigSchema.safeParse({ defaultTimeout: "30s" });
            expect(result.success).toBe(false);
        });

        it("should still accept the deprecated defaultTimeoutInSeconds", () => {
            const result = TypescriptCustomConfigSchema.safeParse({ defaultTimeoutInSeconds: 30 });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.defaultTimeoutInSeconds).toBe(30);
            }
        });

        it("should still accept the deprecated timeoutInSeconds", () => {
            const result = TypescriptCustomConfigSchema.safeParse({ timeoutInSeconds: 30 });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.timeoutInSeconds).toBe(30);
            }
        });
    });

    describe("resolveTimeoutInMilliseconds precedence", () => {
        it("returns undefined when no timeout is configured", () => {
            expect(resolveTimeoutInMilliseconds({})).toBeUndefined();
            expect(resolveTimeoutInMilliseconds(undefined)).toBeUndefined();
        });

        it("uses defaultTimeout as-is (already milliseconds)", () => {
            expect(resolveTimeoutInMilliseconds({ defaultTimeout: 45000 })).toBe(45000);
        });

        it("converts deprecated defaultTimeoutInSeconds to milliseconds", () => {
            expect(resolveTimeoutInMilliseconds({ defaultTimeoutInSeconds: 30 })).toBe(30000);
        });

        it("converts deprecated timeoutInSeconds to milliseconds", () => {
            expect(resolveTimeoutInMilliseconds({ timeoutInSeconds: 15 })).toBe(15000);
        });

        it("prefers defaultTimeout over the deprecated seconds keys", () => {
            expect(
                resolveTimeoutInMilliseconds({
                    defaultTimeout: 45000,
                    defaultTimeoutInSeconds: 30,
                    timeoutInSeconds: 15
                })
            ).toBe(45000);
        });

        it("prefers defaultTimeoutInSeconds over timeoutInSeconds", () => {
            expect(
                resolveTimeoutInMilliseconds({
                    defaultTimeoutInSeconds: 30,
                    timeoutInSeconds: 15
                })
            ).toBe(30000);
        });

        it('preserves "infinity" from defaultTimeout', () => {
            expect(resolveTimeoutInMilliseconds({ defaultTimeout: "infinity" })).toBe("infinity");
        });

        it('preserves "infinity" from the deprecated defaultTimeoutInSeconds', () => {
            expect(resolveTimeoutInMilliseconds({ defaultTimeoutInSeconds: "infinity" })).toBe("infinity");
        });

        it('preserves "infinity" from the deprecated timeoutInSeconds', () => {
            expect(resolveTimeoutInMilliseconds({ timeoutInSeconds: "infinity" })).toBe("infinity");
        });

        it("treats defaultTimeout of 0 as an explicit value (not a fallback trigger)", () => {
            expect(resolveTimeoutInMilliseconds({ defaultTimeout: 0, defaultTimeoutInSeconds: 30 })).toBe(0);
        });
    });
});
