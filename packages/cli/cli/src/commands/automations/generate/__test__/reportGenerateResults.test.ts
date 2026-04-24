import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { GeneratorRunResult } from "../GeneratorRunResult.js";
import {
    renderJsonSummary,
    renderMarkdownSummary,
    renderStdoutSummary,
    writeResults,
    writeResultsSync
} from "../reportGenerateResults.js";

function successResult(overrides: Partial<GeneratorRunResult> = {}): GeneratorRunResult {
    return {
        apiName: "foo",
        groupName: "python-sdk",
        generatorName: "fernapi/fern-python-sdk",
        status: "success",
        skipReason: null,
        version: "0.1.0",
        pullRequestUrl: "https://github.com/acme/sdk/pull/17",
        noChangesDetected: false,
        publishTarget: null,
        errorMessage: null,
        durationMs: 1234,
        sdkRepoUrl: "https://github.com/acme/sdk",
        generatorsYmlUrl: null,
        ...overrides
    };
}

describe("renderStdoutSummary", () => {
    it("renders succeeded · skipped · failed counts", () => {
        const results = [
            successResult(),
            successResult({
                generatorName: "other",
                status: "failed",
                errorMessage: "boom",
                version: null,
                pullRequestUrl: null
            }),
            successResult({
                generatorName: "third",
                status: "skipped",
                skipReason: "no_diff",
                version: null,
                pullRequestUrl: null
            })
        ];
        expect(renderStdoutSummary(results)).toBe("1 succeeded · 1 skipped · 1 failed");
    });
});

