import { describe, expect, it } from "vitest";
import { resolveErrorCode } from "../GeneratorError.js";

describe("GeneratorError", () => {
    it("defaults unknown errors to INTERNAL_ERROR", () => {
        expect(resolveErrorCode(new Error("boom"))).toBe("INTERNAL_ERROR");
    });
});
