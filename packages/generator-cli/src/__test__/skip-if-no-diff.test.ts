import { describe, expect, it } from "vitest";
import { shouldCheckNoDiff } from "../pipeline/steps/GithubStep.js";

describe("shouldCheckNoDiff", () => {
    it("returns true when skipIfNoDiff is true", () => {
        expect(shouldCheckNoDiff({ skipIfNoDiff: true })).toBe(true);
    });

    it("returns false when skipIfNoDiff is false", () => {
        expect(shouldCheckNoDiff({ skipIfNoDiff: false })).toBe(false);
    });

    it("returns false when skipIfNoDiff is undefined", () => {
        expect(shouldCheckNoDiff({})).toBe(false);
    });

    it("is decoupled from automationMode: skipIfNoDiff=true, automationMode=false skips", () => {
        // The no-diff check runs purely based on skipIfNoDiff regardless of automationMode.
        // Callers (e.g. `fern generate --skip-if-no-diff`) can opt in without enabling automationMode.
        const config = { skipIfNoDiff: true, automationMode: false };
        expect(shouldCheckNoDiff(config)).toBe(true);
    });

    it("is decoupled from automationMode: skipIfNoDiff=false, automationMode=true does NOT skip", () => {
        // Proves the old behavior (automationMode implying no-diff skip) is no longer coupled.
        // Callers that want automation without the no-diff skip can do so by omitting skipIfNoDiff.
        const config = { skipIfNoDiff: false, automationMode: true };
        expect(shouldCheckNoDiff(config)).toBe(false);
    });

    it("respects skipIfNoDiff alone regardless of other config fields", () => {
        expect(
            shouldCheckNoDiff({
                skipIfNoDiff: true,
                automationMode: true,
                autoMerge: true,
                hasBreakingChanges: true
            })
        ).toBe(true);
    });
});