describe("renderMarkdownSummary", () => {
    it("emits a success heading when every generator succeeded", () => {
        const md = renderMarkdownSummary([successResult()]);
        expect(md).toContain("## ✅ SDK generation succeeded");
    });

    it("emits a failure heading with X/Y counts when any generator failed", () => {
        const md = renderMarkdownSummary([
            successResult(),
            successResult({ generatorName: "other", status: "failed", errorMessage: "boom" })
        ]);
        expect(md).toContain("## ❌ SDK generation failed (1/2 succeeded)");
    });

    it("excludes skipped generators from the failure heading's denominator", () => {
        // Denominator is attempted (succeeded + failed), not total results. With 4 succeeded,
        // 2 failed, 4 skipped the heading reads "4/6 succeeded, 4 skipped" — not "4/10".
        const makeSuccess = (name: string) => successResult({ generatorName: name });
        const makeFailure = (name: string) =>
            successResult({ generatorName: name, status: "failed", errorMessage: "boom" });
        const makeSkipped = (name: string) =>
            successResult({
                generatorName: name,
                status: "skipped",
                skipReason: "local_output",
                version: null,
                pullRequestUrl: null
            });
        const md = renderMarkdownSummary([
            makeSuccess("a"),
            makeSuccess("b"),
            makeSuccess("c"),
            makeSuccess("d"),
            makeFailure("e"),
            makeFailure("f"),
            makeSkipped("g"),
            makeSkipped("h"),
            makeSkipped("i"),
            makeSkipped("j")
        ]);
        expect(md).toContain("## ❌ SDK generation failed (4/6 succeeded, 4 skipped)");
    });

    it("omits the skipped-count suffix from the failure heading when there are no skipped rows", () => {
        const md = renderMarkdownSummary([
            successResult(),
            successResult({ generatorName: "other", status: "failed", errorMessage: "boom" })
        ]);
        expect(md).toContain("## ❌ SDK generation failed (1/2 succeeded)");
        expect(md).not.toContain("skipped)");
    });

    it("emits a 'skipped' heading when every generator was skipped (no successes, no failures)", () => {
        const md = renderMarkdownSummary([
            successResult({
                generatorName: "a",
                status: "skipped",
                skipReason: "local_output",
                version: null,
                pullRequestUrl: null
            }),
            successResult({
                generatorName: "b",
                status: "skipped",
                skipReason: "opted_out",
                version: null,
                pullRequestUrl: null
            })
        ]);
        expect(md).toContain("## ⏭️ SDK generation skipped");
        expect(md).not.toContain("succeeded");
    });

    it("omits the API column when only one API is represented", () => {
        const md = renderMarkdownSummary([successResult(), successResult({ generatorName: "other" })]);
        expect(md).not.toMatch(/<th[^>]*>API</);
    });

    it("renders the API column with rowspan when multiple APIs are represented", () => {
        const md = renderMarkdownSummary([
            successResult({ apiName: "foo", groupName: "g1", generatorName: "a" }),
            successResult({ apiName: "foo", groupName: "g1", generatorName: "b" }),
            successResult({ apiName: "bar", groupName: "g2", generatorName: "c" })
        ]);
        expect(md).toContain('<th align="left">API</th>');
        expect(md).toContain('<td rowspan="2">foo</td>');
        expect(md).toContain('<td rowspan="1">bar</td>');
    });

    it("groups rows under a shared group cell via rowspan", () => {
        const md = renderMarkdownSummary([
            successResult({ groupName: "g1", generatorName: "a" }),
            successResult({ groupName: "g1", generatorName: "b" }),
            successResult({ groupName: "g2", generatorName: "c" })
        ]);
        expect(md).toContain('<td rowspan="2">g1</td>');
        expect(md).toContain('<td rowspan="1">g2</td>');
    });

    it("merges rows for the same (api, group) even when results arrive interleaved", () => {
        // Multi-workspace parallelism means recorder entries can interleave (api A's skipped
        // generators, then api B's skipped ones, then back to A's failures). The table must
        // still render one rowspan block per API.
        const md = renderMarkdownSummary([
            successResult({ apiName: "foo", groupName: "g1", generatorName: "a" }),
            successResult({ apiName: "bar", groupName: "g2", generatorName: "b" }),
            successResult({ apiName: "foo", groupName: "g1", generatorName: "c" }),
            successResult({ apiName: "bar", groupName: "g2", generatorName: "d" })
        ]);
        expect(md).toContain('<td rowspan="2">foo</td>');
        expect(md).toContain('<td rowspan="2">bar</td>');
        // Sanity: `foo` should not appear twice as a `<td rowspan=...>foo</td>`.
        expect([...md.matchAll(/<td rowspan="\d+">foo<\/td>/g)]).toHaveLength(1);
    });

    it("renders PR created when a pullRequestUrl is present", () => {
        const md = renderMarkdownSummary([successResult({ pullRequestUrl: "https://github.com/acme/sdk/pull/17" })]);
        expect(md).toContain("✅ PR created");
        expect(md).toContain('🔀 <a href="https://github.com/acme/sdk/pull/17">PR</a>');
    });

    it("renders 'No changes detected' when Fiddle reports no diff", () => {
        const md = renderMarkdownSummary([successResult({ noChangesDetected: true, pullRequestUrl: null })]);
        expect(md).toContain("✅ No changes detected");
    });

    it("renders plain success when neither PR nor no-changes apply", () => {
        const md = renderMarkdownSummary([successResult({ pullRequestUrl: null })]);
        expect(md).toContain("✅ Success");
    });

    it("renders 'Published X to Y' when Fiddle reports a publish target", () => {
        const md = renderMarkdownSummary([
            successResult({
                pullRequestUrl: null,
                publishTarget: {
                    registry: "pypi",
                    label: "PyPI",
                    version: "0.1.0",
                    url: "https://pypi.org/project/acme-sdk/0.1.0/"
                }
            })
        ]);
        expect(md).toContain("✅ Published 0.1.0 to PyPI");
        expect(md).toContain('📦 <a href="https://pypi.org/project/acme-sdk/0.1.0/">PyPI</a>');
    });

    it("prefers the publish-target status over 'PR created' when both are present", () => {
        // When an SDK is published AND a PR was opened (e.g. npm publish + GitHub PR), the
        // user cares most about the publish result. Matches autopilot precedence.
        const md = renderMarkdownSummary([
            successResult({
                pullRequestUrl: "https://github.com/acme/sdk/pull/17",
                publishTarget: {
                    registry: "npm",
                    label: "npm",
                    version: "0.1.0",
                    url: "https://www.npmjs.com/package/@acme/sdk/v/0.1.0"
                }
            })
        ]);
        expect(md).toContain("✅ Published 0.1.0 to npm");
        expect(md).not.toContain("✅ PR created");
    });

    it("prefers 'No changes detected' over a publish-target status", () => {
        // If Fiddle reports no diff the generator didn't actually publish anything new — show the
        // truthful 'no changes' status instead of a stale 'Published ...'.
        const md = renderMarkdownSummary([
            successResult({
                noChangesDetected: true,
                publishTarget: {
                    registry: "pypi",
                    label: "PyPI",
                    version: "0.1.0",
                    url: "https://pypi.org/project/acme-sdk/0.1.0/"
                }
            })
        ]);
        expect(md).toContain("✅ No changes detected");
        expect(md).not.toContain("Published");
    });

    it("renders a failure cell for failed generators", () => {
        const md = renderMarkdownSummary([successResult({ status: "failed", errorMessage: "boom" })]);
        expect(md).toContain("❌ SDK generation failed");
    });

    it("renders skipped cells for local_output and opted_out reasons", () => {
        const md = renderMarkdownSummary([
            successResult({
                generatorName: "a",
                status: "skipped",
                skipReason: "local_output",
                version: null,
                pullRequestUrl: null
            }),
            successResult({
                generatorName: "b",
                status: "skipped",
                skipReason: "opted_out",
                version: null,
                pullRequestUrl: null
            })
        ]);
        expect(md).toContain("⏭️ Skipped - local output");
        expect(md).toContain("⏭️ Skipped - opted out");
    });

    it("formats durations as {m}m {s}s or {s}s", () => {
        const md = renderMarkdownSummary([
            successResult({ generatorName: "a", durationMs: 33000 }),
            successResult({ generatorName: "b", durationMs: 61000 }),
            successResult({ generatorName: "c", durationMs: 0 })
        ]);
        expect(md).toContain("<td>33s</td>");
        expect(md).toContain("<td>1m 1s</td>");
        expect(md).toContain("<td>—</td>");
    });

    it("renders each available link in the links cell", () => {
        const md = renderMarkdownSummary([
            successResult({
                publishTarget: {
                    registry: "pypi",
                    label: "PyPI",
                    version: "0.1.0",
                    url: "https://pypi.org/project/acme-sdk/0.1.0/"
                },
                pullRequestUrl: "https://github.com/acme/sdk/pull/17",
                sdkRepoUrl: "https://github.com/acme/sdk",
                generatorsYmlUrl: "https://github.com/acme/config/blob/main/fern/generators.yml#L5"
            })
        ]);
        expect(md).toContain('📦 <a href="https://pypi.org/project/acme-sdk/0.1.0/">PyPI</a>');
        expect(md).toContain('🔀 <a href="https://github.com/acme/sdk/pull/17">PR</a>');
        expect(md).toContain('📂 <a href="https://github.com/acme/sdk">SDK repo</a>');
        expect(md).toContain(
            '🌿 <a href="https://github.com/acme/config/blob/main/fern/generators.yml#L5">generators.yml</a>'
        );
    });

    it("falls back to '—' when there are no links", () => {
        const md = renderMarkdownSummary([
            successResult({ pullRequestUrl: null, sdkRepoUrl: null, generatorsYmlUrl: null })
        ]);
        expect(md).toMatch(/<td>—<\/td>\s*<\/tr>/);
    });

    it("escapes HTML special characters in cell values", () => {
        const md = renderMarkdownSummary([successResult({ generatorName: "weird<name>&\"'" })]);
        expect(md).toContain("weird&lt;name&gt;&amp;&quot;'");
    });

    it("returns an empty string when there are no results", () => {
        expect(renderMarkdownSummary([])).toBe("");
    });
});

