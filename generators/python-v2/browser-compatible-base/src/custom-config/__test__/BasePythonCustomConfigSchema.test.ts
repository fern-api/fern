import { describe, expect, it } from "vitest";

import { BasePythonCustomConfigSchema, resolveTimeout } from "../BasePythonCustomConfigSchema.js";

describe("BasePythonCustomConfigSchema timeout", () => {
    it("accepts the new `timeout` key", () => {
        const config = BasePythonCustomConfigSchema.parse({ timeout: 30 });
        expect(config.timeout).toBe(30);
    });

    it("accepts the deprecated `timeout_in_seconds` key for backwards compatibility", () => {
        const config = BasePythonCustomConfigSchema.parse({ timeout_in_seconds: 45 });
        expect(config.timeout_in_seconds).toBe(45);
    });

    it("accepts the `infinity` literal for both keys", () => {
        expect(BasePythonCustomConfigSchema.parse({ timeout: "infinity" }).timeout).toBe("infinity");
        expect(BasePythonCustomConfigSchema.parse({ timeout_in_seconds: "infinity" }).timeout_in_seconds).toBe(
            "infinity"
        );
    });
});

describe("resolveTimeout", () => {
    it("prefers `timeout` over `timeout_in_seconds`", () => {
        expect(resolveTimeout({ timeout: 30, timeout_in_seconds: 60 })).toBe(30);
    });

    it("falls back to `timeout_in_seconds` when `timeout` is absent", () => {
        expect(resolveTimeout({ timeout_in_seconds: 60 })).toBe(60);
    });

    it("does not convert the unit (both are seconds)", () => {
        expect(resolveTimeout({ timeout: 15 })).toBe(15);
        expect(resolveTimeout({ timeout_in_seconds: 15 })).toBe(15);
    });

    it("preserves the `infinity` literal", () => {
        expect(resolveTimeout({ timeout: "infinity" })).toBe("infinity");
        expect(resolveTimeout({ timeout_in_seconds: "infinity" })).toBe("infinity");
    });

    it("returns undefined when neither key is set", () => {
        expect(resolveTimeout({})).toBeUndefined();
    });
});
