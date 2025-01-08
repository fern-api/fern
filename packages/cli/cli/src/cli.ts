#!/usr/bin/env node
import { RUNTIME } from "@fern-typescript/fetcher";
import getPort from "get-port";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import {
    GENERATORS_CONFIGURATION_FILENAME,
    PROJECT_CONFIG_FILENAME,
    generatorsYml,
    getFernDirectory,
    loadProjectConfig
} from "@fern-api/configuration-loader";
import { AbsoluteFilePath, cwd, doesPathExist, isURL, resolve } from "@fern-api/fs-utils";
import { initializeAPI, initializeDocs, initializeWithMintlify } from "@fern-api/init";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin, login } from "@fern-api/login";
import { FernCliError, LoggableFernCliError } from "@fern-api/task-context";

import { LoadOpenAPIStatus, loadOpenAPIFromUrl } from "../../init/src/utils/loadOpenApiFromUrl";
import { CliContext } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { GlobalCliOptions, loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons";
import { addGeneratorCommands, addGetOrganizationCommand } from "./cliV2";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { previewDocsWorkspace } from "./commands/docs-dev/devDocsWorkspace";
import { formatWorkspaces } from "./commands/format/formatWorkspaces";
import { generateDynamicIrForWorkspaces } from "./commands/generate-dynamic-ir/generateDynamicIrForWorkspaces";
import { generateFdrApiDefinitionForWorkspaces } from "./commands/generate-fdr/generateFdrApiDefinitionForWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateOpenApiToFdrApiDefinitionForWorkspaces } from "./commands/generate-openapi-fdr/generateOpenApiToFdrApiDefinitionForWorkspaces";
import { generateOpenAPIIrForWorkspaces } from "./commands/generate-openapi-ir/generateOpenAPIIrForWorkspaces";
import { writeOverridesForWorkspaces } from "./commands/generate-overrides/writeOverridesForWorkspaces";
import { GenerationMode, generateAPIWorkspaces } from "./commands/generate/generateAPIWorkspaces";
import { generateDocsWorkspace } from "./commands/generate/generateDocsWorkspace";
import { generateJsonschemaForWorkspaces } from "./commands/jsonschema/generateJsonschemaForWorkspace";
import { mockServer } from "./commands/mock/mockServer";
import { registerWorkspacesV1 } from "./commands/register/registerWorkspacesV1";
import { registerWorkspacesV2 } from "./commands/register/registerWorkspacesV2";
import { testOutput } from "./commands/test/testOutput";
import { generateToken } from "./commands/token/token";
import { updateApiSpec } from "./commands/upgrade/updateApiSpec";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { writeDefinitionForWorkspaces } from "./commands/write-definition/writeDefinitionForWorkspaces";
import { writeDocsDefinitionForProject } from "./commands/write-docs-definition/writeDocsDefinitionForProject";
import { FERN_CWD_ENV_VAR } from "./cwd";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";

void runCli();

const USE_NODE_18_OR_ABOVE_MESSAGE = "The Fern CLI requires Node 18+ or above.";

async function runCli() {
    const cliContext = new CliContext(process.stdout);

    const exit = async () => {
        await cliContext.exit();
    };

    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
        const { setGlobalDispatcher, Agent } = await import("undici");
        setGlobalDispatcher(new Agent({ connect: { timeout: 5_000 } }));
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    process.on("SIGINT", async () => {
        cliContext.suppressUpgradeMessage();
        await exit();
    });

    try {
        const cwd = process.env[FERN_CWD_ENV_VAR];
        if (cwd != null) {
            process.chdir(cwd);
        }
        const versionOfCliToRun = await getIntendedVersionOfCli(cliContext);
        if (cliContext.environment.packageVersion === versionOfCliToRun) {
            await tryRunCli(cliContext);
        } else {
            await rerunFernCliAtVersion({
                version: versionOfCliToRun,
                cliContext
            });
        }
    } catch (error) {
        await cliContext.instrumentPostHogEvent({
            command: process.argv.join(" "),
            properties: {
                failed: true,
                error
            }
        });
        if ((error as Error)?.message.includes("globalThis")) {
            cliContext.logger.error(USE_NODE_18_OR_ABOVE_MESSAGE);
            cliContext.failWithoutThrowing();
        } else if (error instanceof FernCliError) {
            // thrower is responsible for logging, so we generally don't need to log here.
            cliContext.failWithoutThrowing();
        } else if (error instanceof LoggableFernCliError) {
            cliContext.logger.error(`Failed. ${error.log}`);
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
                        alias: "v"
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
            choices: LOG_LEVELS
        })
        .demandCommand()
        .recommendCommands();

    addInitCommand(cli, cliContext);
    addTokenCommand(cli, cliContext);
    addAddCommand(cli, cliContext);
    addGenerateCommand(cli, cliContext);
    addIrCommand(cli, cliContext);
    addFdrCommand(cli, cliContext);
    addOpenAPIIrCommand(cli, cliContext);
    addDynamicIrCommand(cli, cliContext);
    addValidateCommand(cli, cliContext);
    addRegisterCommand(cli, cliContext);
    addRegisterV2Command(cli, cliContext);
    addLoginCommand(cli, cliContext);
    addFormatCommand(cli, cliContext);
    addWriteDefinitionCommand(cli, cliContext);
    addDocsPreviewCommand(cli, cliContext);
    addMockCommand(cli, cliContext);
    addWriteOverridesCommand(cli, cliContext);
    addTestCommand(cli, cliContext);
    addUpdateApiSpecCommand(cli, cliContext);
    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage();
        }
    });
    addGenerateJsonschemaCommand(cli, cliContext);
    addWriteDocsDefinitionCommand(cli, cliContext);

    // CLI V2 Sanctioned Commands
    addGetOrganizationCommand(cli, cliContext);
    addGeneratorCommands(cli, cliContext);

    cli.middleware(async (argv) => {
        cliContext.setLogLevel(argv["log-level"]);
        cliContext.logDebugInfo();
    });

    await cli.parse();
}

