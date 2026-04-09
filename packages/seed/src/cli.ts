import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import { writeFile } from "fs/promises";
import { minimatch } from "minimatch";
import os from "os";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import {
    detectAffected,
    findRepoRoot,
    getChangedFiles,
    resolveAffectedFixtures,
    resolveAffectedGenerators
} from "./commands/affected/index.js";
import { cleanEmptySeedDirectories, cleanOrphanedSeedFolders } from "./commands/clean/index.js";
import { generateCliChangelog } from "./commands/generate/generateCliChangelog.js";
import { generateGeneratorChangelog } from "./commands/generate/generateGeneratorChangelog.js";
import { buildGeneratorImage } from "./commands/img/buildGeneratorImage.js";
import { getLatestCli } from "./commands/latest/getLatestCli.js";
import { getLatestGenerator } from "./commands/latest/getLatestGenerator.js";
import { getLatestVersionsYml } from "./commands/latest/getLatestVersionsYml.js";
import { getAvailableFixtures, splitFixturesIntoGroups } from "./commands/list-test-fixtures/index.js";
import { publishCli } from "./commands/publish/publishCli.js";
import { publishGenerator } from "./commands/publish/publishGenerator.js";
import { registerCliRelease } from "./commands/register/registerCliRelease.js";
import { registerGenerator } from "./commands/register/registerGenerator.js";
import { runWithCustomFixture } from "./commands/run/runWithCustomFixture.js";
import { ContainerScriptRunner, LocalScriptRunner, ScriptRunner } from "./commands/test/index.js";
import { TaskContextFactory } from "./commands/test/TaskContextFactory.js";
import { ContainerTestRunner, LocalTestRunner, TestRunner } from "./commands/test/test-runner/index.js";
import { FIXTURES, LANGUAGE_SPECIFIC_FIXTURE_PREFIXES, testGenerator } from "./commands/test/testWorkspaceFixtures.js";
import { WorkspaceCache } from "./commands/test/WorkspaceCache.js";
import { executeTestRemoteLocalCommand, isFernRepo, isLocalFernCliBuilt } from "./commands/test-remote-local/index.js";
import { assertValidSemVerOrThrow } from "./commands/validate/semVerUtils.js";
import { validateCliRelease } from "./commands/validate/validateCliChangelog.js";
import { validateGenerator } from "./commands/validate/validateGeneratorChangelog.js";
import { validateVersionsYml } from "./commands/validate/validateVersionsYml.js";
import { GeneratorWorkspace, loadGeneratorWorkspaces } from "./loadGeneratorWorkspaces.js";
import { Semaphore } from "./Semaphore.js";

tryRunCli()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Unhandled error:", error);
        process.exit(1);
    });

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv))
        .strict()
        .exitProcess(false)
        .fail((message, error: unknown, argv) => {
            // if error is null, it's a yargs validation error
            if (error == null) {
                argv.showHelp();
                // biome-ignore lint: ignore next line
                console.error(message);
            } else {
                // Log the actual error for debugging
                console.error("Error:", error);
                if (error instanceof Error) {
                    console.error("Stack:", error.stack);
                }
            }
        });

    addTestCommand(cli);
    addTestRemoteLocalCommand(cli);
    addRunCommand(cli);
    addImgCommand(cli);
    addGetAvailableFixturesCommand(cli);
    addListTestFixturesCommand(cli);
    addAffectedCommand(cli);
    addCleanCommand(cli);
    addRegisterCommands(cli);
    addPublishCommands(cli);
    addValidateCommands(cli);
    addLatestCommands(cli);
    addGenerateCommands(cli);

    await cli.parse();
}

