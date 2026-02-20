import { LockfileManager, type ReplayReport, ReplayService } from "@fern-api/replay";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const REPLAY_FERNIGNORE_ENTRIES = [".fern/replay.lock", ".fern/replay.yml"];

export interface ReplayRunParams {
    outputDir: string;
    cliVersion?: string;
    generatorVersions?: Record<string, string>;
    /** Don't commit, just stage changes. Default: false */
    stageOnly?: boolean;
    /** Generator name for namespaced tag lookup (e.g. "fernapi/fern-typescript-node-sdk") */
    generatorName?: string;
    /** Commit generation + update lockfile, skip patch detection/application */
    skipApplication?: boolean;
}

export interface ReplayRunResult {
    /** null if replay wasn't initialized (no lockfile) */
    report: ReplayReport | null;
    /** Whether .fernignore was updated */
    fernignoreUpdated: boolean;
    /** SHA of the [fern-generated] commit before this replay run (null if first generation or unreadable) */
    previousGenerationSha: string | null;
    /** SHA of the [fern-generated] commit created by this replay run (null if replay didn't run or unreadable) */
    currentGenerationSha: string | null;
    /** SHA of main's HEAD before replay ran. Always on main's lineage, stable after squash merges. */
    baseBranchHead: string | null;
}

/**
 * Run Replay to apply user customizations on top of freshly generated SDK files.
 * Only runs if .fern/replay.lock exists (indicating Replay has been initialized).
 *
 * Unexpected replay failures are returned as null report — generation should
 * not fail because of replay bugs.
 */
