import { describe, expect, it } from "vitest";

import { formatInitError } from "../formatInitError.js";

describe("formatInitError", () => {
    it("returns the message of an Error instance", () => {
        expect(formatInitError(new Error("boom"))).toBe("boom");
    });

    it("returns string throws as-is", () => {
        expect(formatInitError("kaboom")).toBe("kaboom");
    });

    it("serializes plain objects to JSON instead of returning [object Object]", () => {
        expect(formatInitError({ code: "FDR_TIMEOUT", attempt: 3 })).toBe('{"code":"FDR_TIMEOUT","attempt":3}');
    });

    it("falls back to Object.prototype.toString for empty objects", () => {
        // `{}` serializes to `"{}"` which is not informative; fall through to
        // toString so users see at least the type tag.
        expect(formatInitError({})).toBe("[object Object]");
    });

    it("falls back to Object.prototype.toString when JSON.stringify throws", () => {
        const circular: Record<string, unknown> = {};
        circular.self = circular;
        expect(formatInitError(circular)).toBe("[object Object]");
    });

    it("does not crash on null or undefined", () => {
        expect(formatInitError(null)).toBe("null");
        expect(formatInitError(undefined)).toBe("[object Undefined]");
    });
});
