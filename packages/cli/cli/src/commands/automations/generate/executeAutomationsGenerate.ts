import { TaskAbortSignal } from "@fern-api/task-context";

import { CliContext } from "../../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../../cliCommons.js";
import { parseGeneratorArg } from "../../generate/filterGenerators.js";
import { generateAPIWorkspaces } from "../../generate/generateAPIWorkspaces.js";
import { GeneratorRunCollector } from "./GeneratorRunResult.js";
import { renderStdoutSummary, writeResults, writeResultsSync } from "./reportGenerateResults.js";

export interface AutomationsGenerateOptions {
    api: string | undefined;
    group: string | undefined;
    /** `--generator` value: a 0-based index string, a generator name, or undefined. */
    generator: string | undefined;
    version: string | undefined;
    autoMerge: boolean;
    /** `--json <path>` — write a CI-neutral JSON summary to this path when set. */
    jsonOutputPath: string | undefined;
}

/**
 * Top-level runner for `fern automations generate`. Manages the collector, signal-handler flush,
 * stdout summary, and exit code. Kept as a module-level function so the yargs handler stays tiny
 * and the orchestration is testable without yargs in the way.
 */
export async function executeAutomationsGenerate({
    cliContext,
    options
}: {
    cliContext: CliContext;
    options: AutomationsGenerateOptions;
}): Promise<void> {
    const { generatorName, generatorIndex } = parseGeneratorArg(options.generator);
    const collector = new GeneratorRunCollector();
    const { jsonOutputPath } = options;

    // Sentinel: the happy-path finally skips its write if a signal handler already flushed.
    // The sentinel also gates the signal handler itself so a second signal is a no-op.
    let outputsFlushed = false;
    // When the outer task aborts (e.g. an invalid --group surfaced via failAndThrow), the per-
    // workspace error was already logged and CliContext.didSucceed is false — we want to skip the
    // "no eligible generators" empty-summary branch so the user doesn't see a misleading trailing
    // message after the real error.
    let taskAborted = false;

    const flushOnSignal = () => {
        if (outputsFlushed) {
            return;
        }
        outputsFlushed = true;
        writeResultsSync({ results: collector.results(), jsonOutputPath });
    };
    process.once("SIGINT", flushOnSignal);
    process.once("SIGTERM", flushOnSignal);

    try {
        await cliContext.runTask(async () => {
            await generateAPIWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: options.api,
                    defaultToAllApiWorkspaces: true
                }),
                cliContext,
                version: options.version,
                groupNames: options.group != null ? [options.group] : undefined,
                generatorName,
                generatorIndex,
                shouldLogS3Url: false,
                keepDocker: false,
                useLocalDocker: false,
                preview: false,
                mode: undefined,
                force: true,
                runner: undefined,
                inspect: false,
                lfsOverride: undefined,
                fernignorePath: undefined,
                skipFernignore: false,
                dynamicIrOnly: false,
                outputDir: undefined,
                noReplay: false,
                retryRateLimited: false,
                requireEnvVars: false,
                automationMode: true,
                autoMerge: options.autoMerge,
                skipIfNoDiff: true,
                automation: { recorder: collector }
            });
        });
    } catch (error) {
        if (!(error instanceof TaskAbortSignal)) {
            throw error;
        }
        taskAborted = true;
    } finally {
        // `process.once` self-removes if fired; these are no-ops on the signal path.
        process.off("SIGINT", flushOnSignal);
        process.off("SIGTERM", flushOnSignal);
        if (!outputsFlushed) {
            outputsFlushed = true;
            await reportFinalOutputs({ collector, jsonOutputPath, taskAborted });
        }
        if (collector.hasFailures()) {
            process.exitCode = 1;
        }
    }
}

async function reportFinalOutputs({
    collector,
    jsonOutputPath,
    taskAborted
}: {
    collector: GeneratorRunCollector;
    jsonOutputPath: string | undefined;
    taskAborted: boolean;
}): Promise<void> {
    const results = collector.results();
    if (results.length === 0) {
        if (taskAborted) {
            // The outer task failed before any generator ran (e.g. invalid --group). The real error
            // was already logged per-workspace; printing the "no eligible generators" hint on top
            // would be misleading.
            return;
        }
        // Nothing ran — a step summary with 0 rows and an empty JSON doc aren't useful.
        process.stdout.write(
            "No eligible generators ran in the selected APIs and groups — every candidate either " +
                "opts out via automations.generate / autorelease, uses local-file-system output, " +
                "or did not match an explicit --group / --api filter.\n"
        );
        return;
    }
    await writeResults({ results, jsonOutputPath });
    process.stdout.write(`${renderStdoutSummary(results)}\n`);
}
