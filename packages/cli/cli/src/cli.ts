import {
    fernConfigJson,
    generatorsYml,
    GENERATORS_CONFIGURATION_FILENAME,
    getFernDirectory,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration";
import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { initializeAPI, initializeDocs } from "@fern-api/init";
import { LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { askToLogin, login } from "@fern-api/login";
import { loadProject, Project } from "@fern-api/project-loader";
import { FernCliError, LoggableFernCliError } from "@fern-api/task-context";
import getPort from "get-port";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { loadOpenAPIFromUrl, LoadOpenAPIStatus } from "../../init/src/utils/loadOpenApiFromUrl";
import { CliContext } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { previewDocsWorkspace } from "./commands/docs-dev/devDocsWorkspace";
import { formatWorkspaces } from "./commands/format/formatWorkspaces";
import { generateFdrApiDefinitionForWorkspaces } from "./commands/generate-fdr/generateFdrApiDefinitionForWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateOpenAPIIrForWorkspaces } from "./commands/generate-openapi-ir/generateOpenAPIIrForWorkspaces";
import { writeOverridesForWorkspaces } from "./commands/generate-overrides/writeOverridesForWorkspaces";
import { generateAPIWorkspaces, GenerationMode } from "./commands/generate/generateAPIWorkspaces";
import { generateDocsWorkspace } from "./commands/generate/generateDocsWorkspace";
import { mockServer } from "./commands/mock/mockServer";
import { registerWorkspacesV1 } from "./commands/register/registerWorkspacesV1";
import { registerWorkspacesV2 } from "./commands/register/registerWorkspacesV2";
import { testOutput } from "./commands/test/testOutput";
import { generateToken } from "./commands/token/token";
import { updateApiSpec } from "./commands/upgrade/updateApiSpec";
import { upgrade } from "./commands/upgrade/upgrade";
import { upgradeGenerator } from "./commands/upgrade/upgradeGenerator";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { writeDefinitionForWorkspaces } from "./commands/write-definition/writeDefinitionForWorkspaces";
import { FERN_CWD_ENV_VAR } from "./cwd";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";
import { isURL } from "./utils/isUrl";

interface GlobalCliOptions {
    "log-level": LogLevel;
}

void runCli();

async function runCli() {
    const cliContext = new CliContext(process.stdout);

    const exit = async () => {
        await cliContext.exit();
    };
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
        cliContext.instrumentPostHogEvent({
            command: process.argv.join(" "),
            properties: {
                failed: true,
                error
            }
        });
        if (error instanceof FernCliError) {
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
    addUpgradeGeneratorCommand(cli, cliContext);
    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage();
        }
    });

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
            fernConfigJson.loadProjectConfig({ directory: fernDirectory, context })
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
                    mode: argv.mode
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
                mode: argv.mode
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
                smartCasing: false,
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
                }),
        async (argv) => {
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

function addUpgradeGeneratorCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "generator upgrade",
        `Upgrades the specified generator in ${GENERATORS_CONFIGURATION_FILENAME} to the latest stable version.`,
        (yargs) =>
            yargs
                .option("generator", {
                    string: true,
                    description: "The type of generator to upgrade, ex: `fern-typescript-node-sdk`."
                })
                .option("group", {
                    string: true,
                    description:
                        "The group in which the generator is located, if group is not specified, the all generators of the specified type will be upgraded."
                })
                .option("api", {
                    string: true,
                    description:
                        "The API to upgrade the generator for. If not specified, the generator will be upgraded for all APIs."
                })
                .option("include-major", {
                    boolean: true,
                    default: false,
                    description:
                        "Whether or not to include major versions within the upgrade. Defaults to false, meaning major versions will be skipped."
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern generator upgrade",
                properties: {
                    generator: argv.generator,
                    version: argv.version,
                    api: argv.api,
                    group: argv.group,
                    includeMajor: argv.includeMajor
                }
            });
            await upgradeGenerator({
                cliContext,
                generator: argv.generator,
                group: argv.group,
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true
                }),
                includeMajor: argv.includeMajor
            });
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
            cliContext.instrumentPostHogEvent({
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
                cliContext.instrumentPostHogEvent({
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
            cliContext.instrumentPostHogEvent({
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
            cliContext.instrumentPostHogEvent({
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
            cliContext.instrumentPostHogEvent({
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
            cliContext.instrumentPostHogEvent({
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
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern write-definition"
            });
            await writeDefinitionForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true,
                    sdkLanguage: argv.language
                }),
                cliContext,
                sdkLanguage: argv.language
            });
        }
    );
}

function addDocsPreviewCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "docs dev",
        "Run a local development server to preview your docs",
        (yargs) =>
            yargs.option("port", {
                number: true,
                description: "Run the development server on the following port"
            }),
        async (argv) => {
            let port: number;
            if (argv.port != null) {
                port = argv.port;
            } else {
                port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010] });
            }
            await previewDocsWorkspace({
                loadProject: () =>
                    loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        defaultToAllApiWorkspaces: true,
                        commandLineApiWorkspace: undefined
                    }),
                cliContext,
                port
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
        context
    });
    context.finish();

    if (registerDocsWorkspace && project.docsWorkspaces != null) {
        cliContext.registerWorkspaces([...project.apiWorkspaces, project.docsWorkspaces]);
    } else {
        cliContext.registerWorkspaces(project.apiWorkspaces);
    }

    return project;
}
