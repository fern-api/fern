import { describe, expect, it } from "vitest";
import { resolveBranchAction } from "../pipeline/steps/GithubStep.js";

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
