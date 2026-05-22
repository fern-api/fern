import { describe, expect, it } from "vitest";
import { resolveBranchAction, shouldPushGenerationBaseTag } from "../pipeline/steps/GithubStep.js";
import type { ReplayStepResult } from "../pipeline/types.js";

describe("resolveBranchAction", () => {
    it("creates new branch from head when skipCommit is false", () => {
        expect(
            resolveBranchAction({
                skipCommit: false
            })
        ).toBe("create-from-head");
    });

    it("uses replay branch when skipCommit is true", () => {
        expect(
            resolveBranchAction({
                skipCommit: true
            })
        ).toBe("replay-branch");
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
