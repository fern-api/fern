import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import { writeFile } from "fs/promises";
import { minimatch } from "minimatch";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generateCliChangelog } from "./commands/generate/generateCliChangelog";
import { generateGeneratorChangelog } from "./commands/generate/generateGeneratorChangelog";
import { buildGeneratorImage } from "./commands/img/buildGeneratorImage";
import { getLatestCli } from "./commands/latest/getLatestCli";
import { getLatestGenerator } from "./commands/latest/getLatestGenerator";
import { getLatestVersionsYml } from "./commands/latest/getLatestVersionsYml";
import { publishCli } from "./commands/publish/publishCli";
import { publishGenerator } from "./commands/publish/publishGenerator";
import { registerCliRelease } from "./commands/register/registerCliRelease";
import { registerGenerator } from "./commands/register/registerGenerator";
import { runWithCustomFixture } from "./commands/run/runWithCustomFixture";
import { ContainerScriptRunner, LocalScriptRunner, ScriptRunner } from "./commands/test";
import { TaskContextFactory } from "./commands/test/TaskContextFactory";
import { ContainerTestRunner, LocalTestRunner, TestRunner } from "./commands/test/test-runner";
import { FIXTURES, LANGUAGE_SPECIFIC_FIXTURE_PREFIXES, testGenerator } from "./commands/test/testWorkspaceFixtures";
import { executeTestRemoteLocalCommand, isFernRepo, isLocalFernCliBuilt } from "./commands/test-remote-local";
import { assertValidSemVerOrThrow } from "./commands/validate/semVerUtils";
import { validateCliRelease } from "./commands/validate/validateCliChangelog";
import { validateGenerator } from "./commands/validate/validateGeneratorChangelog";
import { validateVersionsYml } from "./commands/validate/validateVersionsYml";
import { GeneratorWorkspace, loadGeneratorWorkspaces } from "./loadGeneratorWorkspaces";
import { Semaphore } from "./Semaphore";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv))
        .strict()
        .fail((message, error: unknown, argv) => {
            // if error is null, it's a yargs validation error
            if (error == null) {
                argv.showHelp();
                // biome-ignore lint: ignore next line
                console.error(message);
            }
        });

    addTestCommand(cli);
    addTestRemoteLocalCommand(cli);
    addRunCommand(cli);
    addImgCommand(cli);
    addGetAvailableFixturesCommand(cli);
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
                    alias: "g",
                    description: "The generators to run tests for"
                })
                .option("parallel", {
                    type: "number",
                    default: 4,
                    alias: "p"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    // default: FIXTURES,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
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
                    default: false
                })
                .option("local", {
                    type: "boolean",
                    demandOption: false,
                    default: false
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
                    description: "Execute Node with --inspect flag for debugging"
                })
                .option("container-runtime", {
                    type: "string",
                    choices: ["docker", "podman"],
                    demandOption: false,
                    description: "Explicitly specify which container runtime to use (docker or podman)"
                }),
        async (argv) => {
            const generators = await loadGeneratorWorkspaces();
            if (argv.generator != null) {
                throwIfGeneratorDoesNotExist({ seedWorkspaces: generators, generators: argv.generator });
            }

            const taskContextFactory = new TaskContextFactory(argv["log-level"]);
            const lock = new Semaphore(argv.parallel);
            const tests: Promise<boolean>[] = [];
            const scriptRunners: ScriptRunner[] = [];

            for (const generator of generators) {
                if (argv.generator != null && !argv.generator.includes(generator.workspaceName)) {
                    continue;
                }
                let testRunner: TestRunner;
                let scriptRunner: ScriptRunner;

                // If no fixtures passed in, use all available fixtures (without output folders)
                if (argv.fixture == null) {
                    argv.fixture = await getAvailableFixtures(generator, false);
                } else {
                    const availableFixturesForGlobbing = await getAvailableFixtures(generator, false);
                    argv.fixture = expandFixtureGlobs(argv.fixture, availableFixturesForGlobbing);
                }

                // Get both formats of fixtures and check if the fixtures passed in are of one of the two formats allowed
                const availableFixtures = await getAvailableFixtures(generator, false);
                const availableFixturesWithOutputFolders = await getAvailableFixtures(generator, true);

                for (const fixture of argv.fixture) {
                    if (!availableFixtures.includes(fixture) && !availableFixturesWithOutputFolders.includes(fixture)) {
                        throw new Error(
                            `Fixture ${fixture} not found. Please make sure that it is a valid fixture for the generator ${generator.workspaceName}.`
                        );
                    }
                }

                // Verify if there are multiple fixtures passed in or a fixture has a colon separated output folder, that
                // the flag for the output folder is not also used
                if (
                    (argv.fixture.length > 1 || argv.fixture.some((fixture) => fixture.includes(":"))) &&
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
                    scriptRunner = new LocalScriptRunner(
                        generator,
                        argv.skipScripts,
                        taskContextFactory.create("local-script-runner")
                    );
                    testRunner = new LocalTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        scriptRunner,
                        keepContainer: false, // not used for local
                        inspect: argv.inspect
                    });
                } else {
                    scriptRunner = new ContainerScriptRunner(
                        generator,
                        argv.skipScripts,
                        taskContextFactory.create("docker-script-runner"),
                        argv.containerRuntime as "docker" | "podman" | undefined
                    );
                    testRunner = new ContainerTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        keepContainer: argv.keepContainer,
                        scriptRunner,
                        inspect: argv.inspect,
                        runner: argv.containerRuntime as "docker" | "podman" | undefined
                    });
                }

                scriptRunners.push(scriptRunner);
                tests.push(
                    testGenerator({
                        generator,
                        runner: testRunner,
                        fixtures: argv.fixture,
                        outputFolder: argv.outputFolder,
                        inspect: argv.inspect
                    })
                );
            }

            const results = await Promise.all(tests);

            for (const scriptRunner of scriptRunners) {
                await scriptRunner.stop();
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
                    alias: "g",
                    description: "The generators to run tests for"
                })
                .option("parallel", {
                    type: "number",
                    default: 4,
                    alias: "p",
                    description: "Number of parallel test cases to run"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
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
                    description:
                        "Build generator Docker images at version 99.99.99 for local generation mode. Uses 'pnpm seed img' internally."
                }),
        async (argv) => {
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
                    description: "Generator to run"
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
                    description: "Path to output the generated files (defaults to tmp dir)"
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("skip-scripts", {
                    type: "boolean",
                    demandOption: false,
                    default: false
                })
                .option("audience", {
                    string: true,
                    demandOption: false
                })
                .option("local", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Run the generator locally instead of using Docker"
                })
                .option("keepContainer", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Keeps the docker container after the generator finishes (Docker mode only)"
                })
                .option("inspect", {
                    type: "boolean",
                    demandOption: false,
                    default: false
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
                keepContainer: argv.keepContainer
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
                    description: "Generator to get fixtures for"
                })
                .option("include-output-folders", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description:
                        "Whether to separate by test subfolders or not (e.g., imdb:noScripts, imdb:no-custom-config, etc.)"
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

            const availableFixtures = await getAvailableFixtures(generator, argv["include-output-folders"]);

            // Note: HAVE to log the output for CI to pick it up
            console.log(JSON.stringify({ fixtures: availableFixtures }, null, 2));
        }
    );
}

async function getAvailableFixtures(generator: GeneratorWorkspace, withOutputFolders: boolean) {
    // Get all available fixtures
    const availableFixtures = FIXTURES.filter((fixture) => {
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.filter((prefix) => fixture.startsWith(prefix))[0];
        return matchingPrefix == null || generator.workspaceName.startsWith(matchingPrefix);
    });

    // Optionally, include output folders in format fixture:outputFolder (note: this will replace the fixture name without the output folder)
    if (withOutputFolders) {
        // Add fixtures that have subfolders with their subfoldered version
        const allOptions: string[] = [];
        for (const fixture of availableFixtures) {
            const config = generator.workspaceConfig.fixtures?.[fixture];
            if (config != null && config.length > 0) {
                // This fixture has subfolders, add to map as fixture:outputFolder
                for (const outputFolder of config.map((c) => c.outputFolder)) {
                    allOptions.push(`${fixture}:${outputFolder}`);
                }
            } else {
                // This fixture has no subfolders, keep as is
                allOptions.push(fixture);
            }
        }
        // Return map with output folders
        return allOptions;
    }

    // Don't include subfolders, return the original fixtures
    return availableFixtures;
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