function addTestCommand(cli: Argv) {
    cli.command(
        "test",
        "Run all snapshot tests for the generators",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: ["g", "sdk"],
                    description:
                        "The generators to run tests for (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("parallel", {
                    type: "number",
                    default: Math.max(1, Math.min(os.cpus().length, 16)),
                    alias: "p"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    // default: FIXTURES,
                    demandOption: false,
                    alias: "f",
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
                    alias: "o",
                    description: "Runs on a specific output folder. Only relevant if there are >1 folders configured."
                })
                .option("keepContainer", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Keeps the docker container after the tests are finished",
                    alias: ["keepDocker"]
                })
                .option("skip-scripts", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "ss"
                })
                .option("local", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "l"
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("allow-unexpected-failures", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Allow unexpected test failures without failing the command"
                })
                .option("inspect", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "i",
                    description: "Execute Node with --inspect flag for debugging"
                })
                .option("container-runtime", {
                    type: "string",
                    choices: ["docker", "podman"],
                    demandOption: false,
                    alias: "cr",
                    description: "Explicitly specify which container runtime to use (docker or podman)"
                })
                .option("base-ref", {
                    type: "string",
                    demandOption: false,
                    default: "origin/main",
                    alias: "br",
                    description: 'Git ref to diff against when using "affected" mode (default: origin/main)'
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            argv.generator = normalizeGeneratorNames(argv.generator, generators);

            // Handle "affected" mode for --generator and --fixture
            const isGeneratorAffected =
                argv.generator != null && argv.generator.length === 1 && argv.generator[0] === "affected";
            const isFixtureAffected =
                argv.fixture != null && argv.fixture.length === 1 && argv.fixture[0] === "affected";

            let affectedResult = undefined;
            if (isGeneratorAffected || isFixtureAffected) {
                const repoRoot = findRepoRoot();
                const changedFiles = getChangedFiles(argv.baseRef, repoRoot);
                affectedResult = detectAffected(changedFiles, generators);

                // Log the detection summary
                console.log("\n=== Affected Detection ===");
                for (const line of affectedResult.summary) {
                    console.log(`  ${line}`);
                }

                if (isGeneratorAffected) {
                    const affectedGenerators = resolveAffectedGenerators(affectedResult, generators);
                    if (affectedGenerators.length === 0) {
                        console.log("No affected generators detected. Nothing to run.");
                        return;
                    }
                    argv.generator = affectedGenerators.map((g) => g.workspaceName);
                    console.log(`Affected generators: ${argv.generator.join(", ")}`);
                }

                if (isFixtureAffected) {
                    if (affectedResult.allFixturesAffected) {
                        // Let the per-generator fixture resolution handle it (will use all fixtures)
                        argv.fixture = undefined;
                        console.log("All fixtures affected.");
                    } else if (
                        affectedResult.affectedFixtures.length === 0 &&
                        affectedResult.generatorsWithAllFixtures.length === 0
                    ) {
                        console.log("No affected fixtures detected. Nothing to run.");
                        return;
                    } else {
                        // Keep argv.fixture non-null so the per-generator loop enters
                        // the affected resolution branch (not the "all fixtures" branch).
                        // resolveAffectedFixtures handles per-generator logic:
                        // generators with source changes get all fixtures,
                        // others get only the changed fixtures.
                        if (affectedResult.affectedFixtures.length > 0) {
                            console.log(`Changed fixtures: ${affectedResult.affectedFixtures.join(", ")}`);
                        }
                        if (affectedResult.generatorsWithAllFixtures.length > 0) {
                            console.log(
                                `Generators needing all fixtures: ${affectedResult.generatorsWithAllFixtures.join(", ")}`
                            );
                        }
                    }
                }
                console.log("==========================\n");
            }

            if (argv.generator != null && !isGeneratorAffected) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }

            const taskContextFactory = new TaskContextFactory(argv["log-level"]);
            const lock = new Semaphore(argv.parallel);
            const tests: Promise<boolean>[] = [];
            const scriptRunners: ScriptRunner[] = [];
            const testRunners: TestRunner[] = [];

            for (const generator of generators) {
                if (argv.generator != null && !argv.generator.includes(generator.workspaceName)) {
                    continue;
                }
                let testRunner: TestRunner;
                let scriptRunner: ScriptRunner;

                // Resolve fixtures per-generator using a local variable to avoid leaking
                // one generator's fixtures to the next iteration
                let fixturesForGenerator: string[];
                if (argv.fixture == null) {
                    fixturesForGenerator = getAvailableFixtures(generator, false);
                } else if (isFixtureAffected && affectedResult != null && !affectedResult.allFixturesAffected) {
                    // In affected mode, resolve fixtures per-generator:
                    // - Generators whose source changed get ALL their fixtures
                    // - Other generators get only the changed fixtures
                    const available = getAvailableFixtures(generator, false);
                    fixturesForGenerator = resolveAffectedFixtures(affectedResult, available, generator.workspaceName);
                    if (fixturesForGenerator.length === 0) {
                        console.log(
                            `No affected fixtures available for generator ${generator.workspaceName}. Skipping.`
                        );
                        continue;
                    }
                } else {
                    const availableFixturesForGlobbing = getAvailableFixtures(generator, false);
                    fixturesForGenerator = expandFixtureGlobs(argv.fixture, availableFixturesForGlobbing);
                }

                // Get both formats of fixtures and check if the fixtures passed in are of one of the two formats allowed
                const availableFixtures = getAvailableFixtures(generator, false);
                const availableFixturesWithOutputFolders = getAvailableFixtures(generator, true);

                for (const fixture of fixturesForGenerator) {
                    if (!availableFixtures.includes(fixture) && !availableFixturesWithOutputFolders.includes(fixture)) {
                        throw new Error(
                            `Fixture ${fixture} not found. Please make sure that it is a valid fixture for the generator ${generator.workspaceName}.`
                        );
                    }
                }

                // Verify if there are multiple fixtures passed in or a fixture has a colon separated output folder, that
                // the flag for the output folder is not also used
                if (
                    (fixturesForGenerator.length > 1 ||
                        fixturesForGenerator.some((fixture) => fixture.includes(":"))) &&
                    argv.outputFolder != null
                ) {
                    throw new Error(
                        `Output folder cannot be specified if multiple fixtures are passed in or if the fixture is passed in with colon separated output folders.`
                    );
                }

                if (argv.local && argv.containerRuntime != null) {
                    throw new Error(
                        `Cannot specify both --local and --container-runtime flags. The --container-runtime flag is only applicable for container-based test runners.`
                    );
                }

                if (argv.containerRuntime != null) {
                    const runtime = argv.containerRuntime as "docker" | "podman";
                    const hasConfig =
                        runtime === "docker"
                            ? generator.workspaceConfig.test.docker != null
                            : generator.workspaceConfig.test.podman != null;

                    if (!hasConfig) {
                        throw new Error(
                            `Generator ${generator.workspaceName} does not have a test.${runtime} configuration in seed.yml. ` +
                                `Either add a 'test.${runtime}' section to your seed.yml or omit the --container-runtime flag to use auto-detection.`
                        );
                    }
                }

                if (argv.local) {
                    if (generator.workspaceConfig.test.local == null) {
                        throw new Error(
                            `Generator ${generator.workspaceName} does not have a local test configuration. Please add a 'test.local' section to your seed.yml with 'buildCommand' and 'runCommand' properties.`
                        );
                    }
                    console.log(
                        `Using local test runner for ${generator.workspaceName} with config:`,
                        generator.workspaceConfig.test.local
                    );
                    scriptRunner = new LocalScriptRunner(
                        generator,
                        argv.skipScripts,
                        taskContextFactory.create("local-script-runner"),
                        argv["log-level"]
                    );
                    testRunner = new LocalTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        scriptRunner,
                        keepContainer: false, // not used for local
                        inspect: argv.inspect,
                        workspaceCache: new WorkspaceCache(),
                        logLevel: argv["log-level"]
                    });
                } else {
                    scriptRunner = new ContainerScriptRunner(
                        generator,
                        argv.skipScripts,
                        taskContextFactory.create("docker-script-runner"),
                        argv["log-level"],
                        argv.containerRuntime as "docker" | "podman" | undefined,
                        argv.parallel
                    );
                    testRunner = new ContainerTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        keepContainer: argv.keepContainer,
                        scriptRunner,
                        inspect: argv.inspect,
                        runner: argv.containerRuntime as "docker" | "podman" | undefined,
                        parallelism: argv.parallel,
                        workspaceCache: new WorkspaceCache(),
                        logLevel: argv["log-level"]
                    });
                }

                scriptRunners.push(scriptRunner);
                testRunners.push(testRunner);
                tests.push(
                    testGenerator({
                        generator,
                        runner: testRunner,
                        fixtures: fixturesForGenerator,
                        outputFolder: argv.outputFolder,
                        inspect: argv.inspect
                    })
                );
            }

            let results: boolean[];
            try {
                results = await Promise.all(tests);
            } finally {
                // Always clean up containers and script runners, even if tests throw unexpectedly.
                for (const scriptRunner of scriptRunners) {
                    await scriptRunner.stop();
                }

                for (const testRunner of testRunners) {
                    await testRunner.cleanup();
                }
            }

            // If any of the tests failed and allow-unexpected-failures is false, exit with a non-zero status code
            if (results.includes(false) && !argv["allow-unexpected-failures"]) {
                process.exit(1);
            }
        }
    );
}

