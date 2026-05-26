import type { generatorsYml } from "@fern-api/configuration";
import type { PipelineResult, ReplayStepResult } from "@fern-api/generator-cli/pipeline";
import { CONSOLE_LOGGER, type Logger } from "@fern-api/logger";
import type { InteractiveTaskContext, PosthogEvent, TaskResult } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it, vi } from "vitest";

import {
    extractVersionFromLogMessage,
    FIDDLE_PIPELINE_RESULT_LOG_REGEX,
    RemoteTaskHandler,
    tryParseReplayResult
} from "../RemoteTaskHandler.js";

/**
 * Snapshot test for the Fiddle log-format coupling. If Fiddle ever changes the
 * exact prefix string in `GithubFiddleTask.java#974` from
 * `"Pipeline: raw result (N bytes): {JSON}"`, this regex stops matching and
 * cloud `replay` PostHog events stop firing. Locking the regex here so any
 * drift surfaces as a noisy diff rather than silent telemetry loss.
 *
 * Source of truth: /Users/tanmay/Documents/fern/fiddle/fiddle-coordinator/src/main/java/com/fern/fiddle/coordinator/task/GithubFiddleTask.java:974
 */
describe("FIDDLE_PIPELINE_RESULT_LOG_REGEX", () => {
    it("locks the exact pattern Fiddle's GithubFiddleTask.java#974 emits", () => {
        expect(FIDDLE_PIPELINE_RESULT_LOG_REGEX.source).toBe("^Pipeline: raw result \\(\\d+ bytes\\): (\\{.*\\})$");
    });
});

describe("tryParseReplayResult", () => {
    function makeReplayResult(): ReplayStepResult {
        return {
            success: true,
            executed: true,
            flow: "normal-regeneration",
            patchesDetected: 3,
            patchesApplied: 3,
            patchesWithConflicts: 0
        };
    }

    function makePipelineResult(): PipelineResult {
        return {
            success: true,
            steps: { replay: makeReplayResult() }
        };
    }

    it("extracts the replay step from a well-formed Fiddle log line", () => {
        const json = JSON.stringify(makePipelineResult());
        const message = `Pipeline: raw result (${json.length} bytes): ${json}`;
        expect(tryParseReplayResult(message)).toMatchObject({
            flow: "normal-regeneration",
            patchesDetected: 3,
            patchesApplied: 3
        });
    });

    it("returns undefined when the line doesn't match the prefix", () => {
        expect(tryParseReplayResult("Pipeline: completed successfully")).toBeUndefined();
        expect(tryParseReplayResult("[replay] flow=normal-regeneration detected=0")).toBeUndefined();
        expect(tryParseReplayResult("Generated files. View here: https://...")).toBeUndefined();
        expect(tryParseReplayResult("")).toBeUndefined();
    });

    it("returns undefined on malformed JSON without throwing", () => {
        const message = "Pipeline: raw result (12 bytes): {not valid json";
        expect(() => tryParseReplayResult(message)).not.toThrow();
        expect(tryParseReplayResult(message)).toBeUndefined();
    });

    it("returns undefined when the pipeline result has no replay step", () => {
        const json = JSON.stringify({ success: true, steps: {} });
        const message = `Pipeline: raw result (${json.length} bytes): ${json}`;
        expect(tryParseReplayResult(message)).toBeUndefined();
    });
});

/**
 * End-to-end test harness for the cloud replay-event emit. Drives a fake
 * `remoteTask` through `processUpdate`, asserts `instrumentPostHogEvent` is
 * called exactly once with the expected schema and `surface: "fiddle"`.
 */
