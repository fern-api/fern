import { describe, expect, it } from "vitest";
import { deriveSkipCommit, resolveBranchAction, shouldPushGenerationBaseTag } from "../pipeline/steps/GithubStep.js";
import type { ReplayStepResult } from "../pipeline/types.js";

describe("deriveSkipCommit", () => {
    const base: ReplayStepResult = {
        executed: true,
        success: true,
        patchesDetected: 0,
        patchesApplied: 0,
        patchesWithConflicts: 0
    };

    it("returns false when replay did not run", () => {
        expect(deriveSkipCommit(undefined)).toBe(false);
        expect(deriveSkipCommit({ ...base, executed: false, flow: "no-patches" })).toBe(false);
    });

    it("returns false when flow is missing", () => {
        expect(deriveSkipCommit({ ...base })).toBe(false);
    });

    it("non-first-generation flows skip the GithubStep commit (unchanged behavior)", () => {
        expect(deriveSkipCommit({ ...base, flow: "no-patches" })).toBe(true);
        expect(deriveSkipCommit({ ...base, flow: "normal-regeneration" })).toBe(true);
        expect(deriveSkipCommit({ ...base, flow: "skip-application" })).toBe(true);
        // replayCommitted does not change the outcome for these flows.
        expect(deriveSkipCommit({ ...base, flow: "no-patches", replayCommitted: false })).toBe(true);
    });

    it("first-generation skips ONLY when the lock is reported committed", () => {
        // Engine seeded and committed the lock — GithubStep must not commit
        // again (its sweep would be empty; branchAction becomes replay-branch).
        expect(deriveSkipCommit({ ...base, flow: "first-generation", replayCommitted: true })).toBe(true);
        // Engine predates seeding (lock untracked) or stageOnly: GithubStep's
        // commit must sweep the lock or it is lost on push.
        expect(deriveSkipCommit({ ...base, flow: "first-generation" })).toBe(false);
        expect(deriveSkipCommit({ ...base, flow: "first-generation", replayCommitted: false })).toBe(false);
    });
});

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
