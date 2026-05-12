import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { LogLevel } from "@fern-api/logger";
import chalk from "chalk";
import prettyMilliseconds from "pretty-ms";
import tmp from "tmp-promise";

import { FixtureConfigurations } from "../../config/api/index.js";
import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";
import { Semaphore } from "../../Semaphore.js";
import { printTestCases } from "../test/printTestCases.js";
import { ContainerScriptRunner } from "../test/script-runner/ContainerScriptRunner.js";
import { LocalScriptRunner } from "../test/script-runner/LocalScriptRunner.js";
import { ScriptRunner } from "../test/script-runner/ScriptRunner.js";
import { TaskContextFactory } from "../test/TaskContextFactory.js";
import { ContainerTestRunner, LocalTestRunner, TestRunner } from "../test/test-runner/index.js";
import { parseAllowedFailures } from "./allowedFailures.js";
import { buildVirtualWorkspace } from "./buildVirtualWorkspace.js";
import { discoverMegaFixtures, MegaFixture } from "./discoverMegaFixtures.js";
import { filterFixtures } from "./filterFixtures.js";

export interface MegaTestArgs {
    workspace: GeneratorWorkspace;
    /** Glob patterns (minimatch) — at least one must match a fixture's name to include it. */
    include?: string[];
    /** Glob patterns (minimatch) — any match excludes a fixture. */
    exclude?: string[];
    local: boolean;
    keepContainer: boolean;
    logLevel: LogLevel;
    inspect: boolean;
    skipScripts: boolean;
    /** If provided, write the mega SDK here; otherwise a temp dir is used. */
    outputDir?: AbsoluteFilePath;
    /** If provided, write the synthesized generators.yml workspace here; otherwise a temp dir is used. */
    workspaceDir?: AbsoluteFilePath;
}

/**
 * Wall-clock measurements for a mega-test run.
 * All values are in milliseconds.
 */
export interface MegaTestTimings {
    /** Time to discover fixtures + build the synthesized generators.yml. */
    setupMs: number;
    /** End-to-end wall-clock. */
    totalMs: number;
}

export interface MegaTestSummary {
    fixtures: MegaFixture[];
    result: TestRunner.TestResult;
    timings: MegaTestTimings;
    absolutePathToOutput: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
}

/**
 * Composes every selected OpenAPI-backed fixture into one virtual workspace, generates a
 * single mega SDK, and runs the generator's build/test scripts once against that output.
 *
 * Reports per-fixture pass/fail by mirroring the overall result across the composed fixtures.
 * Per-namespace vitest output parsing is a v1 follow-up — every fixture in the table shows
 * the same status with the failing phase identified.
 */