export async function replayRun(params: ReplayRunParams): Promise<ReplayRunResult> {
    const { outputDir, cliVersion, generatorVersions, stageOnly = false, generatorName, skipApplication } = params;
    const lockfilePath = join(outputDir, ".fern", "replay.lock");

    if (!existsSync(lockfilePath)) {
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: null,
            currentGenerationSha: null,
            baseBranchHead: null
        };
    }

    // Capture main's HEAD before replay modifies anything.
    // This is always on main's lineage, unlike generation SHAs which
    // may end up on dead branches after squash merges.
    const baseBranchHead = gitRevParse(outputDir, "HEAD");

    // Read the lockfile before replay to capture the previous generation SHA
    // and the previous base_branch_head for divergent merge detection.
    let previousGenerationSha: string | null = null;
    let prevBaseBranchHead: string | null = null;
    try {
        const lockManager = new LockfileManager(outputDir);
        if (lockManager.exists()) {
            const lock = lockManager.read();
            previousGenerationSha = lock.current_generation;
            const latestGen = lock.generations.find((g) => g.commit_sha === lock.current_generation);
            prevBaseBranchHead = latestGen?.base_branch_head ?? null;
        }
    } catch {
        // If lockfile can't be read, proceed without SHA
    }

    // Detect merged divergent PRs via the fern-generation-base tag.
    // After a divergent PR is squash-merged, the lockfile's current_generation still
    // points to the old generation (the [fern-generated] commit's tree preserves the
    // pre-replay lockfile). We must detect this and call syncFromDivergentMerge() so
    // replay knows the new generation happened.
    //
    // We do NOT gate on !isReachable because the old generation SHA IS reachable
    // (it's a real commit on main's history). Instead we always check for the tag.
    if (previousGenerationSha != null) {
        const sanitizedName = generatorName?.replace(/\//g, "--");
        const namespacedTag = sanitizedName != null ? `fern-generation-base--${sanitizedName}` : null;
        const tagSha =
            (namespacedTag != null ? gitRevParse(outputDir, namespacedTag) : null) ??
            gitRevParse(outputDir, "fern-generation-base");

        let shouldSync = false;

        if (tagSha != null) {
            const tagParent = gitRevParse(outputDir, `${tagSha}^`);
            if (tagParent === prevBaseBranchHead || tagParent === previousGenerationSha) {
                // Tag belongs to this generation cycle (its parent is our baseBranchHead
                // or previousGenerationSha). Use tree distance to determine if the
                // divergent PR was merged or abandoned.
                const tagDistance = gitDiffNameOnly(outputDir, tagSha, "HEAD").length;
                // Use prevBaseBranchHead (always on main's lineage) as fallback when
                // previousGenerationSha is unreachable after squash merge + GC.
                const lockDistance = gitDiffNameOnly(outputDir, prevBaseBranchHead ?? previousGenerationSha, "HEAD").length;
                shouldSync = tagDistance < lockDistance;
            }
        }

        if (shouldSync && tagSha != null) {
            const syncService = new ReplayService(outputDir, { enabled: true });
            await syncService.syncFromDivergentMerge(tagSha, {
                cliVersion,
                generatorVersions,
                baseBranchHead: baseBranchHead ?? undefined
            });

            // Re-read previousGenerationSha since syncFromDivergentMerge updated it
            try {
                const freshLockManager = new LockfileManager(outputDir);
                if (freshLockManager.exists()) {
                    previousGenerationSha = freshLockManager.read().current_generation;
                }
            } catch {
                // proceed with original SHA
            }
        }
    }

    const service = new ReplayService(outputDir, {
        enabled: true
    });

    let report: ReplayReport;
    try {
        report = await service.runReplay({
            cliVersion,
            generatorVersions,
            stageOnly,
            skipApplication,
            baseBranchHead: baseBranchHead ?? undefined
        });
    } catch {
        // Don't fail generation because of replay errors
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha,
            currentGenerationSha: null,
            baseBranchHead
        };
    }

    // Read the lockfile again to capture the current generation SHA and resolved baseBranchHead
    let currentGenerationSha: string | null = null;
    let resolvedBaseBranchHead: string | null = baseBranchHead;
    try {
        const freshLockManager = new LockfileManager(outputDir);
        if (freshLockManager.exists()) {
            const freshLock = freshLockManager.read();
            currentGenerationSha = freshLock.current_generation;
            const latestGen = freshLock.generations.find((g) => g.commit_sha === freshLock.current_generation);
            if (latestGen?.base_branch_head) {
                resolvedBaseBranchHead = latestGen.base_branch_head;
            }
        }
    } catch {
        // If lockfile can't be read, proceed with captured values
    }

    const fernignoreUpdated = await ensureReplayFernignoreEntries(outputDir);

    return {
        report,
        fernignoreUpdated,
        previousGenerationSha,
        currentGenerationSha,
        baseBranchHead: resolvedBaseBranchHead
    };
}

/**
 * Resolves a git revision to its full SHA. Returns null if the revision doesn't exist.
 */
function gitRevParse(cwd: string, rev: string): string | null {
    try {
        return execFileSync("git", ["rev-parse", "--verify", rev], {
            cwd,
            encoding: "utf-8",
            stdio: "pipe"
        }).trim();
    } catch {
        return null;
    }
}

/**
 * Returns the list of files changed between two git revisions.
 */
function gitDiffNameOnly(cwd: string, from: string, to: string): string[] {
    try {
        const output = execFileSync("git", ["diff", "--name-only", from, to], {
            cwd,
            encoding: "utf-8",
            stdio: "pipe"
        });
        return output.trim().split("\n").filter(Boolean);
    } catch {
        return [];
    }
}

async function ensureReplayFernignoreEntries(outputDir: string): Promise<boolean> {
    const fernignorePath = join(outputDir, ".fernignore");
    let content = "";
    try {
        content = await readFile(fernignorePath, "utf-8");
    } catch {
        // .fernignore doesn't exist yet
    }
    const lines = content.split("\n");
    const toAdd = REPLAY_FERNIGNORE_ENTRIES.filter((entry) => !lines.some((line) => line.trim() === entry));
    if (toAdd.length > 0) {
        const suffix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
        await writeFile(fernignorePath, content + suffix + toAdd.join("\n") + "\n", "utf-8");
        return true;
    }
    return false;
}