function addTestRemoteLocalCommand(cli: Argv) {
    cli.command(
        "test-remote-local",
        "Run snapshot tests for the generators comparing local vs remote generation",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: ["g", "sdk"],
                    description:
                        "The generators to run tests for (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("parallel", {
                    type: "number",
                    default: Math.max(1, Math.min(os.cpus().length, 16)),
                    alias: "p",
                    description: "Number of parallel test cases to run"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: "f",
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
                    alias: "o",
                    description: "Runs on a specific output folder. Only relevant if there are >1 folders configured."
                })
                .option("output-mode", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: "m",
                    description: "The output modes to test. Options: 'local', 'github'. Runs all modes if not provided."
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("fern-repo-directory", {
                    string: true,
                    demandOption: false,
                    alias: "frd",
                    description:
                        "These tests must run with the fern repo path as their working directory. Defaults to the current working directory."
                })
                .option("github-token", {
                    string: true,
                    demandOption: false,
                    description:
                        "The GitHub token to use for the tests. Defaults to the GITHUB_TOKEN environment variable."
                })
                .option("fern-token", {
                    string: true,
                    demandOption: false,
                    description: "The Fern token to use for the tests. Defaults to the FERN_TOKEN environment variable."
                })
                .option("build-generator", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "bg",
                    description:
                        "Build generator Docker images at version 99.99.99 for local generation mode. Uses 'pnpm seed img' internally."
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            argv.generator = normalizeGeneratorNames(argv.generator, generators);

            // Verify that the working directory is a valid path and is the root folder of the fern repo
            const inputValidationErrors = [];

            const fernRepoDirectory = argv.fernRepoDirectory ?? process.cwd();
            const isFernRepoResult = isFernRepo(fernRepoDirectory);
            if (!isFernRepoResult.success) {
                inputValidationErrors.push(
                    `The working directory (${fernRepoDirectory}) is not the root folder of the fern repo. ${isFernRepoResult.error}`
                );
            }

            const localFernCliIsBuilt = await isLocalFernCliBuilt(fernRepoDirectory);
            if (!localFernCliIsBuilt.success) {
                inputValidationErrors.push(localFernCliIsBuilt.error);
            }

            const githubToken = argv.githubToken ?? process.env.GITHUB_TOKEN;
            if (githubToken == null) {
                inputValidationErrors.push("GITHUB_TOKEN environment variable is not set");
            }
            const fernToken = argv.fernToken ?? process.env.FERN_TOKEN;
            if (fernToken == null) {
                inputValidationErrors.push("FERN_TOKEN environment variable is not set");
            }

            if (inputValidationErrors.length > 0) {
                throw new Error(inputValidationErrors.join("\n"));
            }

            await executeTestRemoteLocalCommand({
                generator: argv.generator ?? [],
                fixture: argv.fixture ?? [],
                outputFolder: argv.outputFolder ?? "",
                outputMode: argv.outputMode ?? [],
                logLevel: argv.logLevel,
                fernRepoDirectory,
                githubToken: githubToken ?? "",
                fernToken: fernToken ?? "",
                buildGenerator: argv.buildGenerator ?? false,
                parallel: argv.parallel
            });
        }
    );
}