describe("renderJsonSummary", () => {
    it("produces a stable shape with schema version and summary counts", () => {
        const json = renderJsonSummary([
            successResult(),
            successResult({
                generatorName: "boom",
                status: "failed",
                version: null,
                errorMessage: "boom",
                pullRequestUrl: null
            })
        ]);
        expect(json.version).toBe(1);
        expect(json.summary).toEqual({ succeeded: 1, failed: 1, skipped: 0 });
        expect(json.generators).toHaveLength(2);
        expect(json.generators[0]).toMatchObject({
            api: "foo",
            group: "python-sdk",
            generatorName: "fernapi/fern-python-sdk",
            status: "success",
            skipReason: null,
            version: "0.1.0",
            error: null,
            durationMs: 1234,
            sdkRepoUrl: "https://github.com/acme/sdk"
        });
    });

    it("coerces undefined apiName to null", () => {
        const json = renderJsonSummary([successResult({ apiName: undefined })]);
        expect(json.generators[0]?.api).toBeNull();
    });

    it("includes skipReason on skipped results", () => {
        const json = renderJsonSummary([
            successResult({
                status: "skipped",
                skipReason: "local_output",
                version: null,
                pullRequestUrl: null
            })
        ]);
        expect(json.generators[0]?.skipReason).toBe("local_output");
    });
});

