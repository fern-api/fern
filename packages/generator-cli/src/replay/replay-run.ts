import { bootstrap, type ReplayPreparation, type ReplayReport, ReplayService } from "@fern-api/replay";
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
    /**
     * True when the replay run left `.fern/replay.lock` COMMITTED (tracked and
     * clean in git). GithubStep uses this to decide whether it still owns the
     * commit: when false (engine left the lock untracked/staged, stageOnly, or
     * the run failed), GithubStep's `git add -A` commit must sweep the lock so
     * it isn't lost on push.
     *
     * Derived empirically from git state rather than from a typed report field:
     * the pinned `@fern-api/replay` version may predate first-generation lock
     * seeding, and inferring "committed" from flow alone against an engine that
     * never committed would drop the lock from the push entirely.
     */
    replayCommitted: boolean;
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
 * Phase 1 of the split replay flow. Reads the lockfile and invokes the replay service's
 * `prepareReplay`. Leaves HEAD at the new `[fern-generated]` commit.
 *
 * Divergent-merge recovery (squash-merge, force-push, garbage-collected prior generation)
 * is handled inside `@fern-api/replay` via the derived scan boundary in
 * `findPreviousGenerationFromHistory` — no consumer-side gauntlet is needed.
 *
 * If no lockfile exists, runs `bootstrap()` inline to auto-initialize replay — this
 * bakes `fern replay init` into `fern generate` so customers no longer need a
 * separate init step. When the repo has no prior `[fern-generated]` commit to anchor
 * on, bootstrap writes nothing and we fall through to `prepareReplay()`, which selects
 * the engine's first-generation flow: it creates the `[fern-generated]` commit and
 * seeds the lockfile anchored on it — so brand-new repos converge at generation one
 * instead of depending on generation #2's history scan finding the gen-1 commit
 * (the dependency that broke under a depth-1 clone). A repo with zero commits
 * (unborn HEAD) skips the bootstrap scan entirely — `git log` would fail — and seeds
 * the same way. Returns `null` only when bootstrap throws (logged + cleaned up) or
 * the kill switch is set; the kill switch (`FERN_DISABLE_AUTO_BOOTSTRAP=true`)
 * deliberately gates first-generation seeding too.
 */
export async function replayPrepare(
    params: ReplayRunParams,
    state?: ReplayPrepareState
): Promise<PreparedReplay | null> {
    const { outputDir, cliVersion, generatorVersions, stageOnly = false, skipApplication, logger } = params;
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
        // Bootstrap is always a clean start anchored on HEAD: replay tracks
        // customizations committed after this point only.
        bootstrapAttempted = true;
        if (state) {
            state.bootstrapAttempted = true;
        }
        if (hasUnbornHead(outputDir)) {
            // A git repo with zero commits (brand-new SDK repo). bootstrap()'s
            // history scan (`git log`) would throw here, and there is nothing
            // to anchor on anyway — skip bootstrap entirely and fall through to
            // prepareReplay(), whose first-generation flow creates the root
            // [fern-generated] commit and seeds the lock anchored on it.
        } else {
            try {
                const bootstrapResult = await bootstrap(outputDir, {
                    force: false
                });
                // generationCommit == null: brand-new repo with no prior
                // [fern-generated] commit. Bootstrap stays anchored-or-nothing (a
                // lock anchored on pre-generation HEAD would corrupt the next run),
                // so it wrote nothing. Fall through to prepareReplay(): with no
                // lockfile it selects the first-generation flow, which creates the
                // [fern-generated] commit and seeds the lock anchored on it.
                // autoBootstrapped stays false — bootstrap did not anchor; the
                // flow/replayCommitted fields describe what seeding did instead.
                if (bootstrapResult.generationCommit != null) {
                    autoBootstrapped = true;
                }
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
    }

    const service = new ReplayService(outputDir, { enabled: true });
    let preparation: ReplayPreparation;
    try {
        preparation = await service.prepareReplay({
            cliVersion,
            generatorVersions,
            stageOnly,
            skipApplication
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
        previousGenerationSha: preparation.previousGenerationSha,
        currentGenerationSha: preparation.currentGenerationSha,
        autoBootstrapped,
        bootstrapAttempted
    };
}

/**
 * Phase 2 of the split replay flow. Applies patches, rebases them, writes the
 * lockfile, and commits `[fern-replay]` (or stages under `stageOnly`). Also
 * ensures `.fernignore` / `.gitattributes` entries exist.
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
            autoBootstrapped: prepared.autoBootstrapped,
            bootstrapAttempted: prepared.bootstrapAttempted,
            failureReason: String(error),
            replayCommitted: false
        };
    }

    const fernignoreUpdated = await ensureReplayFernignoreEntries(prepared.outputDir);
    await ensureGitattributesEntries(prepared.outputDir);

    return {
        report,
        fernignoreUpdated,
        previousGenerationSha: prepared.previousGenerationSha,
        currentGenerationSha: prepared.currentGenerationSha,
        autoBootstrapped: prepared.autoBootstrapped,
        bootstrapAttempted: prepared.bootstrapAttempted,
        replayCommitted: isLockfileCommitted(prepared.outputDir)
    };
}

/**
 * True when `outputDir` is a git work tree whose HEAD has no commits yet
 * (`git init` just ran — the brand-new SDK repo case). Returns false for
 * non-git directories so bootstrap() still surfaces those as failures.
 */
function hasUnbornHead(outputDir: string): boolean {
    try {
        execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
            cwd: outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        });
    } catch {
        return false;
    }
    try {
        execFileSync("git", ["rev-parse", "--verify", "HEAD"], {
            cwd: outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        });
        return false;
    } catch {
        return true;
    }
}

/**
 * Empirical "did replay commit the lockfile?" check: the lock is tracked by
 * git AND clean in the working tree. Untracked (engine versions that leave
 * the first-gen lock on disk only), staged-but-uncommitted (`stageOnly`), and
 * missing locks all report false — in those states GithubStep's own commit is
 * still responsible for sweeping the lock into the pushed branch.
 */
function isLockfileCommitted(outputDir: string): boolean {
    try {
        const status = execFileSync("git", ["status", "--porcelain", "--", ".fern/replay.lock"], {
            cwd: outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        }).trim();
        if (status !== "") {
            return false;
        }
        const tracked = execFileSync("git", ["ls-files", "--", ".fern/replay.lock"], {
            cwd: outputDir,
            encoding: "utf-8",
            stdio: "pipe"
        }).trim();
        return tracked !== "";
    } catch {
        return false;
    }
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
            autoBootstrapped: false,
            bootstrapAttempted: prepareState.bootstrapAttempted,
            failureReason: error instanceof ReplayPrepareError ? error.reason : String(error),
            replayCommitted: false
        };
    }
    if (prepared == null) {
        return {
            report: null,
            fernignoreUpdated: false,
            previousGenerationSha: null,
            currentGenerationSha: null,
            autoBootstrapped: false,
            bootstrapAttempted: prepareState.bootstrapAttempted,
            replayCommitted: false
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