function addRunCommand(cli: Argv) {
    cli.command(
        "run",
        "Runs the generator on the given input",
        (yargs) =>
            yargs
                .option("generator", {
                    string: true,
                    demandOption: true,
                    alias: "sdk",
                    description: "Generator to run (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("path", {
                    type: "string",
                    string: true,
                    demandOption: true,
                    description: "Path to the fern definition"
                })
                .option("output-path", {
                    type: "string",
                    string: true,
                    demandOption: false,
                    alias: "op",
                    description: "Path to output the generated files (defaults to tmp dir)"
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("skip-scripts", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "ss"
                })
                .option("audience", {
                    string: true,
                    demandOption: false,
                    alias: "a"
                })
                .option("local", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "l",
                    description: "Run the generator locally instead of using Docker"
                })
                .option("keepContainer", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "k",
                    description: "Keeps the docker container after the generator finishes (Docker mode only)"
                })
                .option("inspect", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "i"
                })
                .option("prefer-manual-examples", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description:
                        "Skip autogenerated examples when manual examples exist (matches CLI remote generation behavior)"
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            const resolvedGenerator = normalizeGeneratorName(argv.generator, generators);
            throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [resolvedGenerator] });

            const generator = generators.find((g) => g.workspaceName === resolvedGenerator);
            if (generator == null) {
                throw new Error(
                    `Generator ${resolvedGenerator} not found. Please make sure that there is a folder with the name ${resolvedGenerator} in the seed directory.`
                );
            }

            if (argv.local && generator.workspaceConfig.test.local == null) {
                throw new Error(
                    `Generator ${generator.workspaceName} does not have a local test configuration. Please add a 'test.local' section to your seed.yml with 'buildCommand' and 'runCommand' properties.`
                );
            }

            await runWithCustomFixture({
                pathToFixture: argv.path.startsWith("/")
                    ? AbsoluteFilePath.of(argv.path)
                    : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv.path)),
                workspace: generator,
                logLevel: argv["log-level"],
                skipScripts: argv.skipScripts,
                outputPath: argv["output-path"]
                    ? argv["output-path"].startsWith("/")
                        ? AbsoluteFilePath.of(argv["output-path"])
                        : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv["output-path"]))
                    : undefined,
                inspect: argv.inspect,
                local: argv.local,
                keepContainer: argv.keepContainer,
                skipAutogenerationIfManualExamplesExist: argv.preferManualExamples
            });
        }
    );
}

const DEFAULT_IMAGE_VERSION = "99.99.99";
function addImgCommand(cli: Argv) {
    cli.command(
        "img <generator> [tag]",
        "Builds a docker image for the specified generator and stores it in the local docker daemon",
        (yargs) =>
            yargs
                .version(false)
                .positional("generator", {
                    type: "string",
                    demandOption: true,
                    description: "Generator to build docker image for"
                })
                .positional("tag", {
                    type: "string",
                    demandOption: false,
                    description: "Version tag (optional positional)"
                })
                .option("version", {
                    alias: "v",
                    type: "string",
                    demandOption: false,
                    description: `Version tag for the docker image (must be valid semver, defaults to ${DEFAULT_IMAGE_VERSION})`
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [argv.generator] });

            const generator = generators.find((g) => g.workspaceName === argv.generator);
            if (generator == null) {
                throw new Error(
                    `Generator ${argv.generator} not found. Please make sure that there is a folder with the name ${argv.generator} in the seed directory.`
                );
            }

            const positionalTag = argv.tag as string | undefined;
            const version = positionalTag ?? argv.version ?? DEFAULT_IMAGE_VERSION;
            try {
                assertValidSemVerOrThrow(version);
            } catch (error) {
                throw new Error(
                    `Invalid version: ${version}. Version must be a valid semver (e.g., 1.2.3 or 1.2.3-rc5).`
                );
            }

            const logLevel = argv["log-level"];
            const taskContextFactory = new TaskContextFactory(logLevel);
            const taskContext = taskContextFactory.create(`Building docker image for ${generator.workspaceName}`);

            taskContext.logger.info(`Using version: ${version}`);

            await buildGeneratorImage({
                generator,
                version,
                context: taskContext,
                logLevel
            });
        }
    );
}

function addGetAvailableFixturesCommand(cli: Argv) {
    cli.command(
        "get-available-fixtures",
        "Get the available fixtures and output folder options for the given generator",
        (yargs) =>
            yargs
                .option("generator", {
                    string: true,
                    demandOption: true,
                    alias: "sdk",
                    description:
                        "Generator to get fixtures for (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("include-output-folders", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "iof",
                    description:
                        "Whether to separate by test subfolders or not (e.g., imdb:noScripts, imdb:no-custom-config, etc.)"
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            const resolvedGenerator = normalizeGeneratorName(argv.generator, generators);
            throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [resolvedGenerator] });

            const generator = generators.find((g) => g.workspaceName === resolvedGenerator);
            if (generator == null) {
                throw new Error(
                    `Generator ${resolvedGenerator} not found. Please make sure that there is a folder with the name ${resolvedGenerator} in the seed directory.`
                );
            }

            const availableFixtures = getAvailableFixtures(generator, argv["include-output-folders"]);

            // Note: HAVE to log the output for CI to pick it up
            console.log(JSON.stringify({ fixtures: availableFixtures }, null, 2));
        }
    );
}

