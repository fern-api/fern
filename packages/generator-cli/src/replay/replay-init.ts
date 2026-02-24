import { cloneRepository, parseRepository } from "@fern-api/github";
import { type BootstrapResult, bootstrap, FERN_BOT_EMAIL, FERN_BOT_NAME, GitClient } from "@fern-api/replay";
import { Octokit } from "@octokit/rest";
import { existsSync } from "fs";
import { join } from "path";
import tmp from "tmp-promise";
import { ensureReplayFernignoreEntriesSync } from "./fernignore";

export interface ReplayInitParams {
    /** GitHub repo URI (e.g., "fern-demo/fern-replay-testbed-java-sdk") */
    githubRepo: string;
    /** GitHub token with push + PR permissions */
    token: string;
    /** Report what would happen but don't create PR */
    dryRun?: boolean;
    /** Max commits to scan for generation history */
    maxCommitsToScan?: number;
    /** Title for the PR */
    prTitle?: string;
    /** Body for the PR */
    prBody?: string;
    /** Overwrite existing lockfile if present. Default: false */
    force?: boolean;
    /** Scan git history for existing patches (migration). Default: false */
    importHistory?: boolean;
}

export interface ReplayInitResult {
    /** Bootstrap result from fern-replay */
    bootstrap: BootstrapResult;
    /** URL of the created PR, if not dry-run */
    prUrl?: string;
    /** Branch name used for the PR */
    branch?: string;
}

/**
 * Initialize Replay for an SDK repository.
 *
 * Creates a branch and opens a PR with the replay lockfile.
 *
 * Flow:
 * 1. Clone the SDK repo
 * 2. Run bootstrap() to scan history and create lockfile
 * 3. Ensure .fernignore has replay entries
 * 4. Commit with [fern-replay] prefix (recognized by isGenerationCommit)
 * 5. Push branch and open PR
 *
 * The [fern-replay] commit message prefix ensures the bootstrap commit
 * is NOT treated as a user customization patch by ReplayDetector.
 */
export async function replayInit(params: ReplayInitParams): Promise<ReplayInitResult> {
    const { githubRepo, token, dryRun } = params;

    // 1. Clone the repo into a temp directory
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    const repoPath = tmpDir.path;
    const repository = await cloneRepository({
        githubRepository: githubRepo,
        installationToken: token,
        targetDirectory: repoPath
    });

    const defaultBranch = await repository.getDefaultBranch();

    // 2. Run bootstrap
    const bootstrapResult = await bootstrap(repoPath, {
        dryRun,
        fernignoreAction: "skip",
        maxCommitsToScan: params.maxCommitsToScan,
        force: params.force ?? false,
        importHistory: params.importHistory
    });

    if (!bootstrapResult.generationCommit) {
        return { bootstrap: bootstrapResult };
    }

    if (dryRun) {
        return { bootstrap: bootstrapResult };
    }

    // 3. Ensure .fernignore has replay entries
    ensureReplayFernignoreEntriesSync(repoPath);

    const commitMessage = `[fern-replay] Initialize Replay\n\nTracked ${bootstrapResult.patchesCreated} customization patch(es).\nBase generation: ${bootstrapResult.generationCommit.sha.slice(0, 7)}`;

    // Only add files that actually exist (replay.yml is only created during fernignore migration)
    const filesToAdd = [".fern/replay.lock", ".fern/replay.yml", ".fernignore"].filter((f) =>
        existsSync(join(repoPath, f))
    );

    // Create branch, commit, push, create PR
    const branchName = `fern-replay/init-${Date.now()}`;
    await repository.checkoutOrCreateLocal(branchName);

    const git = new GitClient(repoPath);
    await git.exec(["add", ...filesToAdd]);
    await git.exec([
        "-c",
        `user.name=${FERN_BOT_NAME}`,
        "-c",
        `user.email=${FERN_BOT_EMAIL}`,
        "commit",
        "-m",
        commitMessage
    ]);

    await repository.pushUpstream(branchName);

    // Create PR
    const parsed = parseRepository(githubRepo);
    const octokit = new Octokit({ auth: token });
    const prTitle = params.prTitle ?? "[fern-replay] Initialize Replay for SDK customizations";
    const prBody = params.prBody ?? buildPrBody(bootstrapResult);

    const { data: pr } = await octokit.pulls.create({
        owner: parsed.owner,
        repo: parsed.repo,
        head: branchName,
        base: defaultBranch,
        title: prTitle,
        body: prBody
    });

    return {
        bootstrap: bootstrapResult,
        prUrl: pr.html_url,
        branch: branchName
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

    if (result.prUrl) {
        entries.push({ level: "info", message: `\nPR created: ${result.prUrl}` });
        entries.push({ level: "info", message: "Merge the PR to enable Replay for this repository." });
    } else if (result.branch) {
        entries.push({ level: "info", message: `\nPushed to branch: ${result.branch}` });
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
