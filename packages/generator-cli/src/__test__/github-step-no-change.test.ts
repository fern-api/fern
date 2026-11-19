import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { consolePipelineLogger } from "../pipeline/PipelineLogger.js";
import { GithubStep, shouldSkipForNoChange } from "../pipeline/steps/GithubStep.js";
import type { AutoVersionStepResult, GithubStepConfig, ReplayStepResult } from "../pipeline/types.js";

const baseConfig: GithubStepConfig = {
    enabled: true,
    uri: "owner/repo",
    token: "tkn",
    mode: "pull-request"
};

function autoVersionResult(versionBump: AutoVersionStepResult["versionBump"]): AutoVersionStepResult {
    return {
        executed: true,
        success: true,
        version: "1.3.0",
        previousVersion: "1.3.0",
        versionBump,
        commitMessage: "SDK regeneration (no semver change: FAI returned NO_CHANGE)"
    };
}

describe("shouldSkipForNoChange", () => {
    it("skips when autoversion returned NO_CHANGE", () => {
        expect(shouldSkipForNoChange(baseConfig, autoVersionResult("NO_CHANGE"))).toBe(true);
    });

    it("does not skip for a version bump", () => {
        expect(shouldSkipForNoChange(baseConfig, autoVersionResult("PATCH"))).toBe(false);
    });

    it("does not skip when autoversion did not run", () => {
        expect(shouldSkipForNoChange(baseConfig, undefined)).toBe(false);
    });

    it("does not skip when the analysis was incomplete", () => {
        const result = { ...autoVersionResult("NO_CHANGE"), analysisWarning: "1 of 3 diff chunks failed" };
        expect(shouldSkipForNoChange(baseConfig, result)).toBe(false);
    });

    it("does not skip when replay reported conflicts", () => {
        const replayResult: ReplayStepResult = { executed: true, success: true, patchesWithConflicts: 1 };
        expect(shouldSkipForNoChange(baseConfig, autoVersionResult("NO_CHANGE"), replayResult)).toBe(false);
    });

    it("skips when replay applied every patch cleanly", () => {
        const replayResult: ReplayStepResult = { executed: true, success: true, patchesWithConflicts: 0 };
        expect(shouldSkipForNoChange(baseConfig, autoVersionResult("NO_CHANGE"), replayResult)).toBe(true);
    });

    it("does not skip in preview mode", () => {
        expect(shouldSkipForNoChange({ previewMode: true }, autoVersionResult("NO_CHANGE"))).toBe(false);
    });
});

describe("GithubStep with a NO_CHANGE autoversion result", () => {
    it.each([
        "pull-request",
        "push",
        "commit-and-release"
    ] as const)("returns skippedNoDiff without touching the repository in %s mode", async (mode) => {
        // Not a git repository: any commit, push or PR attempt would fail the step.
        const outputDir = await mkdtemp(join(tmpdir(), "github-step-no-change-"));
        try {
            const step = new GithubStep(outputDir, consolePipelineLogger, { ...baseConfig, mode });

            const result = await step.execute({
                previousStepResults: { autoVersion: autoVersionResult("NO_CHANGE") }
            });

            expect(result).toStrictEqual({ executed: true, success: true, skippedNoDiff: true });
        } finally {
            await rm(outputDir, { recursive: true, force: true });
        }
    });
});