function addListTestFixturesCommand(cli: Argv) {
    cli.command(
        "list-test-fixtures",
        "List all test fixtures for all generators or a specific generator, with output folders, in JSON format for CI consumption",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: ["g", "sdk"],
                    description:
                        "The generators to list fixtures for (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("groups", {
                    type: "string",
                    demandOption: false,
                    alias: "n",
                    description:
                        "Split fixtures into groups for parallel execution. Use 'auto' to automatically calculate based on fixture count, or a number for a specific group count."
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            argv.generator = normalizeGeneratorNames(argv.generator, generators);
            if (argv.generator != null) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }

            const targetGenerators =
                argv.generator != null
                    ? generators.filter((g) => argv.generator?.includes(g.workspaceName))
                    : generators;

            // Determine number of groups
            const groupsArg = argv.groups;
            const numGroups = groupsArg === "auto" ? -1 : groupsArg != null ? parseInt(groupsArg, 10) : undefined;

            // If groups is specified, output grouped fixtures
            if (numGroups !== undefined) {
                // For grouped output, we expect a single generator
                if (targetGenerators.length !== 1) {
                    throw new Error("When using --groups, you must specify exactly one generator with --generator");
                }

                const generator = targetGenerators[0];
                if (generator == null) {
                    throw new Error("Generator not found");
                }
                const fixtures = getAvailableFixtures(generator, true);
                const groups = splitFixturesIntoGroups(fixtures, numGroups);
                console.log(JSON.stringify(groups));
                return;
            }

            // Output flat list of fixtures for each generator
            const result: Record<string, string[]> = {};

            for (const generator of targetGenerators) {
                const fixtures = getAvailableFixtures(generator, true);
                result[generator.workspaceName] = fixtures;
            }

            // Output JSON to stdout (can be piped or captured directly)
            console.log(JSON.stringify({ generators: result }));
        }
    );
}

function addAffectedCommand(cli: Argv) {
    cli.command(
        "affected",
        "Detect which generators and fixtures are affected by changes in the current branch",
        (yargs) =>
            yargs
                .option("base-ref", {
                    type: "string",
                    demandOption: false,
                    default: "origin/main",
                    alias: "br",
                    description: "Git ref to diff against (default: origin/main)"
                })
                .option("json", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "j",
                    description: "Output results as JSON"
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            const repoRoot = findRepoRoot();
            const changedFiles = getChangedFiles(argv.baseRef, repoRoot);
            const affected = detectAffected(changedFiles, generators);

            if (argv.json) {
                const resolvedGenerators = resolveAffectedGenerators(affected, generators);
                console.log(
                    JSON.stringify(
                        {
                            allGeneratorsAffected: affected.allGeneratorsAffected,
                            allFixturesAffected: affected.allFixturesAffected,
                            generators: resolvedGenerators.map((g) => g.workspaceName),
                            generatorsWithAllFixtures: affected.generatorsWithAllFixtures,
                            fixtures: affected.affectedFixtures,
                            summary: affected.summary
                        },
                        null,
                        2
                    )
                );
            } else {
                console.log("\n=== Affected Detection ===");
                for (const line of affected.summary) {
                    console.log(`  ${line}`);
                }

                const resolvedGenerators = resolveAffectedGenerators(affected, generators);
                console.log(`\nAffected generators (${resolvedGenerators.length}):`);
                for (const gen of resolvedGenerators) {
                    const needsAllFixtures = affected.generatorsWithAllFixtures.includes(gen.workspaceName);
                    console.log(`  - ${gen.workspaceName}${needsAllFixtures ? " (all fixtures)" : ""}`);
                }

                if (!affected.allFixturesAffected && affected.affectedFixtures.length > 0) {
                    console.log(`\nChanged fixtures — all generators run these (${affected.affectedFixtures.length}):`);
                    for (const fixture of affected.affectedFixtures) {
                        console.log(`  - ${fixture}`);
                    }
                } else if (affected.allFixturesAffected) {
                    console.log("\nAll fixtures affected.");
                }
                console.log("==========================\n");
            }
        }
    );
}

function addCleanCommand(cli: Argv) {
    cli.command(
        "clean",
        "Find and remove orphaned seed folders that no longer have corresponding test definitions",
        (yargs) =>
            yargs
                .option("generator", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    alias: ["g", "sdk"],
                    description: "The generators to clean (short names like 'csharp' are auto-expanded to 'csharp-sdk')"
                })
                .option("dry-run", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    alias: "dr",
                    description: "List orphaned folders without deleting them"
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            argv.generator = normalizeGeneratorNames(argv.generator, generators);
            if (argv.generator != null) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }

            const targetGenerators =
                argv.generator != null
                    ? generators.filter((g) => argv.generator?.includes(g.workspaceName))
                    : generators;

            const result = await cleanOrphanedSeedFolders(targetGenerators, argv.dryRun);
            const emptyResult = await cleanEmptySeedDirectories(argv.dryRun);

            if (argv.dryRun && (result.orphanedFolders.length > 0 || emptyResult.emptyDirectories.length > 0)) {
                process.exit(1);
            }
        }
    );
}

function expandFixtureGlobs(fixturePatterns: string[], availableFixtures: string[]): string[] {
    const expandedFixtures = new Set<string>();

    for (const pattern of fixturePatterns) {
        if (pattern.includes("*") || pattern.includes("?") || pattern.includes("[")) {
            const matches = availableFixtures.filter((fixture) => minimatch(fixture, pattern));
            if (matches.length === 0) {
                throw new Error(
                    `Glob pattern "${pattern}" did not match any fixtures. Available fixtures: ${availableFixtures.join(", ")}`
                );
            }
            for (const match of matches) {
                expandedFixtures.add(match);
            }
        } else {
            expandedFixtures.add(pattern);
        }
    }

    return Array.from(expandedFixtures);
}

