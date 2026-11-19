import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin } from "@fern-api/login";
import { FernRegistryClient as FdrClient } from "@fern-fern/generators-sdk";
import { writeFile } from "fs/promises";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { generateCliChangelog } from "./commands/generate/generateCliChangelog.js";
import { getLatestCli } from "./commands/latest/getLatestCli.js";
import { getLatestVersionsYml } from "./commands/latest/getLatestVersionsYml.js";
import { publishCli } from "./commands/publish/publishCli.js";
import { registerCliRelease } from "./commands/register/registerCliRelease.js";
import { TaskContextFactory } from "./commands/test/TaskContextFactory.js";
import { validateCliRelease } from "./commands/validate/validateCliChangelog.js";
import { validateVersionsYml } from "./commands/validate/validateVersionsYml.js";

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

    addRegisterCommands(cli);
    addPublishCommands(cli);
    addValidateCommands(cli);
    addLatestCommands(cli);
    addGenerateCommands(cli);

    await cli.parse();
}

const DEFAULT_IMAGE_VERSION = "99.99.99";

function addPublishCommands(cli: Argv) {
    cli.command("publish", "Publish releases", (yargs) => {
        yargs.command(
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
                    .option("beta", {
                        type: "boolean",
                        default: false,
                        demandOption: false
                    })
                    .option("pre-prod", {
                        type: "boolean",
                        default: false,
                        demandOption: false
                    })
                    .check((argv) => {
                        const selectedReleaseFlags = [argv.dev, argv.beta, argv.preProd].filter(Boolean).length;
                        if (selectedReleaseFlags > 1) {
                            throw new Error("Arguments --dev, --beta, and --pre-prod are mutually exclusive");
                        }
                        // Either version or changelog and previousChangelog must be provided
                        if (!argv.ver && !(argv.changelog && argv.previousChangelog)) {
                            throw new Error(
                                "Either --ver or both --changelog and --previousChangelog must be provided"
                            );
                        }
                        return true;
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
                    isDevRelease: argv.dev,
                    isBetaRelease: argv.beta,
                    isPreProdRelease: argv.preProd
                });
            }
        );
    });
}

function addRegisterCommands(cli: Argv) {
    cli.command("register", "Register releases within FDR's database", (yargs) => {
        yargs.command(
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
            tlYargs.command(
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
            );
        });
    });
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
