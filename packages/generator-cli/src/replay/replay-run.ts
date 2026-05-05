import { bootstrap, LockfileManager, type ReplayPreparation, type ReplayReport, ReplayService } from "@fern-api/replay";
import { execFileSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
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
    /** null if replay wasn't initialized (no lockfile) OR if prepare/apply crashed (see failureReason) */
    report: ReplayReport | null;
    /** Whether .fernignore was updated */
    fernignoreUpdated: boolean;
    /** SHA of the [fern-generated] commit before this replay run (null if first generation or unreadable) */
    previousGenerationSha: string | null;
    /** SHA of the [fern-generated] commit created by this replay run (null if replay didn't run or unreadable) */
    currentGenerationSha: string | null;
    /** SHA of main's HEAD before replay ran. Always on main's lineage, stable after squash merges. */
    baseBranchHead: string | null;
    /** True when this run inlined `bootstrap()` to create the lockfile (auto-init from `fern generate`). */
    autoBootstrapped: boolean;
    /**
     * True when the lockfile-missing branch was entered, regardless of bootstrap outcome.
     * Distinct from `autoBootstrapped` (true only on success) — together they let telemetry
     * distinguish "tried but no anchor / threw" from "lockfile already existed".
     */
    bootstrapAttempted: boolean;
    /**
     * Set when prepare or apply crashed (e.g. corrupted lockfile, git failure, library bug).
     * Distinguishes a real failure from "no replay initialized" (lockfile missing → null report, no failureReason).
     * Generation never fails on replay errors — callers should surface this for telemetry/logging only.
     */
    failureReason?: string;
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
    /** True when this run inlined `bootstrap()` to create the lockfile (auto-init from `fern generate`). */
    autoBootstrapped: boolean;
    /** True when the lockfile-missing branch was entered, regardless of bootstrap outcome. */
    bootstrapAttempted: boolean;
}

export interface ReplayApplyParams {
    /** Don't commit, just stage changes. Default: false */
    stageOnly?: boolean;
    /** Optional logger for diagnostic output */
    logger?: PipelineLogger;
}

/**
 * Out-parameter that lets callers observe what `replayPrepare` did even when it
 * returns `null` (bootstrap couldn't anchor, or threw). Without this, the
 * `bootstrapAttempted` signal would be lost on the null-prepared paths through
 * `replayRun` and `GenerationCommitStep` — both of which forward to telemetry.
 */
export interface ReplayPrepareState {
    /** True when the lockfile-missing branch was entered (kill switch off + no lockfile). */
    bootstrapAttempted: boolean;
}

/**
 * Phase 1 of the split replay flow. Reads the lockfile, syncs divergent merges if a
 * `fern-generation-base` tag indicates a squash-merged PR, and invokes the replay
 * service's `prepareReplay`. Leaves HEAD at the new `[fern-generated]` commit.
 *
 * If no lockfile exists, runs `bootstrap()` inline to auto-initialize replay — this
 * bakes `fern replay init` into `fern generate` so customers no longer need a
 * separate init step. Returns `null` when (a) the repo has no prior `[fern-generated]`
 * commit to anchor on, or (b) bootstrap throws (logged + cleaned up). Case (a) self-heals
 * once a baseline commit exists; case (b) requires the underlying issue (disk full,
 * permissions) to be resolved before the next run can succeed. The auto-bootstrap
 * branch can be disabled via `FERN_DISABLE_AUTO_BOOTSTRAP=true`.
 */