function addPublishCommands(cli: Argv) {
    cli.command("publish", "Publish releases", (yargs) => {
        yargs
            .command(
                "cli",
                "Publishes all latest versions the CLI to NPM.",
                (yargs) =>
                    yargs
                        // Version is a reserved option in yargs...
                        .option("ver", {
                            type: "string",
                            demandOption: false
                        })
                        .option("changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the latest changelog file, used along side `previous-changelog` to the most recent new version to publish."
                        })
                        .option("previous-changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the previous changelog file, used along side `changelog` to the most recent new version to publish."
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        })
                        .option("dev", {
                            type: "boolean",
                            default: false,
                            demandOption: false
                        })
                        .check((argv) => {
                            return (
                                // Check: Either version or changelog and previousChangelog must be provided
                                argv.ver || (argv.changelog && argv.previousChangelog)
                            );
                        }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Publish");

                    await publishCli({
                        version: argv.ver
                            ? argv.ver
                            : {
                                  // These assertions should be safe given the check with `yargs` above
                                  //
                                  // biome-ignore lint/style/noNonNullAssertion: allow
                                  latestChangelogPath: argv.changelog!,
                                  // biome-ignore lint/style/noNonNullAssertion: allow
                                  previousChangelogPath: argv.previousChangelog!
                              },
                        context,
                        isDevRelease: argv.dev
                    });
                }
            )
            .command(
                "generator <generator>",
                "Publishes all latest versions of the generators to DockerHub unless otherwise specified. To filter to certain generators pass in the generator IDs as a positional, space delimited list.",
                (yargs) =>
                    yargs
                        .positional("generator", {
                            type: "string",
                            demandOption: true,
                            description: "Generator(s) to register"
                        })
                        // Version is a reserved option in yargs...
                        .option("ver", {
                            type: "string",
                            demandOption: false
                        })
                        .option("changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the latest changelog file, used along side `previous-changelog` to the most recent new version to publish."
                        })
                        .option("previous-changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the previous changelog file, used along side `changelog` to the most recent new version to publish."
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        })
                        .check((argv) => {
                            return (
                                // Check: Either version or changelog and previousChangelog must be provided
                                argv.ver || (argv.changelog && argv.previousChangelog)
                            );
                        }),
                async (argv) => {
                    const generators = await loadGeneratorWorkspaces();
                    if (argv.generators != null) {
                        throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [argv.generator] });
                    }

                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Publish");

                    const maybeGeneratorWorkspace = generators.find((g) => g.workspaceName === argv.generator);
                    if (maybeGeneratorWorkspace == null) {
                        context.failAndThrow(`Specified generator ${argv.generator} not found.`);
                        return;
                    }

                    await publishGenerator({
                        generator: maybeGeneratorWorkspace,
                        version: argv.ver
                            ? argv.ver
                            : {
                                  // These assertions should be safe given the check with `yargs` above
                                  //
                                  // biome-ignore lint/style/noNonNullAssertion: allow
                                  latestChangelogPath: argv.changelog!,
                                  // biome-ignore lint/style/noNonNullAssertion: allow
                                  previousChangelogPath: argv.previousChangelog!
                              },
                        context
                    });
                }
            );
    });
}

function addRegisterCommands(cli: Argv) {
    cli.command("register", "Register releases within FDR's database", (yargs) => {
        yargs
            .command(
                "cli",
                "Registers CLI releases",
                (addtlYargs) =>
                    addtlYargs.option("log-level", {
                        default: LogLevel.Info,
                        choices: LOG_LEVELS
                    }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Register");
                    const token = await askToLogin(context);

                    const fdrClient = createFdrService({ token: token.value });

                    await registerCliRelease({
                        fdrClient,
                        context
                    });
                }
            )
            .command(
                "generator",
                "Registers all of the generators to FDR unless otherwise specified. To filter to certain generators pass in the generator ids to `--generators`, space delimited list.",
                (yargs) =>
                    yargs
                        // This would ideally be positional, but you can't have positional arguments that are arrays with yargs
                        .option("generators", {
                            array: true,
                            type: "string",
                            demandOption: false,
                            description: "Generator(s) to register"
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        }),
                async (argv) => {
                    const generators = await loadGeneratorWorkspaces();
                    if (argv.generators != null) {
                        throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generators });
                    }
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Register");
                    const token = await askToLogin(context);

                    const fdrClient = createFdrService({ token: token.value });

                    for (const generator of generators) {
                        // If you've specified a list of generators, and the current generator is not in that list, skip it
                        if (argv.generators != null && !argv.generators.includes(generator.workspaceName)) {
                            continue;
                        }
                        // Register the generator and it's versions
                        await registerGenerator({
                            generator,
                            fdrClient,
                            context
                        });
                    }
                }
            );
    });
}

