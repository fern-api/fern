import { describe, expect, it } from "vitest";
import { areRetriesDisabled } from "../areRetriesDisabled.js";

describe("areRetriesDisabled", () => {
    it("returns true when the endpoint disables retries", () => {
        expect(areRetriesDisabled({ retries: { disabled: true } })).toBe(true);
    });

    it("returns false when the endpoint explicitly enables retries", () => {
        expect(areRetriesDisabled({ retries: { disabled: false } })).toBe(false);
    });

    it("returns false when the endpoint omits the disabled flag", () => {
        expect(areRetriesDisabled({ retries: { disabled: undefined } })).toBe(false);
    });

    it("returns false when the endpoint has no retries configuration", () => {
        expect(areRetriesDisabled({ retries: undefined })).toBe(false);
    });
});