async function getIntendedVersionOfCli(cliContext: CliContext): Promise<string> {
    if (process.env.FERN_NO_VERSION_REDIRECTION === "true") {
        return cliContext.environment.packageVersion;
    }
    const fernDirectory = await getFernDirectory();
    if (fernDirectory != null) {
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        if (projectConfig.version === "*") {
            return cliContext.environment.packageVersion;
        }
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
                    description: "Initialize an api."
                })
                .option("docs", {
                    boolean: true,
                    description: "Initialize a docs website."
                })
                .option("organization", {
                    alias: "org",
                    type: "string",
                    description: "Organization name"
                })
                .option("openapi", {
                    type: "string",
                    description: "Filepath or url to an existing OpenAPI spec"
                })
                .option("mintlify", {
                    type: "string",
                    description: "Migrate docs from Mintlify"
                }),
        async (argv) => {
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing("Cannot specify both --api and --docs. Please choose one.");
            } else if (argv.docs != null) {
                await cliContext.runTask(async (context) => {
                    await initializeDocs({
                        organization: argv.organization,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment }),
                        taskContext: context
                    });
                });
            } else if (argv.mintlify != null) {
                await cliContext.runTask(async (taskContext) => {
                    await initializeWithMintlify({
                        pathToMintJson: argv.mintlify,
                        taskContext,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment })
                    });
                });
            } else {
                let absoluteOpenApiPath: AbsoluteFilePath | undefined = undefined;
                if (argv.openapi != null) {
                    if (isURL(argv.openapi)) {
                        const result = await loadOpenAPIFromUrl({ url: argv.openapi, logger: cliContext.logger });

                        if (result.status === LoadOpenAPIStatus.Failure) {
                            cliContext.failAndThrow(result.errorMessage);
                        }

                        const tmpFilepath = result.filePath;
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
                        openApiPath: absoluteOpenApiPath
                    });
                });
            }
        }
    );
}

function addTokenCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "token",
        "Generate a Fern Token",
        (yargs) =>
            yargs.option("organization", {
                alias: "org",
                type: "string",
                description: "The organization to create a token for. Defaults to the one in `fern.config.json`"
            }),
        async (argv) => {
            await cliContext.runTask(async (context) => {
                await generateToken({
                    orgId:
                        argv.organization ??
                        (
                            await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                                commandLineApiWorkspace: undefined,
                                defaultToAllApiWorkspaces: true
                            })
                        ).config.organization,
                    taskContext: context
                });
            });
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
                    demandOption: true
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("group", {
                    string: true,
                    description: "Add the generator to the specified group"
                }),
        async (argv) => {
            await addGeneratorToWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                generatorName: argv.generator,
                groupName: argv.group,
                cliContext
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
                    description: "If multiple APIs, specify the name with --api <name>. Otherwise, just --api."
                })
                .option("docs", {
                    string: true,
                    description: "If multiple docs sites, specify the name with --docs <name>. Otherwise just --docs."
                })
                .option("instance", {
                    string: true,
                    description: "The url for the instance of docs (e.g. --instance acme.docs.buildwithfern.com)"
                })
                .option("preview", {
                    boolean: true,
                    default: false,
                    description: "Whether to generate a preview link for the docs"
                })
                .option("group", {
                    type: "string",
                    description: "The group to generate"
                })
                .option("mode", {
                    choices: Object.values(GenerationMode),
                    description: "Defaults to the mode specified in generators.yml"
                })
                .option("version", {
                    type: "string",
                    description: "The version for the generated packages"
                })
                .option("printZipUrl", {
                    boolean: true,
                    hidden: true,
                    default: false
                })
                .option("local", {
                    boolean: true,
                    default: false,
                    description: "Run the generator(s) locally, using Docker"
                })
                .option("keepDocker", {
                    boolean: true,
                    default: false,
                    description: "Prevent auto-deletion of the Docker containers."
                })
                .option("force", {
                    boolean: true,
                    default: false,
                    description: "Ignore prompts to confirm generation, defaults to false"
                }),
        async (argv) => {
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing("Cannot specify both --api and --docs. Please choose one.");
            }
            if (argv.local && argv.preview) {
                return cliContext.failWithoutThrowing("The --local flag is incompatible with --preview.");
            }
            if (argv.api != null) {
                return await generateAPIWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    cliContext,
                    version: argv.version,
                    groupName: argv.group,
                    shouldLogS3Url: argv.printZipUrl,
                    keepDocker: argv.keepDocker,
                    useLocalDocker: argv.local,
                    preview: argv.preview,
                    mode: argv.mode,
                    force: argv.force
                });
            }
            if (argv.docs != null) {
                if (argv.group != null) {
                    cliContext.logger.warn("--group is ignored when generating docs");
                }
                if (argv.version != null) {
                    cliContext.logger.warn("--version is ignored when generating docs");
                }
                return await generateDocsWorkspace({
                    project: await loadProjectAndRegisterWorkspacesWithContext(
                        cliContext,
                        {
                            commandLineApiWorkspace: undefined,
                            defaultToAllApiWorkspaces: true
                        },
                        true
                    ),
                    cliContext,
                    instance: argv.instance,
                    preview: argv.preview
                });
            }
            // default to loading api workspace to preserve legacy behavior
            return await generateAPIWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                cliContext,
                version: argv.version,
                groupName: argv.group,
                shouldLogS3Url: argv.printZipUrl,
                keepDocker: argv.keepDocker,
                useLocalDocker: argv.local,
                preview: argv.preview,
                mode: argv.mode,
                force: argv.force
            });
        }
    );
}

function addIrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "ir <path-to-output>",
        "Generate IR (Intermediate Representation)",
        (yargs) =>
            yargs
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("version", {
                    string: true,
                    description: "The version of IR to produce"
                })
                .option("language", {
                    choices: Object.values(generatorsYml.GenerationLanguage),
                    description: "Generate IR for a particular language"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    default: new Array<string>(),
                    description: "Filter the IR for certain audiences"
                })
                .option("smart-casing", {
                    boolean: true,
                    description: "Whether to use smart casing"
                }),
        async (argv) => {
            await generateIrForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                    sdkLanguage: argv.language
                }),
                irFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                generationLanguage: argv.language,
                audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" },
                version: argv.version,
                keywords: undefined,
                smartCasing: argv.smartCasing ?? false,
                readme: undefined
            });
        }
    );
}

function addOpenAPIIrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "openapi-ir <path-to-output>",
        false,
        (yargs) =>
            yargs
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true
                })
                .option("language", {
                    choices: Object.values(generatorsYml.GenerationLanguage),
                    description: "Generate IR for a particular language"
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                }),
        async (argv) => {
            await generateOpenAPIIrForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                    sdkLanguage: argv.language
                }),
                irFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                sdkLanguage: argv.language
            });
        }
    );
}

function addDynamicIrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "dynamic-ir <path-to-output>",
        false,
        (yargs) =>
            yargs
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("version", {
                    string: true,
                    description: "The version of IR to produce"
                })
                .option("language", {
                    choices: Object.values(generatorsYml.GenerationLanguage),
                    description: "Generate IR for a particular language"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    default: new Array<string>(),
                    description: "Filter the IR for certain audiences"
                })
                .option("smart-casing", {
                    boolean: true,
                    description: "Whether to use smart casing"
                }),
        async (argv) => {
            await generateDynamicIrForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                    sdkLanguage: argv.language
                }),
                irFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                generationLanguage: argv.language,
                audiences: { type: "all" },
                version: argv.version,
                keywords: undefined,
                smartCasing: argv.smartCasing ?? false
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
                    demandOption: true
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    default: new Array<string>(),
                    description: "Filter the FDR API definition for certain audiences"
                })
                .option("v2", {
                    boolean: true,
                    description: "Use v2 format"
                }),
        async (argv) => {
            if (argv.v2) {
                await generateOpenApiToFdrApiDefinitionForWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    outputFilepath: resolve(cwd(), argv.pathToOutput),
                    cliContext
                });
            } else {
                await generateFdrApiDefinitionForWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    outputFilepath: resolve(cwd(), argv.pathToOutput),
                    cliContext,
                    audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" }
                });
            }
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
                    description: "The version for the registered api"
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                }),
        async (argv) => {
            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: argv.api,
                defaultToAllApiWorkspaces: false
            });

            const token = await cliContext.runTask((context) => {
                return askToLogin(context);
            });
            await registerWorkspacesV1({
                project,
                cliContext,
                token,
                version: argv.version
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
                description: "Only run the command on the provided API"
            }),
        async (argv) => {
            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: argv.api,
                defaultToAllApiWorkspaces: false
            });

            const token = await cliContext.runTask((context) => {
                return askToLogin(context);
            });
            await registerWorkspacesV2({
                project,
                cliContext,
                token
            });
        }
    );
}

function addValidateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "check",
        "Validates your Fern Definition. Logs errors.",
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("warnings", {
                    boolean: true,
                    description: "Log warnings in addition to errors.",
                    default: false
                }),
        async (argv) => {
            await validateWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true
                }),
                cliContext,
                logWarnings: argv.warnings
            });
        }
    );
}

function addUpgradeCommand({
    cli,
    cliContext,
    onRun
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
                    default: false
                })
                .option("version", {
                    string: true,
                    description: "The version to upgrade to. Defaults to the latest release."
                }),
        async (argv) => {
            await upgrade({
                cliContext,
                includePreReleases: argv.rc,
                targetVersion: argv.version
            });
            onRun();
        }
    );
}

function addUpdateApiSpecCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "api update",
        `Pulls the latest OpenAPI spec from the specified origin in ${GENERATORS_CONFIGURATION_FILENAME} and updates the local spec.`,
        (yargs) =>
            yargs.option("api", {
                string: true,
                description:
                    "The API to update the spec for. If not specified, all APIs with a declared origin will be updated."
            }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern api update"
            });
            await updateApiSpec({
                cliContext,
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true
                })
            });
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
                description: "Use device code authorization"
            }),
        async (argv) => {
            await cliContext.runTask(async (context) => {
                await cliContext.instrumentPostHogEvent({
                    command: "fern login"
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
                    description: "Fail with non-zero exit status if files are not formatted correctly."
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern format"
            });
            await formatWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true
                }),
                cliContext,
                shouldFix: !argv.ci
            });
        }
    );
}

function addTestCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "test",
        "Runs tests specified in --command, this spins up a mock server in the background that is terminated upon completion of the tests.",
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description: "The API to mock."
                })
                .option("command", {
                    string: true,
                    description: "The command to run to test your SDK."
                })
                .option("language", {
                    choices: Object.values(generatorsYml.GenerationLanguage),
                    description: "Run the tests configured to a specific language"
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern test"
            });
            await testOutput({
                cliContext,
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false,
                    nameOverride: ".mock",
                    sdkLanguage: argv.language
                }),
                testCommand: argv.command,
                generationLanguage: argv.language
            });
        }
    );
}

function addMockCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "mock",
        "Starts a mock server for an API.",
        (yargs) =>
            yargs
                .option("port", {
                    number: true,
                    description: "The port the server binds to."
                })
                .option("api", {
                    string: true,
                    description: "The API to mock."
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern mock"
            });
            await mockServer({
                cliContext,
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                port: argv.port
            });
        }
    );
}

function addWriteOverridesCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-overrides",
        "Generate a basic openapi overrides file.",
        (yargs) => [
            yargs.option("api", {
                string: true,
                description: "Only run the command on the provided API"
            }),
            yargs.option("exclude-models", {
                boolean: true,
                description:
                    "When generating the initial overrides, also stub the models (in addition to the endpoints)",
                default: false
            })
        ],
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern generate-overrides"
            });
            await writeOverridesForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api as string,
                    defaultToAllApiWorkspaces: true
                }),
                includeModels: !(argv.excludeModels as boolean),
                cliContext
            });
        }
    );
}

function addWriteDefinitionCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-definition",
        "Write underlying Fern Definition for OpenAPI specs and API Dependencies.",
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("language", {
                    choices: Object.values(generatorsYml.GenerationLanguage),
                    description: "Write the definition for a particular SDK language"
                })
                .option("preserve-schemas", {
                    string: true,
                    description: "Preserve potentially unsafe schema Ids in the generated fern definition"
                }),
        async (argv) => {
            const preserveSchemaIds = argv.preserveSchemas != null;
            await cliContext.instrumentPostHogEvent({
                command: "fern write-definition"
            });
            await writeDefinitionForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true,
                    sdkLanguage: argv.language,
                    preserveSchemaIds
                }),
                cliContext,
                sdkLanguage: argv.language,
                preserveSchemaIds
            });
        }
    );
}

function addDocsPreviewCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "docs dev",
        "Run a local development server to preview your docs",
        (yargs) =>
            yargs
                .option("port", {
                    number: true,
                    description: "Run the development server on the following port"
                })
                .option("bundle-path", {
                    string: true,
                    hidden: true,
                    description: "Path of the local docs bundle to use"
                }),
        async (argv) => {
            let port: number;
            if (argv.port != null) {
                port = argv.port;
            } else {
                port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010] });
            }
            const bundlePath: string | undefined = argv.bundlePath;
            await previewDocsWorkspace({
                loadProject: () =>
                    loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        defaultToAllApiWorkspaces: true,
                        commandLineApiWorkspace: undefined
                    }),
                cliContext,
                port,
                bundlePath
            });
        }
    );
}

function addGenerateJsonschemaCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "jsonschema <path-to-output>",
        "Generate JSON Schema for a specific type",
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .positional("path-to-output", {
                    type: "string",
                    description: "Path to write JSON Schema",
                    demandOption: true
                })
                .option("type", {
                    string: true,
                    demandOption: true,
                    description: "The type to generate JSON Schema for (e.g. 'MySchema' or 'mypackage.MySchema')"
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern jsonschema",
                properties: {
                    output: argv.output
                }
            });
            await generateJsonschemaForWorkspaces({
                typeLocator: argv.type,
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                jsonschemaFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext
            });
        }
    );
}

function addWriteDocsDefinitionCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-docs-definition <output-path>",
        false, // hide from help message
        (yargs) =>
            yargs.positional("output-path", {
                type: "string",
                description: "Path to write the docs definition",
                demandOption: true
            }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern write-docs-definition",
                properties: {
                    outputPath: argv.outputPath
                }
            });

            await writeDocsDefinitionForProject({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    defaultToAllApiWorkspaces: true,
                    commandLineApiWorkspace: undefined
                }),
                outputPath: resolve(cwd(), argv.outputPath),
                cliContext
            });
        }
    );
}