function addLatestCommands(cli: Argv) {
    cli.command("latest", "Get latest release", (yargs) => {
        yargs
            .command(
                "cli",
                "Get latest CLI release.",
                (yargs) =>
                    yargs
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        })
                        .option("output", {
                            alias: "o",
                            type: "string",
                            demandOption: false
                        })
                        .option("changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the latest changelog file, used along side `previous-changelog` to get the most recent new version."
                        })
                        .option("previous-changelog", {
                            type: "string",
                            demandOption: false,
                            description:
                                "Path to the previous changelog file, used along side `changelog` to get the most recent new version."
                        })
                        .check((argv) => {
                            return (
                                (!argv.changelog && !argv.previousChangelog) ||
                                (argv.changelog && argv.previousChangelog)
                            );
                        }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Publish");

                    const ver = await getLatestCli({
                        context,
                        maybeChangelogs:
                            argv.changelog && argv.previousChangelog
                                ? {
                                      latestChangelogPath: argv.changelog!,
                                      previousChangelogPath: argv.previousChangelog!
                                  }
                                : undefined
                    });
                    if (ver == null) {
                        context.logger.error("No latest version found for CLI");
                        return;
                    }

                    if (argv.output) {
                        await writeFile(argv.output, ver);
                    } else {
                        process.stdout.write(ver);
                    }
                }
            )
            .command(
                "generator <generator>",
                "Get latest release of the specified generator.",
                (yargs) =>
                    yargs
                        .positional("generator", {
                            type: "string",
                            demandOption: true,
                            description: "Generator(s) to register"
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        })
                        .option("output", {
                            alias: "o",
                            type: "string",
                            demandOption: false
                        }),
                async (argv) => {
                    const generators = await loadGeneratorWorkspaces();
                    if (argv.generators != null) {
                        throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [argv.generator] });
                    }

                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Publish");

                    const maybeGeneratorWorkspace = generators.find((g) => g.workspaceName === argv.generator);
                    if (maybeGeneratorWorkspace == null) {
                        context.failAndThrow(`Specified generator ${argv.generator} not found.`);
                        return;
                    }

                    const ver = await getLatestGenerator({
                        generator: maybeGeneratorWorkspace,
                        context
                    });
                    if (ver == null) {
                        context.logger.error(`No latest version found for generator ${argv.generator}`);
                        return;
                    }
                    if (argv.output) {
                        await writeFile(argv.output, ver);
                    } else {
                        process.stdout.write(ver);
                    }
                }
            )
            .command(
                "versions-yml",
                "Get latest version from an arbitrary versions.yml file, optionally comparing with a previous version",
                (yargs) =>
                    yargs
                        .option("path", {
                            type: "string",
                            demandOption: true,
                            description: "Path to the current versions.yml file"
                        })
                        .option("previous-path", {
                            type: "string",
                            demandOption: false,
                            description: "Path to the previous versions.yml file for comparison"
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        })
                        .option("output", {
                            alias: "o",
                            type: "string",
                            demandOption: false,
                            description: "Output file path (writes to stdout if not provided)"
                        })
                        .option("format", {
                            type: "string",
                            choices: ["version", "json"],
                            default: "version",
                            description:
                                "Output format: 'version' (just the version string) or 'json' (version + has_new_version flag)"
                        }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Latest");

                    const absolutePath = argv.path.startsWith("/")
                        ? AbsoluteFilePath.of(argv.path)
                        : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv.path));

                    const previousAbsolutePath = argv["previous-path"]
                        ? argv["previous-path"].startsWith("/")
                            ? AbsoluteFilePath.of(argv["previous-path"])
                            : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv["previous-path"]))
                        : undefined;

                    const result = await getLatestVersionsYml({
                        absolutePathToChangelog: absolutePath,
                        previousAbsolutePathToChangelog: previousAbsolutePath,
                        context
                    });

                    if (result == null) {
                        context.logger.error("Failed to get latest version");
                        return;
                    }

                    // Format output
                    let output: string;
                    if (argv.format === "json") {
                        output = JSON.stringify(
                            {
                                version: result.version,
                                has_new_version: result.hasNewVersion
                            },
                            null,
                            2
                        );
                    } else {
                        output = result.version;
                    }

                    // Write output
                    if (argv.output) {
                        await writeFile(argv.output, output);
                        context.logger.info(`Wrote version to ${argv.output}`);
                    } else {
                        process.stdout.write(output);
                    }
                }
            );
    });
}

function addValidateCommands(cli: Argv) {
    cli.command("validate", "Validate your changelog file", (yargs) => {
        yargs
            .command(
                "cli",
                "validate CLI releases",
                (addtlYargs) =>
                    addtlYargs.option("log-level", {
                        default: LogLevel.Info,
                        choices: LOG_LEVELS
                    }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("CLI");

                    await validateCliRelease({
                        context
                    });
                }
            )
            .command(
                "generator <generator>",
                "validate generator releases.",
                (yargs) =>
                    yargs
                        .positional("generator", {
                            type: "string",
                            demandOption: true,
                            description: "Generator who's changelog you want to validate"
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        }),
                async (argv) => {
                    const generators = await loadGeneratorWorkspaces();
                    if (argv.generator != null) {
                        throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: [argv.generator] });
                    }
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);

                    for (const generator of generators) {
                        // If you've specified a list of generators, and the current generator is not in that list, skip it
                        if (argv.generator !== generator.workspaceName) {
                            continue;
                        }
                        // Register the generator and it's versions
                        await validateGenerator({
                            generator,
                            context: taskContextFactory.create(argv.generator)
                        });
                    }
                }
            )
            .command(
                "versions-yml",
                "validate an arbitrary versions.yml (changelog) file",
                (yargs) =>
                    yargs
                        .option("path", {
                            type: "string",
                            demandOption: true,
                            description: "Path to the versions.yml file to validate"
                        })
                        .option("log-level", {
                            default: LogLevel.Info,
                            choices: LOG_LEVELS
                        }),
                async (argv) => {
                    const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                    const context = taskContextFactory.create("Validate");

                    const absolutePath = argv.path.startsWith("/")
                        ? AbsoluteFilePath.of(argv.path)
                        : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv.path));

                    await validateVersionsYml({
                        absolutePathToChangelog: absolutePath,
                        context
                    });
                }
            );
    });
}

