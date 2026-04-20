import { describe, expect, it } from "vitest";
import { resolveBranchAction, shouldPushGenerationBaseTag } from "../pipeline/steps/GithubStep.js";
import type { ReplayStepResult } from "../pipeline/types.js";

describe("resolveBranchAction", () => {
    describe("automation mode", () => {
        it("creates new branch from head when skipCommit is false", () => {
            expect(
                resolveBranchAction({
                    automationMode: true,
                    skipCommit: false,
                    existingPR: null
                })
            ).toBe("create-from-head");
        });

        it("uses replay branch when skipCommit is true", () => {
            expect(
                resolveBranchAction({
                    automationMode: true,
                    skipCommit: true,
                    existingPR: null
                })
            ).toBe("replay-branch");
        });
    });

    describe("non-automation mode, no existing PR", () => {
        it("creates new branch from head when skipCommit is false", () => {
            expect(
                resolveBranchAction({
                    automationMode: false,
                    skipCommit: false,
                    existingPR: null
                })
            ).toBe("create-from-head");
        });

        it("uses replay branch when skipCommit is true", () => {
            expect(
                resolveBranchAction({
                    automationMode: false,
                    skipCommit: true,
                    existingPR: null
                })
            ).toBe("replay-branch");
        });
    });

    describe("non-automation mode, existing PR", () => {
        const existingPR = { headBranch: "fern-bot/existing" };

        it("checks out remote branch when skipCommit is false", () => {
            expect(
                resolveBranchAction({
                    automationMode: false,
                    skipCommit: false,
                    existingPR
                })
            ).toBe("checkout-remote");
        });

        it("uses replay branch when skipCommit is true, even with existing PR", () => {
            expect(
                resolveBranchAction({
                    automationMode: false,
                    skipCommit: true,
                    existingPR
                })
            ).toBe("replay-branch");
        });
    });

    describe("edge cases", () => {
        it("handles undefined existingPR same as null", () => {
            expect(
                resolveBranchAction({
                    automationMode: false,
                    skipCommit: false,
                    existingPR: undefined
                })
            ).toBe("create-from-head");
        });
    });
});

describe("shouldPushGenerationBaseTag", () => {
    const baseResult: ReplayStepResult = { executed: true, success: true };

    it("returns false when replayResult is undefined", () => {
        expect(shouldPushGenerationBaseTag(undefined)).toBe(false);
    });

    it("returns false when patchesWithConflicts is missing", () => {
        expect(shouldPushGenerationBaseTag(baseResult)).toBe(false);
    });

    it("returns false on a clean replay (patchesWithConflicts === 0)", () => {
        expect(shouldPushGenerationBaseTag({ ...baseResult, patchesWithConflicts: 0 })).toBe(false);
    });

    it("returns true when there is a single conflict", () => {
        expect(shouldPushGenerationBaseTag({ ...baseResult, patchesWithConflicts: 1 })).toBe(true);
    });

    it("returns true when there are multiple conflicts", () => {
        expect(shouldPushGenerationBaseTag({ ...baseResult, patchesWithConflicts: 5 })).toBe(true);
    });
});