// Shared setup/teardown used by both the async and sync writer tests.
function useTempDirAndEnv(): { getTmpDir: () => string } {
    let tmpDir: string;
    const savedEnv: Record<string, string | undefined> = {};

    beforeEach(() => {
        tmpDir = mkdtempSync(join(tmpdir(), "fern-automations-test-"));
        savedEnv.GITHUB_STEP_SUMMARY = process.env.GITHUB_STEP_SUMMARY;
    });

    afterEach(() => {
        rmSync(tmpDir, { recursive: true, force: true });
        if (savedEnv.GITHUB_STEP_SUMMARY == null) {
            delete process.env.GITHUB_STEP_SUMMARY;
        } else {
            process.env.GITHUB_STEP_SUMMARY = savedEnv.GITHUB_STEP_SUMMARY;
        }
    });

    return { getTmpDir: () => tmpDir };
}

describe("writeResults (happy path)", () => {
    const { getTmpDir } = useTempDirAndEnv();

    it("writes JSON to the requested path when --json-file-output is set", async () => {
        const jsonPath = join(getTmpDir(), "out.json");
        await writeResults({ results: [successResult()], jsonOutputPath: jsonPath });
        const parsed = JSON.parse(readFileSync(jsonPath, "utf8"));
        expect(parsed.summary).toEqual({ succeeded: 1, failed: 0, skipped: 0 });
    });

    it("appends markdown to GITHUB_STEP_SUMMARY whenever that env var points at a writable path", async () => {
        // No GITHUB_ACTIONS gate: any caller can opt in by setting the env var (local testing,
        // non-GitHub CIs that want markdown output, etc.).
        delete process.env.GITHUB_ACTIONS;
        const summaryPath = join(getTmpDir(), "step-summary");
        writeFileSync(summaryPath, "previous step\n", "utf8");
        process.env.GITHUB_STEP_SUMMARY = summaryPath;
        await writeResults({ results: [successResult()], jsonOutputPath: undefined });
        const contents = readFileSync(summaryPath, "utf8");
        expect(contents).toContain("previous step");
        expect(contents).toContain("## ✅ SDK generation succeeded");
    });

    it("silently no-ops the step summary when GITHUB_STEP_SUMMARY is unset", async () => {
        delete process.env.GITHUB_STEP_SUMMARY;
        await expect(writeResults({ results: [successResult()], jsonOutputPath: undefined })).resolves.toBeUndefined();
    });

    it("rejects when the JSON path is unwritable so the user sees --json-file-output failures", async () => {
        // /dev/null/<anything> is never writable as a file on POSIX systems.
        const badPath = "/dev/null/fern-automations-write-failure";
        await expect(writeResults({ results: [successResult()], jsonOutputPath: badPath })).rejects.toBeDefined();
    });

    it("does not reject when the step summary is unwritable — only the user-owned JSON path surfaces errors", async () => {
        process.env.GITHUB_STEP_SUMMARY = "/dev/null/fern-automations-summary-failure";
        await expect(writeResults({ results: [successResult()], jsonOutputPath: undefined })).resolves.toBeUndefined();
    });
});

describe("writeResultsSync (signal-path best-effort)", () => {
    const { getTmpDir } = useTempDirAndEnv();

    it("writes JSON synchronously so a signal mid-write still leaves the file on disk", () => {
        const jsonPath = join(getTmpDir(), "out.json");
        writeResultsSync({ results: [successResult()], jsonOutputPath: jsonPath });
        const parsed = JSON.parse(readFileSync(jsonPath, "utf8"));
        expect(parsed.summary).toEqual({ succeeded: 1, failed: 0, skipped: 0 });
    });

    it("swallows a JSON write error — signal handlers can't report errors", () => {
        const badPath = "/dev/null/fern-automations-write-failure";
        expect(() => writeResultsSync({ results: [successResult()], jsonOutputPath: badPath })).not.toThrow();
    });

    it("swallows a step-summary write error", () => {
        process.env.GITHUB_STEP_SUMMARY = "/dev/null/fern-automations-summary-failure";
        expect(() => writeResultsSync({ results: [successResult()], jsonOutputPath: undefined })).not.toThrow();
    });
});
