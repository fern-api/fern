import { describe, expect, it } from "vitest";
import { GeneratorError, resolveErrorCode, shouldReportToSentry } from "../GeneratorError.js";

describe("GeneratorError", () => {
    it("defaults unknown errors to INTERNAL_ERROR", () => {
        expect(resolveErrorCode(new Error("boom"))).toBe("INTERNAL_ERROR");
    });

    it("does not report user-facing config errors to sentry", () => {
        expect(shouldReportToSentry(GeneratorError.configError("bad config"))).toBe(false);
    });

    it("reports internal errors to sentry", () => {
        expect(shouldReportToSentry(GeneratorError.internalError("bug"))).toBe(true);
    });
});
