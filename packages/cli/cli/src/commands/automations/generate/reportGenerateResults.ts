import { assertNever } from "@fern-api/core-utils";
import { appendFileSync, writeFileSync } from "fs";
import { appendFile, writeFile } from "fs/promises";

import {
    countResults,
    GeneratorRunCounts,
    GeneratorRunResult,
    GeneratorSkipReason,
    GeneratorStatus,
    PublishTarget
} from "./GeneratorRunResult.js";

const JSON_SCHEMA_VERSION = 1;

export function renderStdoutSummary(results: readonly GeneratorRunResult[]): string {
    return formatCounts(countResults(results));
}

/**
 * Builds the HTML step-summary table. Rendered as inline HTML (not pipe-markdown) because
 * GitHub's step-summary renderer supports `<table>` with `rowspan`, and we need rowspan to
 * group rows under a shared API / group cell.
 *
 * Structure mirrors old autopilot:
 *   - Heading with total succeeded / total.
 *   - Columns: [API] | Group | Generator | Version | Status | Duration | Links.
 *   - `API` column is only present when the run spans more than one API.
 *   - Rows are grouped by (apiName, groupName); the API and group cells span all rows in their
 *     respective runs via `rowspan`.
 */
export function renderMarkdownSummary(results: readonly GeneratorRunResult[]): string {
    if (results.length === 0) {
        return "";
    }

    const counts = countResults(results);
    const lines: string[] = [];
    lines.push(renderHeading(counts));
    lines.push("");

    const isMultiApi = new Set(results.map((r) => r.apiName).filter((n) => n != null)).size > 1;
    lines.push("<table>");
    lines.push("<thead>");
    lines.push("<tr>");
    if (isMultiApi) {
        lines.push('<th align="left">API</th>');
    }
    lines.push('<th align="left">Group</th>');
    lines.push('<th align="left">Generator</th>');
    lines.push('<th align="left">Version</th>');
    lines.push('<th align="left">Status</th>');
    lines.push('<th align="left">Duration</th>');
    lines.push('<th align="left">Links</th>');
    lines.push("</tr>");
    lines.push("</thead>");
    lines.push("<tbody>");

    // Group by API → group in first-seen order. Results can arrive interleaved when multiple
    // workspaces / groups run in parallel (each workspace appends to a shared recorder in
    // whatever order its tasks complete). Rendering the table in insertion order would produce
    // fragmented rowspan blocks (the same API shown repeatedly); grouping by first-seen key
    // keeps one rowspan block per API.
    const apiRuns = groupByKey(results, (r) => r.apiName ?? "");
    for (const apiRun of apiRuns) {
        const groupRuns = groupByKey(apiRun.items, (r) => r.groupName);
        let apiCellEmitted = false;
        for (const groupRun of groupRuns) {
            let groupCellEmitted = false;
            for (const result of groupRun.items) {
                const tr: string[] = ["<tr>"];
                if (isMultiApi && !apiCellEmitted) {
                    tr.push(`<td rowspan="${apiRun.items.length}">${escapeHtml(result.apiName ?? "")}</td>`);
                    apiCellEmitted = true;
                }
                if (!groupCellEmitted) {
                    tr.push(`<td rowspan="${groupRun.items.length}">${escapeHtml(result.groupName)}</td>`);
                    groupCellEmitted = true;
                }
                tr.push(`<td>${escapeHtml(result.generatorName)}</td>`);
                tr.push(`<td>${versionCell(result.version)}</td>`);
                tr.push(`<td>${statusCell(result)}</td>`);
                tr.push(`<td>${formatDuration(result.durationMs)}</td>`);
                tr.push(`<td>${linksCell(result)}</td>`);
                tr.push("</tr>");
                lines.push(tr.join(""));
            }
        }
    }

    lines.push("</tbody>");
    lines.push("</table>");
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
        skipReason: GeneratorSkipReason | null;
        pullRequestUrl: string | null;
        noChangesDetected: boolean;
        publishTarget: PublishTarget | null;
        version: string | null;
        error: string | null;
        durationMs: number;
        sdkRepoUrl: string | null;
        generatorsYmlUrl: string | null;
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
            skipReason: r.skipReason,
            pullRequestUrl: r.pullRequestUrl,
            noChangesDetected: r.noChangesDetected,
            publishTarget: r.publishTarget,
            version: r.version,
            error: r.errorMessage,
            durationMs: r.durationMs,
            sdkRepoUrl: r.sdkRepoUrl,
            generatorsYmlUrl: r.generatorsYmlUrl
        })),
        summary: countResults(results)
    };
}

