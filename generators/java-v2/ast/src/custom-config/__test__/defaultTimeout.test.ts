import { describe, expect, it } from "vitest";
import {
    BaseJavaCustomConfigSchema,
    defaultTimeoutToCallTimeoutSeconds,
    parseDefaultTimeout,
    resolveDefaultTimeout
} from "../BaseJavaCustomConfigSchema.js";

describe("Java v2 default-timeout config", () => {
    it("should accept default-timeout as a number of seconds", () => {
        const result = BaseJavaCustomConfigSchema.safeParse({ "default-timeout": 30 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout"]).toBe(30);
        }
    });

    it("should accept default-timeout as an ISO-8601 duration string", () => {
        const result = BaseJavaCustomConfigSchema.safeParse({ "default-timeout": "PT45S" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout"]).toBe("PT45S");
        }
    });

    it('should accept default-timeout as "infinity"', () => {
        const result = BaseJavaCustomConfigSchema.safeParse({ "default-timeout": "infinity" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout"]).toBe("infinity");
        }
    });

    it("should still accept the deprecated default-timeout-in-seconds", () => {
        const result = BaseJavaCustomConfigSchema.safeParse({ "default-timeout-in-seconds": 120 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(120);
        }
    });
});

describe("parseDefaultTimeout", () => {
    it("passes through numbers as seconds", () => {
        expect(parseDefaultTimeout(30)).toEqual({ type: "seconds", seconds: 30 });
    });

    it("truncates sub-second precision toward zero", () => {
        expect(parseDefaultTimeout(1.9)).toEqual({ type: "seconds", seconds: 1 });
        expect(parseDefaultTimeout("PT1.9S")).toEqual({ type: "seconds", seconds: 1 });
    });

    it("parses numeric strings", () => {
        expect(parseDefaultTimeout("30")).toEqual({ type: "seconds", seconds: 30 });
    });

    it("parses ISO-8601 duration strings", () => {
        expect(parseDefaultTimeout("PT30S")).toEqual({ type: "seconds", seconds: 30 });
        expect(parseDefaultTimeout("PT1M30S")).toEqual({ type: "seconds", seconds: 90 });
        expect(parseDefaultTimeout("PT2M")).toEqual({ type: "seconds", seconds: 120 });
        expect(parseDefaultTimeout("P1DT2H")).toEqual({ type: "seconds", seconds: 93600 });
    });

    it('parses "infinity" (case-insensitive)', () => {
        expect(parseDefaultTimeout("infinity")).toEqual({ type: "infinity" });
        expect(parseDefaultTimeout("Infinity")).toEqual({ type: "infinity" });
    });

    it("returns undefined for unparseable values", () => {
        expect(parseDefaultTimeout("not-a-duration")).toBeUndefined();
        expect(parseDefaultTimeout("P")).toBeUndefined();
    });
});

describe("resolveDefaultTimeout", () => {
    it("defaults to 60 seconds when neither key is set", () => {
        expect(resolveDefaultTimeout({})).toEqual({ type: "seconds", seconds: 60 });
        expect(resolveDefaultTimeout(undefined)).toEqual({ type: "seconds", seconds: 60 });
    });

    it("uses the deprecated key when only it is set", () => {
        expect(resolveDefaultTimeout({ "default-timeout-in-seconds": 120 })).toEqual({ type: "seconds", seconds: 120 });
    });

    it("uses the new key when set (number)", () => {
        expect(resolveDefaultTimeout({ "default-timeout": 30 })).toEqual({ type: "seconds", seconds: 30 });
    });

    it("uses the new key when set (ISO-8601 string)", () => {
        expect(resolveDefaultTimeout({ "default-timeout": "PT45S" })).toEqual({ type: "seconds", seconds: 45 });
    });

    it('resolves "infinity" to disable the timeout', () => {
        expect(resolveDefaultTimeout({ "default-timeout": "infinity" })).toEqual({ type: "infinity" });
    });

    it("prefers the new key over the deprecated key", () => {
        expect(
            resolveDefaultTimeout({
                "default-timeout": "PT10S",
                "default-timeout-in-seconds": 120
            })
        ).toEqual({ type: "seconds", seconds: 10 });
    });

    it("falls back to the deprecated key when the new key is unparseable", () => {
        expect(
            resolveDefaultTimeout({
                "default-timeout": "not-a-duration",
                "default-timeout-in-seconds": 120
            })
        ).toEqual({ type: "seconds", seconds: 120 });
    });
});

describe("defaultTimeoutToCallTimeoutSeconds", () => {
    it("returns the seconds for a finite timeout", () => {
        expect(defaultTimeoutToCallTimeoutSeconds({ type: "seconds", seconds: 45 })).toBe(45);
    });

    it("maps infinity to 0 (disables the OkHttp callTimeout)", () => {
        expect(defaultTimeoutToCallTimeoutSeconds({ type: "infinity" })).toBe(0);
    });
});