describe("RemoteTaskHandler.processUpdate — replay PostHog emission", () => {
    function makeReplayResult(): ReplayStepResult {
        return {
            success: true,
            executed: true,
            flow: "normal-regeneration",
            patchesDetected: 7,
            patchesApplied: 6,
            patchesWithConflicts: 1,
            patchesAbsorbed: 2,
            patchesRepointed: 0,
            patchesContentRebased: 1,
            patchesKeptAsUserOwned: 3,
            unresolvedPatches: [
                {
                    patchId: "patch-x",
                    patchMessage: "x",
                    files: ["a.ts"],
                    conflictDetails: [{ file: "a.ts", conflictReason: "same-line-edit" }]
                }
            ]
        };
    }

    function makeFiddlePipelineResultLogLine(replay: ReplayStepResult): string {
        const payload: PipelineResult = { success: true, steps: { replay } };
        const json = JSON.stringify(payload);
        return `Pipeline: raw result (${json.length} bytes): ${json}`;
    }

    function makeMockContext(): {
        context: InteractiveTaskContext;
        captured: PosthogEvent[];
    } {
        const captured: PosthogEvent[] = [];
        const silentLogger: Logger = {
            ...CONSOLE_LOGGER,
            log: vi.fn(),
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn()
        };
        const failAndThrow = (() => {
            throw new Error("failAndThrow");
        }) as InteractiveTaskContext["failAndThrow"];
        const context: InteractiveTaskContext = {
            logger: silentLogger,
            takeOverTerminal: vi.fn(),
            failAndThrow,
            failWithoutThrowing: vi.fn(),
            captureException: vi.fn(),
            getResult: vi.fn().mockReturnValue(0 satisfies TaskResult),
            getLastFailureMessage: vi.fn(),
            addInteractiveTask: vi.fn(),
            runInteractiveTask: vi.fn(),
            instrumentPostHogEvent: (event: PosthogEvent) => {
                captured.push(event);
            },
            setSubtitle: vi.fn()
        };
        return { context, captured };
    }

    function makeGeneratorInvocation(): generatorsYml.GeneratorInvocation {
        // Minimal shape — the handler only reads `name`, `version`, `raw.github`,
        // `absolutePathToLocalOutput`, and `outputMode`. Everything else can be cast.
        return {
            name: "fernapi/fern-typescript-sdk",
            version: "3.66.4",
            raw: {
                name: "fernapi/fern-typescript-sdk",
                version: "3.66.4",
                github: {
                    repository: "fern-demo/fern-replay-testbed-ts-sdk",
                    mode: "pull-request"
                }
            },
            absolutePathToLocalOutput: undefined
        } as unknown as generatorsYml.GeneratorInvocation;
    }

    function makeTask(opts: { logs: FernFiddle.TaskLog[]; finished: boolean }): FernFiddle.remoteGen.Task {
        return {
            packages: [],
            logs: opts.logs,
            status: opts.finished
                ? FernFiddle.TaskStatus.finished({
                      hasFilesToDownload: false,
                      s3PreSignedReadUrl: ""
                  })
                : FernFiddle.TaskStatus.running()
        } as FernFiddle.remoteGen.Task;
    }

    function makeBaseTelemetryContext(): RemoteTaskHandler.ReplayTelemetryContext {
        return {
            cliVersion: "5.12.0",
            orgId: "acme",
            automationMode: false,
            autoMerge: false,
            skipIfNoDiff: false,
            versionArg: "none",
            versionBump: undefined,
            replayConfigEnabled: true,
            noReplayFlag: false,
            disableTelemetry: false
        };
    }

    it("emits a single `replay` event when the pipeline-result log line is present and task finishes", async () => {
        const { context, captured } = makeMockContext();
        const handler = new RemoteTaskHandler({
            job: { jobId: "job-1", taskIds: [] } as unknown as FernFiddle.remoteGen.CreateJobResponse,
            taskId: "task-1" as FernFiddle.remoteGen.RemoteGenTaskId,
            interactiveTaskContext: context,
            generatorInvocation: makeGeneratorInvocation(),
            absolutePathToPreview: undefined,
            telemetryContext: makeBaseTelemetryContext()
        });

        // First poll — task running, log line arrives
        await handler.processUpdate(
            makeTask({
                logs: [
                    { level: FernFiddle.LogLevel.Debug, message: "starting generation" },
                    {
                        level: FernFiddle.LogLevel.Debug,
                        message: makeFiddlePipelineResultLogLine(makeReplayResult())
                    }
                ],
                finished: false
            })
        );

        expect(captured).toHaveLength(0);

        // Second poll — task finished
        await handler.processUpdate(
            makeTask({
                logs: [
                    { level: FernFiddle.LogLevel.Debug, message: "starting generation" },
                    {
                        level: FernFiddle.LogLevel.Debug,
                        message: makeFiddlePipelineResultLogLine(makeReplayResult())
                    }
                ],
                finished: true
            })
        );

        expect(captured).toHaveLength(1);
        const event = captured[0];
        if (event == null) {
            throw new Error("expected captured event");
        }
        expect(event.command).toBe("replay");
        expect(event.properties).toMatchObject({
            action: "pipeline_run",
            surface: "fiddle",
            success: true,
            executed: true,
            flow: "normal-regeneration",
            patches_detected: 7,
            patches_applied: 6,
            patches_with_conflicts: 1,
            patches_absorbed: 2,
            patches_kept_as_user_owned: 3,
            unresolved_patches_count: 1,
            conflicts_same_line_edit: 1,
            generator_name: "fernapi/fern-typescript-sdk",
            generator_version: "3.66.4",
            cli_version: "5.12.0",
            github_mode: "pull-request",
            replay_config_enabled: true,
            no_replay_flag: false,
            automation_mode: false,
            org_id: "acme"
        });
        // Hashed (sha256/16) — no raw repo path leaks
        expect(event.properties?.repo_uri_hash).toMatch(/^[0-9a-f]{16}$/);
        expect(JSON.stringify(event)).not.toContain("fern-demo/fern-replay-testbed-ts-sdk");
    });

    it("does not emit when disableTelemetry is true", async () => {
        const { context, captured } = makeMockContext();
        const handler = new RemoteTaskHandler({
            job: { jobId: "job-1", taskIds: [] } as unknown as FernFiddle.remoteGen.CreateJobResponse,
            taskId: "task-1" as FernFiddle.remoteGen.RemoteGenTaskId,
            interactiveTaskContext: context,
            generatorInvocation: makeGeneratorInvocation(),
            absolutePathToPreview: undefined,
            telemetryContext: { ...makeBaseTelemetryContext(), disableTelemetry: true }
        });

        await handler.processUpdate(
            makeTask({
                logs: [
                    {
                        level: FernFiddle.LogLevel.Debug,
                        message: makeFiddlePipelineResultLogLine(makeReplayResult())
                    }
                ],
                finished: true
            })
        );

        expect(captured).toHaveLength(0);
    });

    it("does not emit when no pipeline-result log line was seen (e.g. replay didn't run server-side)", async () => {
        const { context, captured } = makeMockContext();
        const handler = new RemoteTaskHandler({
            job: { jobId: "job-1", taskIds: [] } as unknown as FernFiddle.remoteGen.CreateJobResponse,
            taskId: "task-1" as FernFiddle.remoteGen.RemoteGenTaskId,
            interactiveTaskContext: context,
            generatorInvocation: makeGeneratorInvocation(),
            absolutePathToPreview: undefined,
            telemetryContext: makeBaseTelemetryContext()
        });

        await handler.processUpdate(
            makeTask({
                logs: [
                    { level: FernFiddle.LogLevel.Debug, message: "Started job" },
                    { level: FernFiddle.LogLevel.Info, message: "Tagging release 0.1.2" }
                ],
                finished: true
            })
        );

        expect(captured).toHaveLength(0);
    });

    it("emits exactly once even when finished status is observed multiple times", async () => {
        // Defense-in-depth: even though the polling loop short-circuits once
        // isFinished is set, we don't want to double-count if a caller calls
        // processUpdate again after finish.
        const { context, captured } = makeMockContext();
        const handler = new RemoteTaskHandler({
            job: { jobId: "job-1", taskIds: [] } as unknown as FernFiddle.remoteGen.CreateJobResponse,
            taskId: "task-1" as FernFiddle.remoteGen.RemoteGenTaskId,
            interactiveTaskContext: context,
            generatorInvocation: makeGeneratorInvocation(),
            absolutePathToPreview: undefined,
            telemetryContext: makeBaseTelemetryContext()
        });

        const finishedTask = makeTask({
            logs: [
                {
                    level: FernFiddle.LogLevel.Debug,
                    message: makeFiddlePipelineResultLogLine(makeReplayResult())
                }
            ],
            finished: true
        });

        await handler.processUpdate(finishedTask);
        await handler.processUpdate(finishedTask);

        expect(captured).toHaveLength(1);
    });

    it("survives a malformed pipeline-result log line without throwing or emitting", async () => {
        const { context, captured } = makeMockContext();
        const handler = new RemoteTaskHandler({
            job: { jobId: "job-1", taskIds: [] } as unknown as FernFiddle.remoteGen.CreateJobResponse,
            taskId: "task-1" as FernFiddle.remoteGen.RemoteGenTaskId,
            interactiveTaskContext: context,
            generatorInvocation: makeGeneratorInvocation(),
            absolutePathToPreview: undefined,
            telemetryContext: makeBaseTelemetryContext()
        });

        await expect(
            handler.processUpdate(
                makeTask({
                    logs: [
                        {
                            level: FernFiddle.LogLevel.Debug,
                            message: "Pipeline: raw result (12 bytes): {not valid"
                        }
                    ],
                    finished: true
                })
            )
        ).resolves.toBeDefined();

        expect(captured).toHaveLength(0);
    });
});

describe("extractVersionFromLogMessage (regression)", () => {
    // Quick guard that the existing version extraction still works alongside
    // the new replay-result parser added to the same log loop.
    it("extracts plain semver", () => {
        expect(extractVersionFromLogMessage("Tagging release 1.2.3")).toBe("1.2.3");
    });

    it("strips leading v from Go versions", () => {
        expect(extractVersionFromLogMessage("Tagging release v0.2.0-rc.1")).toBe("0.2.0-rc.1");
    });

    it("returns undefined when no match", () => {
        expect(extractVersionFromLogMessage("Pipeline: raw result (10 bytes): {}")).toBeUndefined();
    });
});
