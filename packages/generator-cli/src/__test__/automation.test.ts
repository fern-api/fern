import { describe, expect, it } from "vitest";
import { enrichPrBodyForAutomation, shouldEnableAutomerge } from "../pipeline/steps/GithubStep.js";

describe("enrichPrBodyForAutomation", () => {
    it("returns body unchanged when automationMode is false", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: false,
            hasBreakingChanges: true,
            breakingChangesSummary: "Removed endpoint",
            runId: "abc-123"
        });
        expect(result).toBe("base body");
    });

    it("returns body unchanged when automationMode is undefined", () => {
        const result = enrichPrBodyForAutomation("base body", {});
        expect(result).toBe("base body");
    });

    it("appends breaking changes section when present", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            hasBreakingChanges: true,
            breakingChangesSummary: "Removed `POST /v1/cancel`"
        });
        expect(result).toContain("base body");
        expect(result).toContain("## ⚠️ Breaking Changes");
        expect(result).toContain("Removed `POST /v1/cancel`");
        expect(result).toContain("manual review");
    });

    it("does not append breaking changes when hasBreakingChanges is false", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            hasBreakingChanges: false,
            breakingChangesSummary: "should not appear"
        });
        expect(result).toBe("base body");
    });

    it("does not append breaking changes when summary is undefined", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            hasBreakingChanges: true,
            breakingChangesSummary: undefined
        });
        expect(result).toBe("base body");
    });

    it("appends run_id when present", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            runId: "run-456"
        });
        expect(result).toContain("Fern Run ID: `run-456`");
    });

    it("does not append run_id when undefined", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            runId: undefined
        });
        expect(result).toBe("base body");
    });

    it("appends both breaking changes and run_id", () => {
        const result = enrichPrBodyForAutomation("base body", {
            automationMode: true,
            hasBreakingChanges: true,
            breakingChangesSummary: "Type changed",
            runId: "run-789"
        });
        expect(result).toContain("Breaking Changes");
        expect(result).toContain("Type changed");
        expect(result).toContain("run-789");
        // Breaking changes should appear before run_id
        const breakingIdx = result.indexOf("Breaking Changes");
        const runIdIdx = result.indexOf("run-789");
        expect(breakingIdx).toBeLessThan(runIdIdx);
    });
});

describe("shouldEnableAutomerge", () => {
    it("returns true when automationMode + autoMerge + no breaking changes", () => {
        expect(
            shouldEnableAutomerge({
                automationMode: true,
                autoMerge: true,
                hasBreakingChanges: false
            })
        ).toBe(true);
    });

    it("returns true when hasBreakingChanges is undefined", () => {
        expect(
            shouldEnableAutomerge({
                automationMode: true,
                autoMerge: true
            })
        ).toBe(true);
    });

    it("returns false when breaking changes detected", () => {
        expect(
            shouldEnableAutomerge({
                automationMode: true,
                autoMerge: true,
                hasBreakingChanges: true
            })
        ).toBe(false);
    });

    it("returns false when autoMerge is false", () => {
        expect(
            shouldEnableAutomerge({
                automationMode: true,
                autoMerge: false,
                hasBreakingChanges: false
            })
        ).toBe(false);
    });

    it("returns false when automationMode is false", () => {
        expect(
            shouldEnableAutomerge({
                automationMode: false,
                autoMerge: true,
                hasBreakingChanges: false
            })
        ).toBe(false);
    });

    it("returns false when automationMode is undefined", () => {
        expect(
            shouldEnableAutomerge({
                autoMerge: true,
                hasBreakingChanges: false
            })
        ).toBe(false);
    });

    it("returns false when all undefined", () => {
        expect(shouldEnableAutomerge({})).toBe(false);
    });
});
