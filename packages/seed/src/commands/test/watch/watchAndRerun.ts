import { CONSOLE_LOGGER, LogLevel } from "@fern-api/logger";
import { ChildProcess, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { LocalBuildInfo } from "../../../config/api/index.js";
import { GeneratorWorkspace } from "../../../loadGeneratorWorkspaces.js";
import { Semaphore } from "../../../Semaphore.js";
import { LocalScriptRunner, ScriptRunner } from "../index.js";
import { printTestCases } from "../printTestCases.js";
import { TaskContextFactory } from "../TaskContextFactory.js";
import { LocalTestRunner, TestRunner } from "../test-runner/index.js";

export interface WatchAndRerunArgs {
    generator: GeneratorWorkspace;
    fixture: string;
    fixtureOutputFolder: string | undefined;
    skipScripts: boolean;
    logLevel: LogLevel;
    inspect: boolean;
}

/**
 * Runs the generator in watch mode:
 * 1. First run: full build + IR gen + run generator + scripts
 * 2. Spawn `turbo watch` to rebuild generator on source changes
 * 3. Watch built artifact via fs.watch
 * 4. On change: re-run generator with cached IR (skip build + IR gen)
 */
export async function watchAndRerun({
    generator,
    fixture,
    fixtureOutputFolder,
    skipScripts,
    logLevel,
    inspect
}: WatchAndRerunArgs): Promise<void> {
    const localConfig = generator.workspaceConfig.test.local;
    if (localConfig == null) {
        throw new Error(
            `Generator ${generator.workspaceName} does not have a local test configuration. ` +
                `Please add a 'test.local' section to your seed.yml with 'buildCommand' and 'runCommand' properties.`
        );
    }

    if (localConfig.watchPaths == null || localConfig.watchPaths.length === 0) {
        throw new Error(
            `Generator ${generator.workspaceName} does not have 'watchPaths' configured in test.local. ` +
                `Please add 'watchPaths' to your seed.yml test.local section (e.g., watchPaths: ["sdk/cli/dist/cli.cjs"]).`
        );
    }

    const turboFilter = extractTurboFilter(localConfig);
    if (turboFilter == null) {
        throw new Error(
            `Could not extract turbo filter from buildCommand for generator ${generator.workspaceName}. ` +
                `Watch mode currently only supports turbo-based generators.`
        );
    }

    const taskContextFactory = new TaskContextFactory(logLevel);

    // Phase 1: Initial full run
    CONSOLE_LOGGER.info("=== Watch mode: initial run ===");
    const lock = new Semaphore(1);
    const scriptRunner: ScriptRunner = new LocalScriptRunner(
        generator,
        skipScripts,
        taskContextFactory.create("local-script-runner"),
        logLevel
    );

    const testRunner: TestRunner = new LocalTestRunner({
        generator,
        lock,
        taskContextFactory,
        skipScripts,
        scriptRunner,
        keepContainer: false,
        inspect
    });

    const configuration = resolveFixtureConfiguration(generator, fixture, fixtureOutputFolder);

    const result = await testRunner.run({
        fixture,
        configuration,
        inspect
    });

    printTestCases([result]);

    // Phase 2: Spawn turbo watch for rebuilding
    CONSOLE_LOGGER.info("=== Watch mode: watching for changes ===");
    CONSOLE_LOGGER.info(`Spawning: turbo watch dist:cli --filter ${turboFilter}`);

    const turboProcess = spawnTurboWatch(turboFilter, localConfig.workingDirectory);

    // Phase 3: Watch built artifacts and re-run on changes
    const absoluteWatchPaths = localConfig.watchPaths.map((p) => path.resolve(localConfig.workingDirectory, p));

    CONSOLE_LOGGER.info(`Watching paths: ${absoluteWatchPaths.join(", ")}`);
    CONSOLE_LOGGER.info("Press Ctrl+C to exit watch mode.\n");

    let isRunning = false;

    const rerun = async () => {
        if (isRunning) {
            CONSOLE_LOGGER.info("Already running, skipping...");
            return;
        }
        isRunning = true;

        try {
            CONSOLE_LOGGER.info("\n=== Watch mode: change detected, re-running generator ===");

            // Create fresh context for this run
            const freshTaskContextFactory = new TaskContextFactory(logLevel);
            const freshLock = new Semaphore(1);
            const freshScriptRunner: ScriptRunner = new LocalScriptRunner(
                generator,
                skipScripts,
                freshTaskContextFactory.create("local-script-runner"),
                logLevel
            );

            // Create a new test runner that skips the build step
            const freshTestRunner: TestRunner = new SkipBuildLocalTestRunner({
                generator,
                lock: freshLock,
                taskContextFactory: freshTaskContextFactory,
                skipScripts,
                scriptRunner: freshScriptRunner,
                keepContainer: false,
                inspect
            });

            const rerunResult = await freshTestRunner.run({
                fixture,
                configuration,
                inspect
            });

            printTestCases([rerunResult]);

            await freshScriptRunner.stop();
        } catch (error) {
            CONSOLE_LOGGER.error(`Error during re-run: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            isRunning = false;
        }
    };

    // Set up file watchers with debounce
    const watchers: fs.FSWatcher[] = [];
    const pollIntervals: ReturnType<typeof setInterval>[] = [];
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const DEBOUNCE_MS = 300;

    for (const watchPath of absoluteWatchPaths) {
        // Watch directories or files
        const watchTarget =
            fs.existsSync(watchPath) && fs.statSync(watchPath).isDirectory() ? watchPath : path.dirname(watchPath);
        const watchBasename =
            fs.existsSync(watchPath) && fs.statSync(watchPath).isDirectory() ? undefined : path.basename(watchPath);

        try {
            const watcher = fs.watch(watchTarget, { recursive: false }, (eventType, filename) => {
                // If watching a specific file, only trigger on that file
                if (watchBasename != null && filename !== watchBasename) {
                    return;
                }

                if (debounceTimer != null) {
                    clearTimeout(debounceTimer);
                }
                debounceTimer = setTimeout(() => {
                    void rerun();
                }, DEBOUNCE_MS);
            });
            watchers.push(watcher);
        } catch (error) {
            CONSOLE_LOGGER.warn(
                `Failed to watch ${watchPath}: ${error instanceof Error ? error.message : String(error)}. ` +
                    `The file may not exist yet. It will be watched once turbo builds it.`
            );

            // Set up a polling watcher for files that don't exist yet
            const pollInterval: ReturnType<typeof setInterval> = setInterval(() => {
                if (fs.existsSync(watchPath)) {
                    clearInterval(pollInterval);
                    try {
                        const watcher = fs.watch(
                            fs.statSync(watchPath).isDirectory() ? watchPath : path.dirname(watchPath),
                            { recursive: false },
                            (eventType, filename) => {
                                const basename = path.basename(watchPath);
                                if (!fs.statSync(watchPath).isDirectory() && filename !== basename) {
                                    return;
                                }
                                if (debounceTimer != null) {
                                    clearTimeout(debounceTimer);
                                }
                                debounceTimer = setTimeout(() => {
                                    void rerun();
                                }, DEBOUNCE_MS);
                            }
                        );
                        watchers.push(watcher);
                        CONSOLE_LOGGER.info(`Now watching: ${watchPath}`);
                    } catch {
                        // Ignore errors in deferred watcher setup
                    }
                }
            }, 1000);
            pollIntervals.push(pollInterval);
        }
    }

    // Wait forever (until Ctrl+C)
    await new Promise<void>((resolve) => {
        const cleanup = () => {
            CONSOLE_LOGGER.info("\nWatch mode: shutting down...");
            for (const watcher of watchers) {
                watcher.close();
            }
            for (const interval of pollIntervals) {
                clearInterval(interval);
            }
            turboProcess.kill();
            scriptRunner.stop().then(resolve).catch(resolve);
        };

        process.on("SIGINT", cleanup);
        process.on("SIGTERM", cleanup);
    });
}

/**
 * A LocalTestRunner that skips the build step (for watch re-runs).
 */
class SkipBuildLocalTestRunner extends LocalTestRunner {
    public async build(): Promise<void> {
        // Skip building — turbo watch handles rebuilds
        CONSOLE_LOGGER.debug("Skipping build (turbo watch handles rebuilds)");
    }
}

/**
 * Extract the turbo --filter value from the buildCommand.
 * e.g., "pnpm turbo run dist:cli --filter @fern-typescript/sdk-generator-cli"
 * → "@fern-typescript/sdk-generator-cli"
 */
function extractTurboFilter(localConfig: LocalBuildInfo): string | null {
    for (const cmd of localConfig.buildCommand) {
        const filterMatch = cmd.match(/--filter\s+(\S+)/);
        if (filterMatch != null) {
            return filterMatch[1] ?? null;
        }
    }
    return null;
}

/**
 * Spawn `turbo watch dist:cli --filter <filter>` as a long-running child process.
 */
function spawnTurboWatch(turboFilter: string, workingDirectory: string): ChildProcess {
    // Resolve working directory relative to process.cwd() (which is the repo root for seed)
    const cwd = path.resolve(process.cwd());

    const child = spawn("pnpm", ["turbo", "watch", "dist:cli", "--filter", turboFilter], {
        cwd,
        stdio: ["ignore", "pipe", "pipe"],
        detached: false
    });

    child.stdout?.on("data", (data: Buffer) => {
        const lines = data.toString().trim();
        if (lines.length > 0) {
            for (const line of lines.split("\n")) {
                CONSOLE_LOGGER.debug(`[turbo watch] ${line}`);
            }
        }
    });

    child.stderr?.on("data", (data: Buffer) => {
        const lines = data.toString().trim();
        if (lines.length > 0) {
            for (const line of lines.split("\n")) {
                CONSOLE_LOGGER.debug(`[turbo watch] ${line}`);
            }
        }
    });

    child.on("error", (error: Error) => {
        CONSOLE_LOGGER.error(`turbo watch process error: ${error.message}`);
    });

    child.on("exit", (code: number | null) => {
        if (code != null && code !== 0) {
            CONSOLE_LOGGER.error(`turbo watch exited with code ${code}`);
        }
    });

    return child;
}

/**
 * Resolve the fixture configuration from the generator workspace config.
 */
function resolveFixtureConfiguration(
    generator: GeneratorWorkspace,
    fixture: string,
    outputFolder: string | undefined
): import("../../../config/api/index.js").FixtureConfigurations | undefined {
    const config = generator.workspaceConfig.fixtures?.[fixture];
    if (config == null) {
        return undefined;
    }
    if (outputFolder != null) {
        return config.find((c) => c.outputFolder === outputFolder);
    }
    // If there are multiple configurations but no output folder specified, use the first one
    return config.length === 1 ? config[0] : undefined;
}