function formatCounts(counts: GeneratorRunCounts): string {
    return `${counts.succeeded} succeeded · ${counts.skipped} skipped · ${counts.failed} failed`;
}

function renderHeading(counts: GeneratorRunCounts): string {
    // Denominator is `succeeded + failed` — skipped generators never ran, so including them
    // would read as "6 failed out of 10" when only 2 actually failed.
    const attempted = counts.succeeded + counts.failed;
    if (counts.failed > 0) {
        const skipSuffix = counts.skipped > 0 ? `, ${counts.skipped} skipped` : "";
        return `## ❌ SDK generation failed (${counts.succeeded}/${attempted} succeeded${skipSuffix})`;
    }
    // Avoid a misleading "succeeded" heading when every generator was skipped (e.g. all
    // configured for local-file-system output, or auto-release disabled at the root).
    if (counts.succeeded === 0 && counts.skipped > 0) {
        return "## ⏭️ SDK generation skipped";
    }
    return "## ✅ SDK generation succeeded";
}

/**
 * Partitions a list into groups by key, preserving the first-seen order of each key and the
 * original order of items within each group. Items that share a key but are non-adjacent in the
 * input get merged into one group — important when multi-workspace parallelism interleaves
 * records in the recorder (we can't assume `(api, group)`-adjacent ordering).
 */
function groupByKey<T, K>(items: readonly T[], key: (item: T) => K): Array<{ key: K; items: T[] }> {
    const groups = new Map<K, T[]>();
    for (const item of items) {
        const k = key(item);
        let bucket = groups.get(k);
        if (bucket == null) {
            bucket = [];
            groups.set(k, bucket);
        }
        bucket.push(item);
    }
    return Array.from(groups, ([k, bucketItems]) => ({ key: k, items: bucketItems }));
}

/** `ms → "1m 1s" / "33s" / "—"`. Matches old autopilot's formatter. */
function formatDuration(durationMs: number): string {
    if (durationMs <= 0) {
        return "—";
    }
    const totalSeconds = Math.round(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes === 0) {
        return `${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
}

function versionCell(version: string | null): string {
    if (version == null || version.length === 0) {
        return "—";
    }
    return `<code>${escapeHtml(version)}</code>`;
}

function statusCell(result: GeneratorRunResult): string {
    switch (result.status) {
        case "success":
            if (result.noChangesDetected) {
                return "✅ No changes detected";
            }
            if (result.publishTarget != null) {
                return `✅ Published ${escapeHtml(result.publishTarget.version)} to ${escapeHtml(result.publishTarget.label)}`;
            }
            if (result.pullRequestUrl != null) {
                return "✅ PR created";
            }
            return "✅ Success";
        case "failed":
            return "❌ SDK generation failed";
        case "skipped":
            return describeSkippedStatus(result.skipReason);
        default:
            assertNever(result.status);
    }
}

function describeSkippedStatus(reason: GeneratorSkipReason | null): string {
    if (reason == null) {
        return "⏭️ Skipped";
    }
    switch (reason) {
        case "local_output":
            return "⏭️ Skipped - local output";
        case "opted_out":
            return "⏭️ Skipped - opted out";
        case "no_diff":
            return "✅ No changes detected";
        default:
            assertNever(reason);
    }
}

function linksCell(result: GeneratorRunResult): string {
    const parts: string[] = [];
    if (result.publishTarget != null) {
        parts.push(
            `📦 <a href="${escapeHtml(result.publishTarget.url)}">${escapeHtml(result.publishTarget.label)}</a>`
        );
    }
    if (result.pullRequestUrl != null) {
        parts.push(`🔀 <a href="${escapeHtml(result.pullRequestUrl)}">PR</a>`);
    }
    if (result.sdkRepoUrl != null) {
        parts.push(`📂 <a href="${escapeHtml(result.sdkRepoUrl)}">SDK repo</a>`);
    }
    if (result.generatorsYmlUrl != null) {
        parts.push(`🌿 <a href="${escapeHtml(result.generatorsYmlUrl)}">generators.yml</a>`);
    }
    return parts.length === 0 ? "—" : parts.join(" · ");
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
