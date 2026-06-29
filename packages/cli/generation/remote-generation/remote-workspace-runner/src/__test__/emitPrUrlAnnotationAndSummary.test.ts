import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { emitPrUrlAnnotationAndSummary } from "../runRemoteGenerationForAPIWorkspace.js";

describe("emitPrUrlAnnotationAndSummary", () => {
    const originalGithubActions = process.env.GITHUB_ACTIONS;
    const originalStepSummary = process.env.GITHUB_STEP_SUMMARY;
    let stdoutSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        delete process.env.GITHUB_ACTIONS;
        delete process.env.GITHUB_STEP_SUMMARY;
        stdoutSpy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    });

    afterEach(() => {
        if (originalGithubActions === undefined) {
            delete process.env.GITHUB_ACTIONS;
        } else {
            process.env.GITHUB_ACTIONS = originalGithubActions;
        }
        if (originalStepSummary === undefined) {
            delete process.env.GITHUB_STEP_SUMMARY;
        } else {
            process.env.GITHUB_STEP_SUMMARY = originalStepSummary;
        }
        stdoutSpy.mockRestore();
    });

    it("does nothing when pullRequestUrl is undefined", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitPrUrlAnnotationAndSummary({
            pullRequestUrl: undefined,
            generatorName: "fernapi/fern-typescript-sdk",
            groupName: "ts-sdk",
            apiName: undefined,
            isAutomation: false
        });
        expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("does nothing when not running in GitHub Actions", async () => {
        delete process.env.GITHUB_ACTIONS;
        await emitPrUrlAnnotationAndSummary({
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            generatorName: "fernapi/fern-typescript-sdk",
            groupName: "ts-sdk",
            apiName: undefined,
            isAutomation: false
        });
        expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("emits a ::notice:: annotation with generator name and group in the title", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitPrUrlAnnotationAndSummary({
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            generatorName: "fernapi/fern-typescript-sdk",
            groupName: "ts-sdk",
            apiName: undefined,
            isAutomation: false
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-typescript-sdk (group=ts-sdk) → PR created::https://github.com/org/repo/pull/42\n"
        );
    });

    it("includes the api name in the title when present", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitPrUrlAnnotationAndSummary({
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            generatorName: "fernapi/fern-python-sdk",
            groupName: "production",
            apiName: "internal",
            isAutomation: false
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-python-sdk (group=production%2C api=internal) → PR created::https://github.com/org/repo/pull/42\n"
        );
    });

    it("appends a markdown line to GITHUB_STEP_SUMMARY for non-automation runs", async () => {
        process.env.GITHUB_ACTIONS = "true";
        const summaryPath = join(tmpdir(), `step-summary-${Date.now()}.md`);
        writeFileSync(summaryPath, "", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;

        try {
            await emitPrUrlAnnotationAndSummary({
                pullRequestUrl: "https://github.com/org/repo/pull/42",
                generatorName: "fernapi/fern-typescript-sdk",
                groupName: "ts-sdk",
                apiName: undefined,
                isAutomation: false
            });
            const content = readFileSync(summaryPath, "utf8");
            expect(content).toBe("🔀 **fernapi/fern-typescript-sdk** → [PR](https://github.com/org/repo/pull/42)\n");
        } finally {
            try {
                unlinkSync(summaryPath);
            } catch {
                // best-effort cleanup
            }
        }
    });

    it("skips the step summary for automation runs (the automation table already includes PR links)", async () => {
        process.env.GITHUB_ACTIONS = "true";
        const summaryPath = join(tmpdir(), `step-summary-${Date.now()}.md`);
        writeFileSync(summaryPath, "", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;

        try {
            await emitPrUrlAnnotationAndSummary({
                pullRequestUrl: "https://github.com/org/repo/pull/42",
                generatorName: "fernapi/fern-typescript-sdk",
                groupName: "ts-sdk",
                apiName: undefined,
                isAutomation: true
            });
            // The annotation should still be emitted
            expect(stdoutSpy).toHaveBeenCalled();
            // But the step summary should NOT be written
            const content = readFileSync(summaryPath, "utf8");
            expect(content).toBe("");
        } finally {
            try {
                unlinkSync(summaryPath);
            } catch {
                // best-effort cleanup
            }
        }
    });
});