export async function runMegaTest(args: MegaTestArgs): Promise<MegaTestSummary> {
    const overallStart = Date.now();
    const setupStart = Date.now();

    const allFixtures = discoverMegaFixtures();
    const generatorName = args.workspace.workspaceName;

    const allowedFailures = parseAllowedFailures(args.workspace.workspaceConfig.allowedFailures);
    const afterAllowedFailures = allFixtures.filter((fixture) => !allowedFailures.has(fixture.name));
    const skippedByAllowedFailures = allFixtures
        .filter((fixture) => allowedFailures.has(fixture.name))
        .map((fixture) => fixture.name);
    if (skippedByAllowedFailures.length > 0) {
        // eslint-disable-next-line no-console
        console.log(
            `[mega-test] Skipping ${skippedByAllowedFailures.length} fixture${
                skippedByAllowedFailures.length === 1 ? "" : "s"
            } on allowedFailures list: ${skippedByAllowedFailures.join(", ")}`
        );
    }

    const selected = filterFixtures({
        fixtures: afterAllowedFailures,
        include: args.include,
        exclude: args.exclude,
        generatorName
    });

    if (selected.length === 0) {
        throw new Error(
            `Mega-test: no migrated OpenAPI-backed fixtures matched include=${JSON.stringify(
                args.include ?? []
            )} exclude=${JSON.stringify(args.exclude ?? [])} for generator "${generatorName}".`
        );
    }

    const workspaceDir =
        args.workspaceDir ?? AbsoluteFilePath.of((await tmp.dir({ prefix: "fern-seed-mega-test-workspace-" })).path);
    const outputDir =
        args.outputDir ?? AbsoluteFilePath.of((await tmp.dir({ prefix: "fern-seed-mega-test-output-" })).path);

    await buildVirtualWorkspace({
        fixtures: selected,
        absolutePathToWorkspaceDir: workspaceDir
    });

    // eslint-disable-next-line no-console
    console.log(
        chalk.bold(
            `[mega-test] Composing ${selected.length} fixture${
                selected.length === 1 ? "" : "s"
            } into virtual workspace ${workspaceDir}`
        )
    );
    for (const fixture of selected) {
        // eslint-disable-next-line no-console
        console.log(`  - ${fixture.name}`);
    }

    const setupMs = Date.now() - setupStart;

    const lock = new Semaphore(1);
    const taskContextFactory = new TaskContextFactory(args.logLevel);
    const taskContext = taskContextFactory.create(`${generatorName}:mega-test`);

    let scriptRunner: ScriptRunner | undefined;
    if (!args.skipScripts) {
        scriptRunner = args.local
            ? new LocalScriptRunner(args.workspace, args.skipScripts, taskContext, args.logLevel)
            : new ContainerScriptRunner(args.workspace, args.skipScripts, taskContext, args.logLevel, undefined, 1);
    }

    let testRunner: TestRunner;
    if (args.local) {
        if (args.workspace.workspaceConfig.test.local == null) {
            throw new Error(
                `Generator "${generatorName}" has no test.local config in seed.yml — required for --local.`
            );
        }
        testRunner = new LocalTestRunner({
            generator: args.workspace,
            lock,
            taskContextFactory,
            skipScripts: args.skipScripts,
            scriptRunner,
            keepContainer: args.keepContainer,
            inspect: args.inspect,
            logLevel: args.logLevel
        });
    } else {
        testRunner = new ContainerTestRunner({
            generator: args.workspace,
            lock,
            taskContextFactory,
            skipScripts: args.skipScripts,
            keepContainer: args.keepContainer,
            scriptRunner,
            inspect: args.inspect,
            parallelism: 1,
            logLevel: args.logLevel
        });
    }

    const configuration: FixtureConfigurations = {
        outputFolder: "",
        customConfig: args.workspace.workspaceConfig.defaultCustomConfig
    };

    let result: TestRunner.TestResult;
    try {
        // run() lazily triggers build() via buildInvocation; do not call build() here.
        result = await testRunner.run({
            fixture: "mega",
            configuration,
            inspect: args.inspect,
            absolutePathToApiDefinition: workspaceDir,
            outputDir
        });
    } finally {
        await testRunner.cleanup();
        if (scriptRunner != null) {
            await scriptRunner.stop();
        }
    }

    const timings: MegaTestTimings = {
        setupMs,
        totalMs: Date.now() - overallStart
    };

    printMegaSummary({
        fixtures: selected,
        result,
        timings,
        local: args.local
    });

    return {
        fixtures: selected,
        result,
        timings,
        absolutePathToOutput: outputDir,
        absolutePathToWorkspace: workspaceDir
    };
}

function printMegaSummary({
    fixtures,
    result,
    timings,
    local
}: {
    fixtures: MegaFixture[];
    result: TestRunner.TestResult;
    timings: MegaTestTimings;
    local: boolean;
}): void {
    const rows: TestRunner.TestResult[] = fixtures.map((fixture, idx) => {
        // Show timing metrics on the first row only; other rows leave them blank so the
        // table reads as "this is the shared cost across the entire mega run".
        const metrics: TestRunner.TestCaseMetrics =
            idx === 0
                ? {
                      generationTime: result.metrics.generationTime,
                      buildTime: result.metrics.buildTime,
                      testTime: result.metrics.testTime
                  }
                : {};

        if (result.type === "success") {
            return {
                type: "success",
                id: fixture.name,
                outputFolder: "",
                metrics
            };
        }
        return {
            type: "failure",
            cause: result.cause,
            message: result.message,
            id: fixture.name,
            outputFolder: "",
            metrics
        };
    });

    printTestCases(rows);

    const mode = local ? "local" : "docker";
    const status = result.type === "success" ? chalk.green("PASSED") : chalk.red(`FAILED (${result.cause})`);
    // eslint-disable-next-line no-console
    console.log(
        chalk.bold(
            `\n[mega-test] ${status} for ${fixtures.length} fixture${fixtures.length === 1 ? "" : "s"} in ${mode} mode`
        )
    );
    // eslint-disable-next-line no-console
    console.log(
        `  setup:      ${formatMs(timings.setupMs)}\n` +
            `  generation: ${result.metrics.generationTime ?? "n/a"}\n` +
            `  build:      ${result.metrics.buildTime ?? "n/a"}\n` +
            `  test:       ${result.metrics.testTime ?? "n/a"}\n` +
            `  total:      ${formatMs(timings.totalMs)}`
    );
}

function formatMs(ms: number): string {
    return prettyMilliseconds(ms, { compact: true });
}
