import { describe, expect, it } from "vitest";
import { areRetriesDisabled } from "../are-retries-disabled.js";

describe("areRetriesDisabled", () => {
    it("returns false when the endpoint has no retries configuration", () => {
        expect(areRetriesDisabled(undefined)).toBe(false);
    });

    it("returns false when disabled is not set", () => {
        expect(areRetriesDisabled({ disabled: undefined })).toBe(false);
    });

    it("returns false when disabled is false", () => {
        expect(areRetriesDisabled({ disabled: false })).toBe(false);
    });

    it("returns true when disabled is true", () => {
        expect(areRetriesDisabled({ disabled: true })).toBe(true);
    });
});
