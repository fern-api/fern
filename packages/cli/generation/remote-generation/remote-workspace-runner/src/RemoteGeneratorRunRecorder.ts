import type { PublishTarget } from "./publishTarget.js";

export type { PublishTarget };

/**
 * Why a generator was not executed in automation fan-out mode.
 *   - "local_output": output is configured for local-file-system (can't run remotely).
 *   - "opted_out":    `automations.generate: false`, `autorelease: false`, or the root
 *                     `autorelease: false` applies.
 *   - "no_diff":      Fiddle ran the generator and determined the output is identical to the
 *                     current SDK repo contents. Reported today as a `recordSuccess` with
 *                     `noChangesDetected: true`; the skip-reason is kept in the union so
 *                     callers that prefer to classify no-diff as "skipped" can do so.
 */
export type GeneratorSkipReason = "local_output" | "opted_out" | "no_diff";

/** Shared identity fields for every recorder call. Flattened into each method's args below. */
interface GeneratorRunIdentity {
    apiName: string | undefined;
    groupName: string;
    generatorName: string;
    /**
     * `https://github.com/{owner}/{repo}` for generators whose output writes to a GitHub repo.
     * `undefined` for local-file-system / publish-only targets.
     */
    outputRepoUrl: string | undefined;
    /** Absolute path to the `generators.yml` that declared this generator, when known. */
    generatorsYmlAbsolutePath: string | undefined;
    /** 1-indexed line where this generator's `name:` entry lives in the above file, when resolvable. */
    generatorsYmlLineNumber: number | undefined;
}

/**
 * Records per-generator outcomes when generation is fanned out across multiple generators.
 *
 * When an {@link AutomationRunOptions} is provided to {@link runRemoteGenerationForAPIWorkspace},
 * the runner catches per-generator failures so siblings still run, and reports each outcome here.
 * When absent, the runner preserves its default behavior of throwing on the first failure.
 */
export interface RemoteGeneratorRunRecorder {
    recordSuccess(
        args: GeneratorRunIdentity & {
            version: string | null;
            durationMs: number;
            /**
             * URL of the pull request Fiddle opened for the generated SDK, when the output mode
             * creates PRs. Undefined for push / commit-and-release / non-GitHub modes.
             */
            pullRequestUrl: string | undefined;
            /**
             * True when Fiddle reported the generation produced no changes vs. the current SDK
             * repo. Undefined when the diff analyzer didn't run.
             */
            noChangesDetected: boolean | undefined;
            /**
             * Structured pointer to where the SDK was published (npm, PyPI, Maven Central, etc.),
             * derived from Fiddle's package coordinates. Undefined when the generator targets
             * GitHub-only or local filesystem.
             */
            publishTarget: PublishTarget | undefined;
        }
    ): void;

    recordFailure(
        args: GeneratorRunIdentity & {
            errorMessage: string;
            durationMs: number;
        }
    ): void;

    /**
     * Records a generator that was not executed. Called at config-filter time, before any
     * generation work — so no version, duration, or PR fields apply.
     */
    recordSkipped(args: GeneratorRunIdentity & { reason: GeneratorSkipReason }): void;
}

/**
 * Presence of this object on a call to `generateAPIWorkspaces` / `generateWorkspace` /
 * `runRemoteGenerationForAPIWorkspace` means "fan-out automation mode":
 *   - Iterate every group and every generator instead of honoring default-group.
 *   - Record generators opted out via `automations.generate: false` / `autorelease: false` /
 *     local-file-system output as skipped — but reject explicit `--generator` targeting of an
 *     opted-out one.
 *   - Per-generator failures are captured via the recorder and siblings keep running.
 *   - Config errors (missing group, bad --generator) still throw loudly.
 */
export interface AutomationRunOptions {
    recorder: RemoteGeneratorRunRecorder;
}