function addGenerateCommands(cli: Argv) {
    cli.command("generate", "generate artifacts based on your seed declarations", (yargs) => {
        yargs.command("changelog", "generate a changelog in the Fern Docs format", (tlYargs) => {
            tlYargs
                .command(
                    "cli",
                    "Generate a changelog for CLI releases",
                    (addtlYargs) =>
                        addtlYargs
                            .option("log-level", {
                                default: LogLevel.Info,
                                choices: LOG_LEVELS
                            })
                            .option("output", {
                                alias: "o",
                                description:
                                    "Path to write the changelog to, if not provided, will write to cwd. Note this should be a directory, not a filename.",
                                string: true,
                                demandOption: false
                            })
                            .option("clean-directory", {
                                type: "boolean",
                                demandOption: false,
                                description:
                                    "If true, we will delete the contents of the output directory before generating the changelog."
                            }),
                    async (argv) => {
                        const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                        const context = taskContextFactory.create("Changelog");

                        const token = await askToLogin(context);
                        const fdrClient = createFdrService({ token: token.value });

                        await generateCliChangelog({
                            context,
                            outputPath: argv.output,
                            fdrClient,
                            cleanOutputDirectory: argv.cleanDirectory ?? false
                        });
                    }
                )
                .command(
                    "generator",
                    "Generate a changelog for generator releases.",
                    (yargs) =>
                        yargs
                            // This would ideally be positional, but you can't have positional arguments that are arrays with yargs
                            .option("generators", {
                                array: true,
                                type: "string",
                                demandOption: false,
                                description: "Generator(s) to register"
                            })
                            .option("output", {
                                alias: "o",
                                description:
                                    "Path to write the changelog to, if not provided, will write to cwd. Note this should be a directory, not a filename.",
                                string: true,
                                demandOption: false
                            })
                            .option("log-level", {
                                default: LogLevel.Info,
                                choices: LOG_LEVELS
                            })
                            .option("clean-directory", {
                                type: "boolean",
                                demandOption: false,
                                description:
                                    "If true, we will delete the contents of the output directory before generating the changelog."
                            }),
                    async (argv) => {
                        const generators = await loadGeneratorWorkspaces();
                        if (argv.generators != null) {
                            throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generators });
                        }
                        const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                        const context = taskContextFactory.create("Changelog");

                        const token = await askToLogin(context);
                        const fdrClient = createFdrService({ token: token.value });

                        for (const generator of generators) {
                            // If you've specified a list of generators, and the current generator is not in that list, skip it
                            if (argv.generators != null && !argv.generators.includes(generator.workspaceName)) {
                                continue;
                            }

                            let outputPath = argv.output;
                            if (argv.generators == null || argv.generators?.length > 1) {
                                outputPath = join(
                                    RelativeFilePath.of(argv.output ?? "./"),
                                    RelativeFilePath.of(generator.workspaceName)
                                );
                            }

                            await generateGeneratorChangelog({
                                context,
                                generator,
                                outputPath,
                                fdrClient,
                                cleanOutputDirectory: argv.cleanDirectory ?? false
                            });
                        }
                    }
                );
        });
    });
}

/**
 * Resolves `--sdk` shorthand values into full generator names by appending `-sdk`.
 * Merges them with any explicit `--generator` values.
 */
function normalizeGeneratorName(name: string, workspaces: GeneratorWorkspace[]): string {
    const workspaceNames = new Set(workspaces.map((w) => w.workspaceName));
    if (workspaceNames.has(name)) {
        return name;
    }
    const expanded = `${name}-sdk`;
    if (workspaceNames.has(expanded)) {
        return expanded;
    }
    return name;
}

function normalizeGeneratorNames(names: string[] | undefined, workspaces: GeneratorWorkspace[]): string[] | undefined {
    if (names == null) {
        return undefined;
    }
    return names.map((name) => normalizeGeneratorName(name, workspaces));
}

function throwIfGeneratorDoesNotExist({
    seedWorkspaces,
    generators
}: {
    seedWorkspaces: GeneratorWorkspace[];
    generators: string[];
}) {
    const generatorNames = new Set(
        seedWorkspaces.map((gen) => {
            return gen.workspaceName;
        })
    );
    const missingGenerators = [];
    for (const generator of generators) {
        if (!generatorNames.has(generator)) {
            missingGenerators.push(generator);
        }
    }
    if (missingGenerators.length > 0) {
        throw new Error(
            `Generators ${missingGenerators.join(
                ", "
            )} not found. Please make sure that there is a folder with those names in the seed directory.`
        );
    }
}

// Dummy clone of the function from @fern-api/core
// because we're using different SDKs for these packages
function createFdrService({
    environment = process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
    token
}: {
    environment?: string;
    token: (() => string) | string;
}): FdrClient {
    return new FdrClient({
        environment,
        token
    });
}
