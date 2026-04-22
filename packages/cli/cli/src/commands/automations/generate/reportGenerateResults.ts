import { appendFileSync, writeFileSync } from "fs";
import { appendFile, writeFile } from "fs/promises";

import { countResults, GeneratorRunCounts, GeneratorRunResult, GeneratorStatus } from "./GeneratorRunResult.js";

const JSON_SCHEMA_VERSION = 1;

export function renderStdoutSummary(results: readonly GeneratorRunResult[]): string {
    return formatCounts(countResults(results));
}

export function renderMarkdownSummary(results: readonly GeneratorRunResult[]): string {
    const lines: string[] = [];
    lines.push("## Fern Automations · Generate");
    lines.push("");
    lines.push("| API | Group | Generator | Status | Version | PR |");
    lines.push("|-----|-------|-----------|--------|---------|----|");
    for (const result of results) {
        lines.push(
            `| ${mdCell(result.apiName)} | ${mdCell(result.groupName)} | ${mdCell(result.generatorName)} | ${statusCell(result)} | ${mdCell(result.version)} | ${prCell(result.pullRequestUrl)} |`
        );
    }
    lines.push("");
    lines.push(`**Summary:** ${formatCounts(countResults(results))}`);
    lines.push("");
    return lines.join("\n");
}

export function renderJsonSummary(results: readonly GeneratorRunResult[]): {
    version: number;
    generators: Array<{
        api: string | null;
        group: string;
        generatorName: string;
        status: GeneratorStatus;
        pullRequestUrl: string | null;
        version: string | null;
        error: string | null;
        durationMs: number;
    }>;
    summary: GeneratorRunCounts;
} {
    return {
        version: JSON_SCHEMA_VERSION,
        generators: results.map((r) => ({
            api: r.apiName ?? null,
            group: r.groupName,
            generatorName: r.generatorName,
            status: r.status,
            pullRequestUrl: r.pullRequestUrl,
            version: r.version,
            error: r.errorMessage,
            durationMs: r.durationMs
        })),
        summary: countResults(results)
    };
}

function formatCounts(counts: GeneratorRunCounts): string {
    return `${counts.succeeded} succeeded · ${counts.skipped} skipped · ${counts.failed} failed`;
}

/**
 * Writes the step summary and JSON output at the end of a normal run.
 *
 * Error handling:
 * - Step summary: silently swallowed. `$GITHUB_STEP_SUMMARY` is a best-effort integration;
 *   we don't want to fail an otherwise-successful run for a CI step summary hiccup.
 * - JSON output: rethrown. The user explicitly passed `--json` and expects the file to exist;
 *   a write failure should be visible rather than causing silent exit 0.
 */
export async function writeResults({
    results,
    jsonOutputPath
}: {
    results: readonly GeneratorRunResult[];
    jsonOutputPath: string | undefined;
}): Promise<void> {
    const stepSummaryPath = getGithubStepSummaryPath();
    if (stepSummaryPath != null) {
        try {
            await appendFile(stepSummaryPath, renderMarkdownSummary(results), "utf8");
        } catch {
            // Silently no-op if the path is unwritable.
        }
    }

    if (jsonOutputPath != null) {
        await writeFile(jsonOutputPath, JSON.stringify(renderJsonSummary(results), null, 2), "utf8");
    }
}

/**
 * Best-effort synchronous variant for signal handlers (SIGINT/SIGTERM), where the event loop
 * is about to tear down and async writes may not flush. Errors are swallowed because signal
 * handlers can't meaningfully report back.
 */
export function writeResultsSync({
    results,
    jsonOutputPath
}: {
    results: readonly GeneratorRunResult[];
    jsonOutputPath: string | undefined;
}): void {
    const stepSummaryPath = getGithubStepSummaryPath();
    if (stepSummaryPath != null) {
        try {
            appendFileSync(stepSummaryPath, renderMarkdownSummary(results), "utf8");
        } catch {
            // Silently no-op.
        }
    }

    if (jsonOutputPath != null) {
        try {
            writeFileSync(jsonOutputPath, JSON.stringify(renderJsonSummary(results), null, 2), "utf8");
        } catch {
            // Best-effort on signal path.
        }
    }
}

function getGithubStepSummaryPath(): string | undefined {
    // `GITHUB_STEP_SUMMARY` is set by GitHub Actions runners, but it's just an env var — if a
    // user points it somewhere locally for testing, we honor it. Any other CI that wants markdown
    // output can set this variable to opt in without pretending to be GitHub Actions.
    const path = process.env.GITHUB_STEP_SUMMARY;
    return path != null && path.length > 0 ? path : undefined;
}

function mdCell(value: string | null | undefined): string {
    if (value == null || value.length === 0) {
        return "—";
    }
    // Escape pipes so they don't break the table.
    return value.replace(/\|/g, "\\|");
}

function statusCell(result: GeneratorRunResult): string {
    switch (result.status) {
        case "success":
            return "✅ success";
        case "failed":
            return "❌ failed";
        case "skipped_no_diff":
            return "⏭️ skipped (no diff)";
    }
}

function prCell(url: string | null): string {
    if (url == null) {
        return "—";
    }
    const match = url.match(/\/pull\/(\d+)/);
    if (match != null) {
        return `[#${match[1]}](${url})`;
    }
    return `[link](${url})`;
}
