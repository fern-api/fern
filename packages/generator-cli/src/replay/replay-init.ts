import { cloneRepository } from "@fern-api/github";
import { type BootstrapResult, bootstrap } from "@fern-api/replay";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { GITATTRIBUTES_ENTRIES, REPLAY_FERNIGNORE_ENTRIES } from "./fernignore";

export interface ReplayInitParams {
    /** GitHub repo URI (e.g., "fern-demo/fern-replay-testbed-java-sdk") */
    githubRepo: string;
    /** GitHub token for clone (read access). Optional for public repos. */
    token?: string;
    /** Report what would happen but don't create PR */
    dryRun?: boolean;
    /** Max commits to scan for generation history */
    maxCommitsToScan?: number;
    /** Overwrite existing lockfile if present. Default: false */
    force?: boolean;
    /** Scan git history for existing patches (migration). Default: false */
    importHistory?: boolean;
}

export interface ReplayInitResult {
    /** Bootstrap result from fern-replay */
    bootstrap: BootstrapResult;
    /** Raw lockfile YAML content, present when bootstrap succeeded and not dry-run */
    lockfileContent?: string;
    /** Fernignore entries that the server should ensure exist */
    fernignoreEntries: string[];
    /** Gitattributes entries the server should ensure exist (e.g. linguist-generated markers) */
    gitattributesEntries: string[];
    /** Generated PR body markdown for the server to use */
    prBody?: string;
}

/**
 * Initialize Replay for an SDK repository.
 *
 * Runs bootstrap locally (read-only) and returns the lockfile content
 * for the caller to send to Fiddle for server-side PR creation.
 *
 * Flow:
 * 1. Clone the SDK repo (read-only)
 * 2. Run bootstrap() to scan history and create lockfile
 * 3. Read lockfile content from disk
 * 4. Return lockfile + fernignore/gitattributes entries for Fiddle to apply server-side
 */
export async function replayInit(params: ReplayInitParams): Promise<ReplayInitResult> {
    const { githubRepo, token, dryRun } = params;

    // 1. Clone the repo into a temp directory
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const repoPath = tmpDir.path;
    await cloneRepository({
        githubRepository: githubRepo,
        installationToken: token,
        targetDirectory: repoPath
    });

    // 2. Run bootstrap
    const bootstrapResult = await bootstrap(repoPath, {
        dryRun,
        fernignoreAction: "skip",
        maxCommitsToScan: params.maxCommitsToScan,
        force: params.force ?? false,
        importHistory: params.importHistory
    });

    if (!bootstrapResult.generationCommit) {
        return { bootstrap: bootstrapResult, fernignoreEntries: [], gitattributesEntries: [] };
    }

    if (dryRun) {
        return { bootstrap: bootstrapResult, fernignoreEntries: [], gitattributesEntries: [] };
    }

    // 3. Read lockfile content from disk
    const lockfilePath = join(repoPath, ".fern", "replay.lock");
    const lockfileContent = existsSync(lockfilePath) ? readFileSync(lockfilePath, "utf-8") : undefined;

    return {
        bootstrap: bootstrapResult,
        lockfileContent,
        fernignoreEntries: REPLAY_FERNIGNORE_ENTRIES,
        gitattributesEntries: GITATTRIBUTES_ENTRIES,
        prBody: buildPrBody(bootstrapResult)
    };
}

export interface BootstrapLogEntry {
    level: "info" | "warn";
    message: string;
}

/**
 * Formats a BootstrapResult into structured log entries.
 * Used by both the generator-cli CLI and the fern CLI to produce
 * consistent output without duplicating formatting logic.
 */
export function formatBootstrapSummary(result: ReplayInitResult): BootstrapLogEntry[] {
    const entries: BootstrapLogEntry[] = [];
    const bs = result.bootstrap;

    if (!bs.generationCommit) {
        const lockfileExists = bs.warnings.some((w) => w.includes("lockfile already exists"));
        if (lockfileExists) {
            entries.push({
                level: "warn",
                message: "Replay is already initialized. Use --force to re-initialize from scratch."
            });
        } else {
            entries.push({ level: "warn", message: "No generation commits found in repository history." });
            entries.push({
                level: "info",
                message: "Replay requires at least one SDK generation commit to establish a baseline."
            });
        }
        return entries;
    }

    entries.push({
        level: "info",
        message: `Generation commit: ${bs.generationCommit.sha.slice(0, 7)} "${bs.generationCommit.message.slice(0, 60)}"`
    });
    entries.push({
        level: "info",
        message: `Scanned commits since: ${bs.scannedSinceGeneration.slice(0, 7)} (last generation)`
    });
    if (bs.staleGenerationsSkipped > 0) {
        entries.push({
            level: "info",
            message: `Skipped ${bs.staleGenerationsSkipped} older generation(s) — only tracking recent commits`
        });
    }
    if (bs.patchesCreated === 0 && bs.patches.length === 0) {
        entries.push({
            level: "info",
            message: "Clean start — tracking future edits only"
        });
    } else {
        entries.push({ level: "info", message: `Patches created: ${bs.patchesCreated}` });

        if (bs.patches.length > 0) {
            entries.push({ level: "info", message: "\nPatches:" });
            for (const patch of bs.patches) {
                entries.push({
                    level: "info",
                    message: `  ${patch.id}: "${patch.original_message.slice(0, 50)}" (${patch.files.length} files)`
                });
            }
        }
    }

    if (bs.warnings.length > 0) {
        entries.push({ level: "info", message: "\nWarnings:" });
        for (const w of bs.warnings) {
            entries.push({ level: "warn", message: `  ${w}` });
        }
    }

    return entries;
}

function buildPrBody(result: BootstrapResult): string {
    const lines: string[] = [
        "## Replay Initialization",
        "",
        "This PR initializes [Fern Replay](https://buildwithfern.com) for this SDK repository.",
        "Replay automatically preserves your customizations across SDK regenerations.",
        "",
        `**Base generation commit:** \`${result.generationCommit?.sha.slice(0, 7)}\``
    ];

    if (result.patchesCreated === 0 && result.patches.length === 0) {
        lines.push(
            "",
            "Clean start — no historical patches imported. Future customizations will be tracked automatically.",
            ""
        );
    } else {
        lines.push(`**Customization patches tracked:** ${result.patchesCreated}`, "");

        if (result.staleGenerationsSkipped > 0) {
            lines.push(
                `> **Note:** Replay tracks customizations made since the last generation commit (\`${result.scannedSinceGeneration.slice(0, 7)}\`).`,
                `> ${result.staleGenerationsSkipped} older generation(s) were skipped — commits regenerated over multiple times are not tracked.`,
                ""
            );
        }

        if (result.patches.length > 0) {
            lines.push("### Tracked Patches");
            lines.push("");
            for (const patch of result.patches) {
                lines.push(
                    `- **${patch.id}**: ${patch.original_message.slice(0, 60)} (${patch.files.length} file${patch.files.length === 1 ? "" : "s"})`
                );
            }
            lines.push("");
        }
    }

    if (result.warnings.length > 0) {
        lines.push("### Warnings");
        lines.push("");
        for (const w of result.warnings) {
            lines.push(`- ${w}`);
        }
        lines.push("");
    }

    lines.push("---");
    lines.push("Once merged, your customizations will be automatically preserved on future `fern generate` runs.");

    return lines.join("\n");
}
