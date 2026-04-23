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
        version: "0.1.0",
        pullRequestUrl: "https://github.com/acme/sdk/pull/17",
        errorMessage: null,
        durationMs: 1234,
        ...overrides
    };
}

describe("renderStdoutSummary", () => {
    it("renders succeeded · skipped · failed counts", () => {
        const results = [
            successResult(),
            successResult({ generatorName: "other", status: "failed", errorMessage: "boom", version: null }),
            successResult({ generatorName: "third", status: "skipped_no_diff", version: null })
        ];
        expect(renderStdoutSummary(results)).toBe("1 succeeded · 1 skipped · 1 failed");
    });
});

describe("renderMarkdownSummary", () => {
    it("renders a markdown table with status emoji, version, and PR link", () => {
        const md = renderMarkdownSummary([
            successResult(),
            successResult({
                apiName: "bar",
                groupName: "go-sdk",
                generatorName: "fernapi/fern-go-sdk",
                status: "failed",
                version: null,
                pullRequestUrl: null,
                errorMessage: "boom"
            }),
            successResult({
                apiName: "bar",
                groupName: "python-sdk",
                generatorName: "fernapi/fern-python-sdk",
                status: "skipped_no_diff",
                version: null,
                pullRequestUrl: null
            })
        ]);
        expect(md).toContain("## Fern Automations · Generate");
        expect(md).toContain("| API | Group | Generator | Status | Version | PR |");
        expect(md).toContain("✅ success");
        expect(md).toContain("❌ failed");
        expect(md).toContain("⏭️ skipped (no diff)");
        expect(md).toContain("[#17](https://github.com/acme/sdk/pull/17)");
        expect(md).toContain("**Summary:** 1 succeeded · 1 skipped · 1 failed");
    });

    it("uses em-dash placeholders for empty cells", () => {
        const md = renderMarkdownSummary([successResult({ version: null, pullRequestUrl: null })]);
        expect(md).toMatch(/\| — \| — \|/);
    });

    it("escapes pipe characters in generator names so they don't break the table", () => {
        const md = renderMarkdownSummary([successResult({ generatorName: "weird|name" })]);
        expect(md).toContain("weird\\|name");
    });
});

describe("renderJsonSummary", () => {
    it("produces a stable shape with schema version and summary counts", () => {
        const json = renderJsonSummary([
            successResult(),
            successResult({ generatorName: "boom", status: "failed", version: null, errorMessage: "boom" })
        ]);
        expect(json.version).toBe(1);
        expect(json.summary).toEqual({ succeeded: 1, failed: 1, skipped: 0 });
        expect(json.generators).toHaveLength(2);
        expect(json.generators[0]).toMatchObject({
            api: "foo",
            group: "python-sdk",
            generatorName: "fernapi/fern-python-sdk",
            status: "success",
            version: "0.1.0",
            error: null,
            durationMs: 1234
        });
    });

    it("coerces undefined apiName to null", () => {
        const json = renderJsonSummary([successResult({ apiName: undefined })]);
        expect(json.generators[0]?.api).toBeNull();
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
        expect(contents).toContain("## Fern Automations · Generate");
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
