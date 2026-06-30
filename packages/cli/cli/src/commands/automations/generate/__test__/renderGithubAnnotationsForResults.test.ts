import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GeneratorRunResult } from "../GeneratorRunResult.js";
import { renderGithubAnnotationsForResults } from "../renderGithubAnnotationsForResults.js";

const ENV_KEYS = ["GITHUB_ACTIONS", "GITHUB_WORKSPACE"] as const;

function buildResult(overrides: Partial<GeneratorRunResult> = {}): GeneratorRunResult {
    return {
        apiName: undefined,
        groupName: "production",
        generatorName: "fernapi/fern-python-sdk",
        status: "failed",
        skipReason: null,
        version: null,
        pullRequestUrl: null,
        noChangesDetected: false,
        publishTarget: null,
        errorMessage: "Generator returned exit code 1",
        durationMs: 1234,
        sdkRepoUrl: null,
        generatorsYmlUrl: null,
        generatorsYmlWorkspaceRelativePath: null,
        generatorsYmlLineNumber: null,
        ...overrides
    };
}

describe("renderGithubAnnotationsForResults", () => {
    const saved: Record<(typeof ENV_KEYS)[number], string | undefined> = {
        GITHUB_ACTIONS: undefined,
        GITHUB_WORKSPACE: undefined
    };

    beforeEach(() => {
        for (const key of ENV_KEYS) {
            saved[key] = process.env[key];
            delete process.env[key];
        }
        process.env.GITHUB_ACTIONS = "true";
    });

    afterEach(() => {
        for (const key of ENV_KEYS) {
            if (saved[key] == null) {
                delete process.env[key];
            } else {
                process.env[key] = saved[key];
            }
        }
    });

    it("returns an empty string when not running in GHA", () => {
        // The whole point of the helper is to be safe to call unconditionally; off-CI it must
        // produce zero output so callers don't have to wrap each call in a feature check.
        delete process.env.GITHUB_ACTIONS;
        const result = buildResult({ status: "failed" });
        expect(renderGithubAnnotationsForResults([result])).toBe("");
    });

    it("ignores success and skipped results", () => {
        const results: GeneratorRunResult[] = [
            buildResult({ status: "success", errorMessage: null }),
            buildResult({ status: "skipped", skipReason: "local_output", errorMessage: null })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe("");
    });

    it("renders one ::error:: annotation per failure with title=<generator> failed (group=<group>)", () => {
        const results = [
            buildResult({
                groupName: "production",
                generatorName: "python-sdk",
                errorMessage: "boom"
            })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error title=python-sdk failed (group=production)::boom\n"
        );
    });

    it("includes the api name in the title when present", () => {
        // Multi-API runs need disambiguation in the title — otherwise two failed `python-sdk`
        // generators in different workspaces would show identical headings in the panel. The
        // comma between qualifiers is percent-encoded by the property-value escaper because
        // `,` is the property-list separator in GHA workflow command syntax.
        const results = [
            buildResult({
                apiName: "internal",
                groupName: "production",
                generatorName: "python-sdk",
                errorMessage: "boom"
            })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error title=python-sdk failed (group=production%2C api=internal)::boom\n"
        );
    });

    it("anchors the annotation on the workspace-relative generators.yml path and line", () => {
        // GHA renders `file=...,line=...` annotations inline on the file in the PR diff. The
        // path must be repo-relative — an absolute path on the runner would not match anything.
        const results = [
            buildResult({
                generatorsYmlWorkspaceRelativePath: "fern/apis/foo/generators.yml",
                generatorsYmlLineNumber: 42,
                errorMessage: "boom"
            })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error file=fern/apis/foo/generators.yml,line=42,title=fernapi/fern-python-sdk failed (group=production)::boom\n"
        );
    });

    it("emits the annotation without line= when the line number is unknown", () => {
        const results = [
            buildResult({
                generatorsYmlWorkspaceRelativePath: "fern/generators.yml",
                generatorsYmlLineNumber: null,
                errorMessage: "boom"
            })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error file=fern/generators.yml,title=fernapi/fern-python-sdk failed (group=production)::boom\n"
        );
    });

    it("does not include line= when the file is unknown — line alone is meaningless to GHA", () => {
        // A `line=` without `file=` would attach the annotation to nothing (or in some runners,
        // to the workflow file itself, which is misleading). We omit both together.
        const results = [
            buildResult({
                generatorsYmlWorkspaceRelativePath: null,
                generatorsYmlLineNumber: 42,
                errorMessage: "boom"
            })
        ];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error title=fernapi/fern-python-sdk failed (group=production)::boom\n"
        );
    });

    it("falls back to a stable message when errorMessage is null (defensive — recordFailure should always set it)", () => {
        const results = [buildResult({ errorMessage: null })];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error title=fernapi/fern-python-sdk failed (group=production)::Generator failed\n"
        );
    });

    it("encodes newlines in error messages so each failure stays one annotation", () => {
        const results = [buildResult({ errorMessage: "stack trace:\n  at foo\n  at bar" })];
        expect(renderGithubAnnotationsForResults(results)).toBe(
            "::error title=fernapi/fern-python-sdk failed (group=production)::stack trace:%0A  at foo%0A  at bar\n"
        );
    });

    it("emits one ::error:: per failure when below the per-step cap, with no trailing warning", () => {
        const results = Array.from({ length: 5 }, (_, i) =>
            buildResult({ generatorName: `gen-${i}`, errorMessage: `error ${i}` })
        );
        const out = renderGithubAnnotationsForResults(results);
        expect(out.split("\n").filter((l) => l.startsWith("::error::") || l.startsWith("::error "))).toHaveLength(5);
        expect(out).not.toContain("::warning");
    });

    it("emits one ::error:: per failure exactly at the cap, with no trailing warning", () => {
        // Boundary case: exactly 10 failures should not trigger the overflow warning. The error
        // count equals the cap; nothing was suppressed, so a "X were hidden" warning would lie.
        const results = Array.from({ length: 10 }, (_, i) =>
            buildResult({ generatorName: `gen-${i}`, errorMessage: `error ${i}` })
        );
        const out = renderGithubAnnotationsForResults(results);
        expect(out.split("\n").filter((l) => l.startsWith("::error::") || l.startsWith("::error "))).toHaveLength(10);
        expect(out).not.toContain("::warning");
    });

    it("appends a trailing ::warning:: with singular wording when one failure is over the cap", () => {
        // 11 failures → 1 suppressed. Singular grammar: "1 additional generator failure was hidden".
        const results = Array.from({ length: 11 }, (_, i) =>
            buildResult({ generatorName: `gen-${i}`, errorMessage: `error ${i}` })
        );
        const out = renderGithubAnnotationsForResults(results);
        expect(out.split("\n").filter((l) => l.startsWith("::error::") || l.startsWith("::error "))).toHaveLength(11);
        expect(out).toContain(
            "::warning title=11 generators failed (showing first 10)::1 additional generator failure was hidden by GitHub's per-step annotation cap. See the step summary table for the full list.\n"
        );
    });

    it("appends a trailing ::warning:: with plural wording when many failures are over the cap", () => {
        const results = Array.from({ length: 15 }, (_, i) =>
            buildResult({ generatorName: `gen-${i}`, errorMessage: `error ${i}` })
        );
        const out = renderGithubAnnotationsForResults(results);
        expect(out.split("\n").filter((l) => l.startsWith("::error::") || l.startsWith("::error "))).toHaveLength(15);
        expect(out).toContain(
            "::warning title=15 generators failed (showing first 10)::5 additional generator failures were hidden by GitHub's per-step annotation cap. See the step summary table for the full list.\n"
        );
    });

    it("emits the overflow warning AFTER all error annotations (so the warning appears last in the panel)", () => {
        // Order matters in the raw stdout — workflow commands are processed in order, and the
        // panel's chronological grouping reads the warning as a footer rather than a header.
        const results = Array.from({ length: 11 }, (_, i) =>
            buildResult({ generatorName: `gen-${i}`, errorMessage: `error ${i}` })
        );
        const out = renderGithubAnnotationsForResults(results);
        // Use a regex so the test matches both `::error::body` and `::error <props>::body` forms,
        // and isn't brittle to whether annotations carry properties in the future.
        const errorIndices = [...out.matchAll(/::error[: ]/g)].map((m) => m.index ?? -1);
        const warningIndex = out.search(/::warning[: ]/);
        const lastErrorIndex = errorIndices.length > 0 ? Math.max(...errorIndices) : -1;
        expect(warningIndex).toBeGreaterThan(lastErrorIndex);
    });
});