export async function replayPrepare(
    params: ReplayRunParams,
    state?: ReplayPrepareState
): Promise<PreparedReplay | null> {
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
    let autoBootstrapped = false;
    let bootstrapAttempted = false;

    if (!existsSync(lockfilePath)) {
        // Kill switch: customers can disable auto-bootstrap if a regression slips
        // through. Standalone `fern replay init` continues to work unaffected.
        if (process.env.FERN_DISABLE_AUTO_BOOTSTRAP === "true" || process.env.FERN_DISABLE_AUTO_BOOTSTRAP === "1") {
            return null;
        }

        // Auto-bootstrap so customers don't need to run `fern replay init` separately.
        // bootstrap() writes the lockfile, .fernignore entries, and .gitattributes;
        // the subsequent prepareReplay commit captures them via `git add -A`.
        // Brand-new repos with no prior `[fern-generated]` commit skip replay this
        // run — next generate establishes the baseline. `importHistory: false` is
        // load-bearing: scanning past patches inline would blow the generate-time
        // budget, and "track future edits only" is the safe default for opt-out.
        bootstrapAttempted = true;
        if (state) {
            state.bootstrapAttempted = true;
        }
        try {
            const bootstrapResult = await bootstrap(outputDir, {
                fernignoreAction: "skip",
                force: false,
                importHistory: false
            });
            if (bootstrapResult.generationCommit == null) {
                return null;
            }
            autoBootstrapped = true;
        } catch (error) {
            logger?.warn("Replay auto-bootstrap failed, continuing without replay: " + String(error));
            // Bootstrap is not transactional — it may have written the lockfile
            // before throwing on .fernignore or .gitattributes. Clean up to prevent
            // a half-initialized state from corrupting the next run (the lockfile
            // would be anchored on pre-generation HEAD instead of a [fern-generated]
            // commit, and the next run would skip bootstrap and read the broken anchor).
            try {
                if (existsSync(lockfilePath)) {
                    unlinkSync(lockfilePath);
                }
            } catch {
                // best-effort; corrupt-lockfile resilience handles next run
            }
            return null;
        }
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
                try {
                    const syncService = new ReplayService(outputDir, { enabled: true });
                    await syncService.syncFromDivergentMerge(tagSha, {
                        cliVersion,
                        generatorVersions,
                        baseBranchHead: baseBranchHead ?? undefined
                    });
                } catch (error) {
                    // syncFromDivergentMerge can throw on git rewrite failures.
                    // Wrap as ReplayPrepareError so callers (replayRun,
                    // GenerationCommitStep) catch a single typed error and don't
                    // forward raw String(error) (which can carry paths/SHAs) into
                    // telemetry/logs.
                    logger?.warn("Replay divergent-merge sync failed, continuing without sync: " + String(error));
                    throw new ReplayPrepareError(String(error), error);
                }

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
        // Throwing distinguishes a real crash from "no lockfile" (which still
        // returns null above); callers (replayRun, GenerationCommitStep) catch
        // and record failureReason so telemetry/logs don't mislabel as success.
        logger?.warn("Replay prepare failed, continuing without replay: " + String(error));
        throw new ReplayPrepareError(String(error), error);
    }

    return {
        _service: service,
        _preparation: preparation,
        outputDir,
        flow: preparation.flow,
        previousGenerationSha,
        currentGenerationSha: preparation.currentGenerationSha,
        baseBranchHead,
        autoBootstrapped,
        bootstrapAttempted
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
        logger?.warn("Replay apply failed, continuing without replay: " + String(error));
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: prepared.previousGenerationSha,
            currentGenerationSha: prepared.currentGenerationSha,
            baseBranchHead: prepared.baseBranchHead,
            autoBootstrapped: prepared.autoBootstrapped,
            bootstrapAttempted: prepared.bootstrapAttempted,
            failureReason: String(error)
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
        baseBranchHead: resolvedBaseBranchHead,
        autoBootstrapped: prepared.autoBootstrapped,
        bootstrapAttempted: prepared.bootstrapAttempted
    };
}

/**
 * Backwards-compatible atomic entry point. Composes `replayPrepare` +
 * `replayApply` with byte-identical behavior for existing callers.
 */
export async function replayRun(params: ReplayRunParams): Promise<ReplayRunResult> {
    const prepareState: ReplayPrepareState = { bootstrapAttempted: false };
    let prepared: PreparedReplay | null;
    try {
        prepared = await replayPrepare(params, prepareState);
    } catch (error) {
        // Prepare crashed (already warned by replayPrepare). Surface the failure
        // so downstream telemetry/logging records success: false rather than
        // silently mislabeling as first-generation.
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: null,
            currentGenerationSha: null,
            baseBranchHead: null,
            autoBootstrapped: false,
            bootstrapAttempted: prepareState.bootstrapAttempted,
            failureReason: error instanceof ReplayPrepareError ? error.reason : String(error)
        };
    }
    if (prepared == null) {
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: null,
            currentGenerationSha: null,
            baseBranchHead: null,
            autoBootstrapped: false,
            bootstrapAttempted: prepareState.bootstrapAttempted
        };
    }
    return replayApply(prepared, { stageOnly: params.stageOnly, logger: params.logger });
}

/**
 * Thrown by `replayPrepare` when the underlying replay service crashes (corrupted
 * lockfile, git failure, library bug). Callers must catch this and decide how to
 * surface the failure — generation MUST NOT abort on replay errors.
 */
export class ReplayPrepareError extends Error {
    public readonly reason: string;

    constructor(reason: string, cause: unknown) {
        // ES2022 Error.cause — Sentry's linkedErrorsIntegration chains automatically.
        super(`Replay prepare failed: ${reason}`, { cause });
        // Restore the prototype chain — `extends Error` is broken by ES5 transpile
        // (TS targets node18 here, so it's defensive but matches the codebase
        // pattern in `generators/base/src/GeneratorError.ts`).
        Object.setPrototypeOf(this, new.target.prototype);
        // V8-specific: omit this constructor frame from the captured stack so the
        // trace points to the throw site, not the Error class.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = this.constructor.name;
        this.reason = reason;
    }
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
