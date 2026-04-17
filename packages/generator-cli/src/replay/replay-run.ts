import { LockfileManager, type ReplayReport, ReplayService } from "@fern-api/replay";
import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import type { PipelineLogger } from "../pipeline/PipelineLogger";
import { ensureGitattributesEntries, ensureReplayFernignoreEntries } from "./fernignore";

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
    /** Optional logger for diagnostic output */
    logger?: PipelineLogger;
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

export async function replayRun(params: ReplayRunParams): Promise<ReplayRunResult> {
    const {
        outputDir,
        cliVersion,
        generatorVersions,
        stageOnly = false,
        generatorName,
        skipApplication,
        logger
    } = params;
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

    // Always check tag — old generation IS reachable, so !isReachable is not a valid gate
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
                const tagDistance = gitDiffNameOnly(outputDir, tagSha, "HEAD").length;
                const lockDistance = gitDiffNameOnly(
                    outputDir,
                    prevBaseBranchHead ?? previousGenerationSha,
                    "HEAD"
                ).length;
                shouldSync = tagDistance < lockDistance;
            }
        }

        if (shouldSync && tagSha != null) {
            if (!isTagMergedIntoHead(outputDir, tagSha)) {
                logger?.warn(
                    `fern-generation-base tag ${tagSha} is not reachable from HEAD — skipping divergent-merge sync. ` +
                        `The tag likely points at an unmerged generation (PR closed without merge).`
                );
            } else {
                const syncService = new ReplayService(outputDir, { enabled: true });
                await syncService.syncFromDivergentMerge(tagSha, {
                    cliVersion,
                    generatorVersions,
                    baseBranchHead: baseBranchHead ?? undefined
                });

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
    } catch (error) {
        // Don't fail generation because of replay errors
        logger?.warn("Replay failed, continuing without replay: " + String(error));
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha,
            currentGenerationSha: null,
            baseBranchHead
        };
    }

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
    await ensureGitattributesEntries(outputDir);

    return {
        report,
        fernignoreUpdated,
        previousGenerationSha,
        currentGenerationSha,
        baseBranchHead: resolvedBaseBranchHead
    };
}

/**
 * True when the tag's commit either is an ancestor of HEAD (fast-forward merge)
 * or its tree matches a commit in HEAD's recent history (squash merge).
 * False when the tag points at an orphaned synthetic commit — e.g. a clean-replay
 * PR that was closed without merging.
 *
 * Bounded to 500 commits: tag merges are always recent relative to the current
 * generation, and an unbounded `git log` on large repos is expensive.
 *
 * Exported for testing.
 */
export function isTagMergedIntoHead(cwd: string, tagSha: string): boolean {
    try {
        execFileSync("git", ["merge-base", "--is-ancestor", tagSha, "HEAD"], {
            cwd,
            stdio: "pipe"
        });
        return true;
    } catch {
        // not an ancestor — fall through to tree-identity check for squash merges
    }
    const tagTree = gitRevParse(cwd, `${tagSha}^{tree}`);
    if (tagTree == null) {
        return false;
    }
    try {
        const trees = execFileSync("git", ["log", "HEAD", "--format=%T", "--max-count=500"], {
            cwd,
            encoding: "utf-8",
            stdio: "pipe"
        });
        return trees.split("\n").some((t) => t.trim() === tagTree);
    } catch {
        return false;
    }
}

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
