import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { initializeAPI, initializeDocs } from "@fern-api/init";
import { LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { askToLogin, login } from "@fern-api/login";
import {
    GENERATORS_CONFIGURATION_FILENAME,
    getFernDirectory,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { loadProject, Project } from "@fern-api/project-loader";
import { FernCliError } from "@fern-api/task-context";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CliContext } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { formatWorkspaces } from "./commands/format/formatWorkspaces";
import { generateFdrApiDefinitionForWorkspaces } from "./commands/generate-fdr/generateFdrApiDefinitionForWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateAPIWorkspaces } from "./commands/generate/generateAPIWorkspaces";
import { generateDocsWorkspace } from "./commands/generate/generateDocsWorkspace";
import { registerWorkspacesV1 } from "./commands/register/registerWorkspacesV1";
import { registerWorkspacesV2 } from "./commands/register/registerWorkspacesV2";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { writeDefinitionForWorkspaces } from "./commands/write-definition/writeDefinitionForWorkspaces";
import { FERN_CWD_ENV_VAR } from "./cwd";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";
import { isURL } from "./utils/isUrl";
import { loadOpenAPIFromUrl } from "./utils/loadOpenAPIFromUrl";

interface GlobalCliOptions {
    "log-level": LogLevel;
}

void runCli();

async function runCli() {
    const cliContext = new CliContext(process.stdout);

    const exit = async () => {
        await cliContext.exit();
    };
    process.on("SIGINT", async () => {
        cliContext.suppressUpgradeMessage();
        await exit();
    });

    try {
        const cwd = process.env[FERN_CWD_ENV_VAR];
        if (cwd != null) {
            process.chdir(cwd);
        }
        const versionOfCliToRun =
            process.env.FERN_NO_VERSION_REDIRECTION === "true"
                ? cliContext.environment.packageVersion
                : await getIntendedVersionOfCli(cliContext);
        if (cliContext.environment.packageVersion === versionOfCliToRun) {
            await tryRunCli(cliContext);
        } else {
            await rerunFernCliAtVersion({
                version: versionOfCliToRun,
                cliContext,
            });
        }
    } catch (error) {
        cliContext.instrumentPostHogEvent({
            command: process.argv.join(" "),
            properties: {
                failed: true,
                error,
            },
        });
        if (error instanceof FernCliError) {
            // thrower is responsible for logging, so we generally don't need to log here.
            cliContext.failWithoutThrowing();
        } else {
            cliContext.failWithoutThrowing("Failed.", error);
        }
    }

    await exit();
}

async function tryRunCli(cliContext: CliContext) {
    const cli: Argv<GlobalCliOptions> = yargs(hideBin(process.argv))
        .scriptName(cliContext.environment.cliName)
        .version(false)
        .fail((message, error: unknown, argv) => {
            // if error is null, it's a yargs validation error
            if (error == null) {
                argv.showHelp();
                cliContext.logger.error(message);
            }
        })
        .strict()
        .exitProcess(false)
        .command(
            "$0",
            false,
            (yargs) =>
                yargs
                    .option("version", {
                        describe: "Print current version",
                        alias: "v",
                    })
                    .version(false),
            (argv) => {
                if (argv.version != null) {
                    cliContext.logger.info(cliContext.environment.packageVersion);
                } else {
                    cli.showHelp();
                    cliContext.failAndThrow();
                }
            }
        )
        .option("log-level", {
            default: LogLevel.Info,
            choices: LOG_LEVELS,
        })
        .demandCommand()
        .recommendCommands();

    addInitCommand(cli, cliContext);
    addAddCommand(cli, cliContext);
    addGenerateCommand(cli, cliContext);
    addIrCommand(cli, cliContext);
    addFdrCommand(cli, cliContext);
    addValidateCommand(cli, cliContext);
    addRegisterCommand(cli, cliContext);
    addRegisterV2Command(cli, cliContext);
    addLoginCommand(cli, cliContext);
    addFormatCommand(cli, cliContext);
    addWriteDefinitionCommand(cli, cliContext);

    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage();
        },
    });

    cli.middleware(async (argv) => {
        cliContext.setLogLevel(argv["log-level"]);
        cliContext.logDebugInfo();
    });

    await cli.parse();
}

async function getIntendedVersionOfCli(cliContext: CliContext): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory != null) {
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        return projectConfig.version;
    }
    return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
}

function addInitCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "init",
        "Initialize a Fern API",
        (yargs) =>
            yargs
                .option("api", {
                    boolean: true,
                    description: "Initialize an api.",
                })
                .option("docs", {
                    boolean: true,
                    description: "Initialize a docs website.",
                })
                .option("organization", {
                    alias: "org",
                    type: "string",
                    description: "Organization name",
                })
                .option("openapi", {
                    type: "string",
                    description: "Filepath or url to an existing OpenAPI spec",
                })
                .option("organization", {
                    alias: "org",
                    type: "string",
                    description: "Organization name",
                }),
        async (argv) => {
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing("Cannot specify both --api and --docs. Please choose one.");
            } else if (argv.docs != null) {
                await cliContext.runTask(async (context) => {
                    await initializeDocs({
                        organization: argv.organization,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment }),
                        taskContext: context,
                    });
                });
            } else {
                let absoluteOpenApiPath: AbsoluteFilePath | undefined = undefined;
                if (argv.openapi != null) {
                    if (isURL(argv.openapi)) {
                        const tmpFilepath = await loadOpenAPIFromUrl({ url: argv.openapi, cliContext });
                        absoluteOpenApiPath = AbsoluteFilePath.of(tmpFilepath);
                    } else {
                        absoluteOpenApiPath = AbsoluteFilePath.of(resolve(cwd(), argv.openapi));
                    }
                    const pathExists = await doesPathExist(absoluteOpenApiPath);
                    if (!pathExists) {
                        cliContext.failAndThrow(`${absoluteOpenApiPath} does not exist`);
                    }
                }
                await cliContext.runTask(async (context) => {
                    await initializeAPI({
                        organization: argv.organization,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment }),
                        context,
                        openApiPath: absoluteOpenApiPath,
                    });
                });
            }
        }
    );
}

function addAddCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "add <generator>",
        `Add a code generator to ${GENERATORS_CONFIGURATION_FILENAME}`,
        (yargs) =>
            yargs
                .positional("generator", {
                    type: "string",
                    demandOption: true,
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                })
                .option("group", {
                    string: true,
                    description: "Add the generator to the specified group",
                }),
        async (argv) => {
            await addGeneratorToWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                }),
                generatorName: argv.generator,
                groupName: argv.group,
                cliContext,
            });
        }
    );
}

function addGenerateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        ["generate"],
        "Generate all generators in the specified group",
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description: "If multiple APIs, specify the name with --api <name>. Otherwise, just --api.",
                })
                .option("docs", {
                    boolean: true,
                    description: "If multiple docs sites, specify the name with --docs <name>. Otherwise just --docs.",
                })
                .option("group", {
                    type: "string",
                    description: "The group to generate",
                })
                .option("version", {
                    type: "string",
                    description: "The version for the generated packages",
                })
                .option("printZipUrl", {
                    boolean: true,
                    hidden: true,
                    default: false,
                })
                .option("local", {
                    boolean: true,
                    default: false,
                    description: "Run the generator(s) locally, using Docker",
                })
                .option("keepDocker", {
                    boolean: true,
                    default: false,
                    description: "Prevent auto-deletion of the Docker containers.",
                }),
        async (argv) => {
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing("Cannot specify both --api and --docs. Please choose one.");
            } else if (argv.api != null) {
                await generateAPIWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false,
                    }),
                    cliContext,
                    version: argv.version,
                    groupName: argv.group,
                    shouldLogS3Url: argv.printZipUrl,
                    keepDocker: argv.keepDocker,
                    useLocalDocker: argv.local,
                });
            } else if (argv.docs != null) {
                if (argv.group != null) {
                    cliContext.logger.warn("--group is ignored when generating docs");
                }
                if (argv.version != null) {
                    cliContext.logger.warn("--version is ignored when generating docs");
                }
                await generateDocsWorkspace({
                    project: await loadProjectAndRegisterWorkspacesWithContext(
                        cliContext,
                        {
                            commandLineApiWorkspace: undefined,
                            defaultToAllApiWorkspaces: true,
                        },
                        true
                    ),
                    cliContext,
                });
            } else {
                // default to loading api workspace to preserve legacy behavior
                await generateAPIWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false,
                    }),
                    cliContext,
                    version: argv.version,
                    groupName: argv.group,
                    shouldLogS3Url: argv.printZipUrl,
                    keepDocker: argv.keepDocker,
                    useLocalDocker: argv.local,
                });
            }
        }
    );
}

function addIrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "ir <path-to-output>",
        false, // hide from help message
        (yargs) =>
            yargs
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true,
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                })
                .option("version", {
                    string: true,
                    description: "The version of IR to produce",
                })
                .option("language", {
                    choices: Object.values(GenerationLanguage),
                    description: "Generate IR for a particular language",
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    default: new Array<string>(),
                    description: "Filter the IR for certain audiences",
                }),
        async (argv) => {
            await generateIrForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                }),
                irFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                generationLanguage: argv.language,
                audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" },
                version: argv.version,
            });
        }
    );
}

function addFdrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "fdr <path-to-output>",
        false, // hide from help message
        (yargs) =>
            yargs
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write FDR API definition",
                    demandOption: true,
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    default: new Array<string>(),
                    description: "Filter the FDR API definition for certain audiences",
                }),
        async (argv) => {
            await generateFdrApiDefinitionForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                }),
                outputFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" },
            });
        }
    );
}

function addRegisterCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        ["register"],
        false, // hide from help message
        (yargs) =>
            yargs
                .option("version", {
                    type: "string",
                    description: "The version for the registered api",
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                }),
        async (argv) => {
            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: argv.api,
                defaultToAllApiWorkspaces: false,
            });

            const token = await cliContext.runTask((context) => {
                return askToLogin(context);
            });
            await registerWorkspacesV1({
                project,
                cliContext,
                token,
                version: argv.version,
            });
        }
    );
}

function addRegisterV2Command(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        ["register-v2"],
        false, // hide from help message
        (yargs) =>
            yargs.option("api", {
                string: true,
                description: "Only run the command on the provided API",
            }),
        async (argv) => {
            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: argv.api,
                defaultToAllApiWorkspaces: false,
            });

            const token = await cliContext.runTask((context) => {
                return askToLogin(context);
            });
            await registerWorkspacesV2({
                project,
                cliContext,
                token,
            });
        }
    );
}

function addValidateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "check",
        "Validates your Fern Definition",
        (yargs) =>
            yargs.option("api", {
                string: true,
                description: "Only run the command on the provided API",
            }),
        async (argv) => {
            await validateWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true,
                }),
                cliContext,
            });
        }
    );
}

function addUpgradeCommand({
    cli,
    cliContext,
    onRun,
}: {
    cli: Argv<GlobalCliOptions>;
    cliContext: CliContext;
    onRun: () => void;
}) {
    cli.command(
        "upgrade",
        `Upgrades version in ${PROJECT_CONFIG_FILENAME}. Also upgrades generators in ${GENERATORS_CONFIGURATION_FILENAME} to their minimum-compatible versions.`,
        (yargs) =>
            yargs
                .option("rc", {
                    boolean: true,
                    hidden: true,
                    default: false,
                })
                .option("version", {
                    string: true,
                    description: "The version to upgrade to. Defaults to the latest release.",
                }),
        async (argv) => {
            await upgrade({
                cliContext,
                includePreReleases: argv.rc,
                targetVersion: argv.version,
            });
            onRun();
        }
    );
}

function addLoginCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "login",
        "Log in to Fern via GitHub",
        (yargs) =>
            yargs.option("device-code", {
                boolean: true,
                default: false,
                description: "Use device code authorization",
            }),
        async (argv) => {
            await cliContext.runTask(async (context) => {
                cliContext.instrumentPostHogEvent({
                    command: "fern login",
                });
                await login(context, { useDeviceCodeFlow: argv.deviceCode });
            });
        }
    );
}

function addFormatCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "format",
        "Formats your Fern Definition",
        (yargs) =>
            yargs
                .option("ci", {
                    boolean: true,
                    default: false,
                    description: "Fail with non-zero exit status if files are not formatted correctly.",
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern format",
            });
            await formatWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true,
                }),
                cliContext,
                shouldFix: !argv.ci,
            });
        }
    );
}

function addWriteDefinitionCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-definition",
        false, // hide from help message
        (yargs) =>
            yargs.option("api", {
                string: true,
                description: "Only run the command on the provided API",
            }),
        async (argv) => {
            await writeDefinitionForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true,
                }),
                cliContext,
            });
        }
    );
}

async function loadProjectAndRegisterWorkspacesWithContext(
    cliContext: CliContext,
    args: Omit<loadProject.Args, "context" | "cliName" | "cliVersion">,
    registerDocsWorkspace = false
): Promise<Project> {
    const context = cliContext.addTask().start();
    const project = await loadProject({
        ...args,
        cliName: cliContext.environment.cliName,
        cliVersion: cliContext.environment.packageVersion,
        context,
    });
    context.finish();

    if (registerDocsWorkspace && project.docsWorkspaces != null) {
        cliContext.registerWorkspaces([...project.apiWorkspaces, project.docsWorkspaces]);
    } else {
        cliContext.registerWorkspaces(project.apiWorkspaces);
    }

    return project;
}
