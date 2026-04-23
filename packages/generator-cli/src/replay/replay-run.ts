import { LockfileManager, type ReplayPreparation, type ReplayReport, ReplayService } from "@fern-api/replay";
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

/**
 * Opaque handle returned by `replayPrepare()` and consumed by `replayApply()`.
 *
 * Between prepare and apply, HEAD is at the new `[fern-generated]` commit (or unchanged
 * for dry-run / skip-application terminals). Consumers MAY land additional commits on
 * HEAD (e.g. `[fern-autoversion]`) — apply will run patches on top of current HEAD at
 * call time while rebasing stored patches against the pure `[fern-generated]` tree.
 *
 * If apply is never reached, the working tree has the new `[fern-generated]` commit
 * but the lockfile is stale. Callers MUST either call apply (which advances the
 * lockfile) or reset HEAD to `previousGenerationSha`.
 */
export interface PreparedReplay {
    /** @internal Service instance carrying in-memory state across phases. */
    _service: ReplayService;
    /** @internal Preparation state handed to the service's apply phase. */
    _preparation: ReplayPreparation;
    /** Working tree / git repo the replay operates on. */
    outputDir: string;
    /** Flow selected by the service during prepare. */
    flow: ReplayPreparation["flow"];
    /** SHA of the `[fern-generated]` commit before this run; null if no prior generation. */
    previousGenerationSha: string | null;
    /** SHA of the new `[fern-generated]` commit created by prepare (or prior HEAD for dry-run terminals). */
    currentGenerationSha: string;
    /** SHA of main's HEAD captured before prepare mutated anything. */
    baseBranchHead: string | null;
}

export interface ReplayApplyParams {
    /** Don't commit, just stage changes. Default: false */
    stageOnly?: boolean;
    /** Optional logger for diagnostic output */
    logger?: PipelineLogger;
}

/**
 * Phase 1 of the split replay flow. Reads the lockfile, syncs divergent merges if a
 * `fern-generation-base` tag indicates a squash-merged PR, and invokes the replay
 * service's `prepareReplay`. Leaves HEAD at the new `[fern-generated]` commit.
 *
 * Returns `null` when replay isn't initialized (no lockfile). Callers that also need
 * to skip the entire flow in that case should check for `null` before wiring into
 * `replayApply`.
 */
export async function replayPrepare(params: ReplayRunParams): Promise<PreparedReplay | null> {
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
        return null;
    }

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

    const service = new ReplayService(outputDir, { enabled: true });
    let preparation: ReplayPreparation;
    try {
        preparation = await service.prepareReplay({
            cliVersion,
            generatorVersions,
            stageOnly,
            skipApplication,
            baseBranchHead: baseBranchHead ?? undefined
        });
    } catch (error) {
        // Mirror the pre-split contract: replay failures never fail generation.
        // Corrupted lockfiles, unreachable base generations, etc. are logged and
        // the caller proceeds as if replay were disabled for this run.
        logger?.warn("Replay failed, continuing without replay: " + String(error));
        return null;
    }

    return {
        _service: service,
        _preparation: preparation,
        outputDir,
        flow: preparation.flow,
        previousGenerationSha,
        currentGenerationSha: preparation.currentGenerationSha,
        baseBranchHead
    };
}

/**
 * Phase 2 of the split replay flow. Applies patches, rebases them, writes the
 * lockfile, and commits `[fern-replay]` (or stages under `stageOnly`). Refreshes
 * `baseBranchHead` from the lockfile afterward in case the service recorded a
 * newer value during apply. Also ensures `.fernignore` / `.gitattributes` entries
 * exist.
 *
 * Errors from `applyPreparedReplay` are caught and logged; a null report is
 * returned rather than aborting generation, mirroring the pre-split behavior.
 */
export async function replayApply(prepared: PreparedReplay, params: ReplayApplyParams = {}): Promise<ReplayRunResult> {
    const { stageOnly = false, logger } = params;

    let report: ReplayReport;
    try {
        report = await prepared._service.applyPreparedReplay(prepared._preparation, { stageOnly });
    } catch (error) {
        logger?.warn("Replay failed, continuing without replay: " + String(error));
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: prepared.previousGenerationSha,
            currentGenerationSha: prepared.currentGenerationSha,
            baseBranchHead: prepared.baseBranchHead
        };
    }

    // The service may have recorded a more recent baseBranchHead in the lockfile
    // during apply (e.g., a bootstrap write). Prefer the persisted value if present.
    let resolvedBaseBranchHead = prepared.baseBranchHead;
    try {
        const freshLockManager = new LockfileManager(prepared.outputDir);
        if (freshLockManager.exists()) {
            const freshLock = freshLockManager.read();
            const latestGen = freshLock.generations.find((g) => g.commit_sha === freshLock.current_generation);
            if (latestGen?.base_branch_head) {
                resolvedBaseBranchHead = latestGen.base_branch_head;
            }
        }
    } catch {
        // proceed with prepared.baseBranchHead
    }

    const fernignoreUpdated = await ensureReplayFernignoreEntries(prepared.outputDir);
    await ensureGitattributesEntries(prepared.outputDir);

    return {
        report,
        fernignoreUpdated,
        previousGenerationSha: prepared.previousGenerationSha,
        currentGenerationSha: prepared.currentGenerationSha,
        baseBranchHead: resolvedBaseBranchHead
    };
}

/**
 * Backwards-compatible atomic entry point. Composes `replayPrepare` +
 * `replayApply` with byte-identical behavior for existing callers.
 */
export async function replayRun(params: ReplayRunParams): Promise<ReplayRunResult> {
    const prepared = await replayPrepare(params);
    if (prepared == null) {
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: null,
            currentGenerationSha: null,
            baseBranchHead: null
        };
    }
    return replayApply(prepared, { stageOnly: params.stageOnly, logger: params.logger });
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
