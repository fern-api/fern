import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { emitGenerationAnnotations } from "../runRemoteGenerationForAPIWorkspace.js";

const BASE_CONTEXT = {
    pullRequestUrl: undefined,
    publishTarget: undefined,
    noChangesDetected: undefined,
    version: undefined,
    generatorName: "fernapi/fern-typescript-sdk",
    groupName: "ts-sdk",
    apiName: undefined,
    isAutomation: false
} as const;

describe("emitGenerationAnnotations", () => {
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

    it("does nothing when no notable events occurred", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({ ...BASE_CONTEXT });
        expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it("does nothing when not running in GitHub Actions", async () => {
        delete process.env.GITHUB_ACTIONS;
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            pullRequestUrl: "https://github.com/org/repo/pull/42"
        });
        expect(stdoutSpy).not.toHaveBeenCalled();
    });

    // ─── PR created ─────────────────────────────────────────

    it("emits a ::notice:: annotation for PR created", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            pullRequestUrl: "https://github.com/org/repo/pull/42"
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-typescript-sdk (group=ts-sdk) → PR created::https://github.com/org/repo/pull/42\n"
        );
    });

    it("includes the api name in the title when present", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            generatorName: "fernapi/fern-python-sdk",
            groupName: "production",
            apiName: "internal"
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-python-sdk (group=production%2C api=internal) → PR created::https://github.com/org/repo/pull/42\n"
        );
    });

    // ─── Published to registry ──────────────────────────────

    it("emits a ::notice:: annotation for package published", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            publishTarget: {
                registry: "npm",
                label: "npm",
                version: "1.0.0",
                url: "https://www.npmjs.com/package/@org/sdk/v/1.0.0"
            }
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-typescript-sdk (group=ts-sdk) → Published to npm::1.0.0 → https://www.npmjs.com/package/@org/sdk/v/1.0.0\n"
        );
    });

    it("emits a ::notice:: annotation for PyPI publish", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            generatorName: "fernapi/fern-python-sdk",
            groupName: "production",
            publishTarget: {
                registry: "pypi",
                label: "PyPI",
                version: "0.5.2",
                url: "https://pypi.org/project/my-sdk/0.5.2/"
            }
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-python-sdk (group=production) → Published to PyPI::0.5.2 → https://pypi.org/project/my-sdk/0.5.2/\n"
        );
    });

    // ─── No changes detected ────────────────────────────────

    it("emits a ::notice:: annotation when no changes detected", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            noChangesDetected: true
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-typescript-sdk (group=ts-sdk) → No changes detected::SDK repo is already up to date\n"
        );
    });

    it("does not emit no-changes annotation when noChangesDetected is false", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            noChangesDetected: false
        });
        expect(stdoutSpy).not.toHaveBeenCalled();
    });

    // ─── Version tagged ─────────────────────────────────────

    it("emits a ::notice:: annotation for version when no PR or publish", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            version: "2.0.0"
        });
        expect(stdoutSpy).toHaveBeenCalledWith(
            "::notice title=fernapi/fern-typescript-sdk (group=ts-sdk) → Version 2.0.0::Generated version 2.0.0\n"
        );
    });

    it("does not emit standalone version annotation when PR is present", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            version: "2.0.0"
        });
        // Should emit PR annotation but NOT a separate version annotation
        expect(stdoutSpy).toHaveBeenCalledTimes(1);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("PR created"));
    });

    it("does not emit standalone version annotation when publishTarget is present", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            publishTarget: {
                registry: "npm",
                label: "npm",
                version: "1.0.0",
                url: "https://www.npmjs.com/package/@org/sdk/v/1.0.0"
            },
            version: "1.0.0"
        });
        // Should emit publish annotation but NOT a separate version annotation
        expect(stdoutSpy).toHaveBeenCalledTimes(1);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Published to npm"));
    });

    // ─── Multiple events at once ────────────────────────────

    it("emits multiple annotations when both PR and publish occur", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await emitGenerationAnnotations({
            ...BASE_CONTEXT,
            pullRequestUrl: "https://github.com/org/repo/pull/42",
            publishTarget: {
                registry: "npm",
                label: "npm",
                version: "1.0.0",
                url: "https://www.npmjs.com/package/@org/sdk/v/1.0.0"
            },
            version: "1.0.0"
        });
        expect(stdoutSpy).toHaveBeenCalledTimes(2);
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("PR created"));
        expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Published to npm"));
    });

    // ─── Step summary ───────────────────────────────────────

    it("appends markdown lines to GITHUB_STEP_SUMMARY for non-automation runs", async () => {
        process.env.GITHUB_ACTIONS = "true";
        const summaryPath = join(tmpdir(), `step-summary-${Date.now()}.md`);
        writeFileSync(summaryPath, "", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;

        try {
            await emitGenerationAnnotations({
                ...BASE_CONTEXT,
                pullRequestUrl: "https://github.com/org/repo/pull/42",
                publishTarget: {
                    registry: "npm",
                    label: "npm",
                    version: "1.0.0",
                    url: "https://www.npmjs.com/package/@org/sdk/v/1.0.0"
                }
            });
            const content = readFileSync(summaryPath, "utf8");
            expect(content).toContain("🔀 **fernapi/fern-typescript-sdk** → [PR](https://github.com/org/repo/pull/42)");
            expect(content).toContain(
                "📦 **fernapi/fern-typescript-sdk** → [npm 1.0.0](https://www.npmjs.com/package/@org/sdk/v/1.0.0)"
            );
        } finally {
            try {
                unlinkSync(summaryPath);
            } catch {
                // best-effort cleanup
            }
        }
    });

    it("skips the step summary for automation runs", async () => {
        process.env.GITHUB_ACTIONS = "true";
        const summaryPath = join(tmpdir(), `step-summary-${Date.now()}.md`);
        writeFileSync(summaryPath, "", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;

        try {
            await emitGenerationAnnotations({
                ...BASE_CONTEXT,
                pullRequestUrl: "https://github.com/org/repo/pull/42",
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

    it("writes no-changes and version lines to step summary", async () => {
        process.env.GITHUB_ACTIONS = "true";
        const summaryPath = join(tmpdir(), `step-summary-${Date.now()}.md`);
        writeFileSync(summaryPath, "", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;

        try {
            await emitGenerationAnnotations({
                ...BASE_CONTEXT,
                noChangesDetected: true,
                isAutomation: false
            });
            const content = readFileSync(summaryPath, "utf8");
            expect(content).toContain("✅ **fernapi/fern-typescript-sdk** → No changes detected");
        } finally {
            try {
                unlinkSync(summaryPath);
            } catch {
                // best-effort cleanup
            }
        }
    });
});
