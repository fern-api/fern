import { describe, expect, it } from "vitest";
import {
    BaseJavaCustomConfigSchema,
    parseDurationToSeconds,
    resolveDefaultTimeoutInSeconds
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

    it("should still accept the deprecated default-timeout-in-seconds", () => {
        const result = BaseJavaCustomConfigSchema.safeParse({ "default-timeout-in-seconds": 120 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(120);
        }
    });
});

describe("parseDurationToSeconds", () => {
    it("passes through numbers", () => {
        expect(parseDurationToSeconds(30)).toBe(30);
    });

    it("parses numeric strings", () => {
        expect(parseDurationToSeconds("30")).toBe(30);
    });

    it("parses ISO-8601 duration strings", () => {
        expect(parseDurationToSeconds("PT30S")).toBe(30);
        expect(parseDurationToSeconds("PT1M30S")).toBe(90);
        expect(parseDurationToSeconds("PT2M")).toBe(120);
        expect(parseDurationToSeconds("P1DT2H")).toBe(93600);
    });

    it("returns undefined for unparseable values", () => {
        expect(parseDurationToSeconds("not-a-duration")).toBeUndefined();
        expect(parseDurationToSeconds("P")).toBeUndefined();
    });
});

describe("resolveDefaultTimeoutInSeconds", () => {
    it("defaults to 60 when neither key is set", () => {
        expect(resolveDefaultTimeoutInSeconds({})).toBe(60);
        expect(resolveDefaultTimeoutInSeconds(undefined)).toBe(60);
    });

    it("uses the deprecated key when only it is set", () => {
        expect(resolveDefaultTimeoutInSeconds({ "default-timeout-in-seconds": 120 })).toBe(120);
    });

    it("uses the new key when set (number)", () => {
        expect(resolveDefaultTimeoutInSeconds({ "default-timeout": 30 })).toBe(30);
    });

    it("uses the new key when set (ISO-8601 string)", () => {
        expect(resolveDefaultTimeoutInSeconds({ "default-timeout": "PT45S" })).toBe(45);
    });

    it("prefers the new key over the deprecated key", () => {
        expect(
            resolveDefaultTimeoutInSeconds({
                "default-timeout": "PT10S",
                "default-timeout-in-seconds": 120
            })
        ).toBe(10);
    });
});
