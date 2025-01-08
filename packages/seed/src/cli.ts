import { writeFile } from "fs/promises";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";

import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";

import { Semaphore } from "./Semaphore";
import { generateCliChangelog } from "./commands/generate/generateCliChangelog";
import { generateGeneratorChangelog } from "./commands/generate/generateGeneratorChangelog";
import { getLatestCli } from "./commands/latest/getLatestCli";
import { getLatestGenerator } from "./commands/latest/getLatestGenerator";
import { publishCli } from "./commands/publish/publishCli";
import { publishGenerator } from "./commands/publish/publishGenerator";
import { registerCliRelease } from "./commands/register/registerCliRelease";
import { registerGenerator } from "./commands/register/registerGenerator";
import { runWithCustomFixture } from "./commands/run/runWithCustomFixture";
import { ScriptRunner } from "./commands/test/ScriptRunner";
import { TaskContextFactory } from "./commands/test/TaskContextFactory";
import { DockerTestRunner, LocalTestRunner } from "./commands/test/test-runner";
import { FIXTURES, testGenerator } from "./commands/test/testWorkspaceFixtures";
import { validateCliRelease } from "./commands/validate/validateCliChangelog";
import { validateGenerator } from "./commands/validate/validateGeneratorChangelog";
import { GeneratorWorkspace, loadGeneratorWorkspaces } from "./loadGeneratorWorkspaces";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv))
        .strict()
        .fail((message, error: unknown, argv) => {
            // if error is null, it's a yargs validation error
            if (error == null) {
                argv.showHelp();
                // eslint-disable-next-line
                console.error(message);
            }
        });

    addTestCommand(cli);
    addRunCommand(cli);
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
                    default: FIXTURES,
                    choices: FIXTURES,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("outputFolder", {
                    string: true,
                    demandOption: false,
                    description: "Runs on a specific output folder. Only relevant if there are >1 folders configured."
                })
                .option("keepDocker", {
                    type: "boolean",
                    demandOption: false,
                    default: false,
                    description: "Keeps the docker container after the tests are finished"
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
                let testRunner;
                const scriptRunner = new ScriptRunner(
                    generator,
                    argv.skipScripts,
                    taskContextFactory.create("script-runner")
                );
                if (argv.local && generator.workspaceConfig.test.local != null) {
                    testRunner = new LocalTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        scriptRunner,
                        keepDocker: false // dummy
                    });
                } else {
                    testRunner = new DockerTestRunner({
                        generator,
                        lock,
                        taskContextFactory,
                        skipScripts: argv.skipScripts,
                        keepDocker: argv.keepDocker,
                        scriptRunner
                    });
                }

                tests.push(
                    testGenerator({
                        generator,
                        runner: testRunner,
                        fixtures: argv.fixture,
                        outputFolder: argv.outputFolder
                    })
                );
            }

            const results = await Promise.all(tests);

            for (const scriptRunner of scriptRunners) {
                await scriptRunner.stop();
            }

            // If any of the tests failed, exit with a non-zero status code
            if (results.includes(false)) {
                process.exit(1);
            }
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
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                })
                .option("audience", {
                    string: true,
                    demandOption: false
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

            await runWithCustomFixture({
                pathToFixture: argv.path.startsWith("/")
                    ? AbsoluteFilePath.of(argv.path)
                    : join(AbsoluteFilePath.of(process.cwd()), RelativeFilePath.of(argv.path)),
                workspace: generator,
                logLevel: argv["log-level"],
                audience: argv.audience
            });
        }
    );
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
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                  latestChangelogPath: argv.changelog!,
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                  latestChangelogPath: argv.changelog!,
                                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
