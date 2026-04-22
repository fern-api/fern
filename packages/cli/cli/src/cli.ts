#!/usr/bin/env node
import type { ReadStream, WriteStream } from "node:tty";
import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { CodeGeneratorRequestSchema, CodeGeneratorResponseSchema } from "@bufbuild/protobuf/wkt";
import { getOrCreateFernRunId } from "@fern-api/cli-telemetry";
import { runCliV2 } from "@fern-api/cli-v2";
import {
    correctIncorrectDockerOrg,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml,
    getFernDirectory,
    INCORRECT_DOCKER_ORG,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { getFiddleOrigin } from "@fern-api/core";
import {
    ContainerRunner,
    extractErrorMessage,
    haveSameNullishness,
    undefinedIfNullish,
    undefinedIfSomeNullish
} from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, doesPathExist, isURL, resolve } from "@fern-api/fs-utils";
import { formatBootstrapSummary, replayForget, replayInit, replayResolve, replayStatus } from "@fern-api/generator-cli";
import {
    initializeAPI,
    initializeDocs,
    initializeWithMintlify,
    initializeWithReadme,
    LoadOpenAPIStatus,
    loadOpenAPIFromUrl
} from "@fern-api/init";
import { LOG_LEVELS, LogLevel } from "@fern-api/logger";
import { askToLogin, login, logout } from "@fern-api/login";
import { protocGenFern } from "@fern-api/protoc-gen-fern";
import { CliError } from "@fern-api/task-context";
import getPort from "get-port";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CliContext } from "./cli-context/CliContext.js";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli.js";
import { GlobalCliOptions, loadProjectAndRegisterWorkspacesWithContext } from "./cliCommons.js";
import { addGeneratorCommands, addGetOrganizationCommand } from "./cliV2.js";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces.js";
import { executeAutomationsGenerate } from "./commands/automations/generate/executeAutomationsGenerate.js";
import { listPreviewGroups } from "./commands/automations/listPreviewGroups.js";
import { diff } from "./commands/diff/diff.js";
import { previewDocsWorkspace } from "./commands/docs-dev/devDocsWorkspace.js";
import { docsDiff } from "./commands/docs-diff/docsDiff.js";
import { generateLibraryDocs } from "./commands/docs-md-generate/generateLibraryDocs.js";
import { deleteDocsPreview } from "./commands/docs-preview/deleteDocsPreview.js";
import { listDocsPreview } from "./commands/docs-preview/listDocsPreview.js";
import { downgrade } from "./commands/downgrade/downgrade.js";
import { generateOpenAPIForWorkspaces } from "./commands/export/generateOpenAPIForWorkspaces.js";
import { formatWorkspaces } from "./commands/format/formatWorkspaces.js";
import { parseGeneratorArg } from "./commands/generate/filterGenerators.js";
import { GenerationMode, generateAPIWorkspaces } from "./commands/generate/generateAPIWorkspaces.js";
import { generateDocsWorkspace } from "./commands/generate/generateDocsWorkspace.js";
import { generateDynamicIrForWorkspaces } from "./commands/generate-dynamic-ir/generateDynamicIrForWorkspaces.js";
import { generateFdrApiDefinitionForWorkspaces } from "./commands/generate-fdr/generateFdrApiDefinitionForWorkspaces.js";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces.js";
import { generateOpenApiToFdrApiDefinitionForWorkspaces } from "./commands/generate-openapi-fdr/generateOpenApiToFdrApiDefinitionForWorkspaces.js";
import { generateOpenAPIIrForWorkspaces } from "./commands/generate-openapi-ir/generateOpenAPIIrForWorkspaces.js";
import { compareOpenAPISpecs } from "./commands/generate-overrides/compareOpenAPISpecs.js";
import { writeOverridesForWorkspaces } from "./commands/generate-overrides/writeOverridesForWorkspaces.js";
import { installDependencies } from "./commands/install-dependencies/installDependencies.js";
import { generateJsonschemaForWorkspaces } from "./commands/jsonschema/generateJsonschemaForWorkspace.js";
import { mergeOpenAPIWithOverrides } from "./commands/merge/mergeOpenAPIWithOverrides.js";
import { mockServer } from "./commands/mock/mockServer.js";
import { registerWorkspacesV1 } from "./commands/register/registerWorkspacesV1.js";
import { registerWorkspacesV2 } from "./commands/register/registerWorkspacesV2.js";
import { sdkDiffCommand } from "./commands/sdk-diff/sdkDiffCommand.js";
import type { SdkPreviewResult, SdkPreviewSuccess } from "./commands/sdk-preview/sdkPreview.js";
import { sdkPreview } from "./commands/sdk-preview/sdkPreview.js";
import { selfUpdate } from "./commands/self-update/selfUpdate.js";
import { testOutput } from "./commands/test/testOutput.js";
import { generateToken } from "./commands/token/token.js";
import { updateApiSpec } from "./commands/upgrade/updateApiSpec.js";
import { upgrade } from "./commands/upgrade/upgrade.js";
import { validateDocsBrokenLinks } from "./commands/validate/validateDocsBrokenLinks.js";
import { logMdxValidationResults, validateMdxFiles } from "./commands/validate/validateMdx.js";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces.js";
import { writeDefinitionForWorkspaces } from "./commands/write-definition/writeDefinitionForWorkspaces.js";
import { writeDocsDefinitionForProject } from "./commands/write-docs-definition/writeDocsDefinitionForProject.js";
import { writeTranslationForProject } from "./commands/write-translation/writeTranslationForProject.js";
import { FERN_CWD_ENV_VAR } from "./cwd.js";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion.js";
import { resolveGroupGithubConfig } from "./resolveGroupGithubConfig.js";
import { RUNTIME } from "./runtime.js";

void runCli();

async function runCli() {
    // Shell completion must be fast and side-effect-free. When the shell
    // invokes `fern --get-yargs-completions …` we skip version redirection
    // (network call) and suppress upgrade notices so TAB never produces
    // extraneous output.
    const isCompletion = process.argv.includes("--get-yargs-completions");

    if (!isCompletion) {
        getOrCreateFernRunId();
    }

    const isLocal = process.argv.includes("--local");
    const cliContext = await CliContext.create(process.stdout, process.stderr, { isLocal });

    if (isCompletion) {
        cliContext.suppressUpgradeMessage();
    }

    const exit = async () => {
        await cliContext.exit();
    };

    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
        const { setGlobalDispatcher, Agent } = await import("undici");
        setGlobalDispatcher(
            new Agent({ connect: { timeout: 2147483647 }, bodyTimeout: 0, headersTimeout: 2147483647 })
        );
    }

    if (process.env.HTTP_PROXY != null) {
        const { setGlobalDispatcher, ProxyAgent } = await import("undici");
        const proxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
        setGlobalDispatcher(proxyAgent);
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

        // During completion, skip version redirection to avoid a slow network
        // round-trip that blocks every TAB press.
        if (isCompletion) {
            await tryRunCli(cliContext);
        } else {
            const versionOfCliToRun = await getIntendedVersionOfCli(cliContext);
            if (cliContext.environment.packageVersion === versionOfCliToRun) {
                await tryRunCli(cliContext);
            } else {
                await rerunFernCliAtVersion({
                    version: versionOfCliToRun,
                    cliContext
                });
            }
        }
    } catch (error) {
        cliContext.failWithoutThrowing(undefined, error);
    }

    await exit();
}

async function tryRunCli(cliContext: CliContext) {
    const args = hideBin(process.argv);

    if (args[0] === "completion") {
        yargs(args)
            .scriptName(cliContext.environment.cliName)
            .completion("completion", "Generate shell completion script")
            .parse();
        return;
    }

    const cli: Argv<GlobalCliOptions> = yargs(args)
        .scriptName(cliContext.environment.cliName)
        .version(false)
        .completion("completion", "Generate shell completion script")
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
                    cliContext.failAndThrow(undefined, undefined, { code: CliError.Code.ConfigError });
                }
            }
        )
        .option("log-level", {
            default: LogLevel.Info,
            choices: LOG_LEVELS
        })
        .demandCommand()
        .recommendCommands();

    addDiffCommand(cli, cliContext);
    addSdkDiffCommand(cli, cliContext);
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
    addLogoutCommand(cli, cliContext);
    addFormatCommand(cli, cliContext);
    addWriteDefinitionCommand(cli, cliContext);
    addDocsCommand(cli, cliContext);
    addMockCommand(cli, cliContext);
    addOverridesCommand(cli, cliContext);
    addWriteOverridesCommand(cli, cliContext); // Deprecated: use `fern overrides write` instead
    addTestCommand(cli, cliContext);
    addApiCommand(cli, cliContext);
    addSelfUpdateCommand(cli, cliContext);
    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage();
        }
    });
    addDowngradeCommand(cli, cliContext);
    addGenerateJsonschemaCommand(cli, cliContext);
    addWriteDocsDefinitionCommand(cli, cliContext);
    addWriteTranslationCommand(cli, cliContext);
    addExportCommand(cli, cliContext);
    addReplayCommand(cli, cliContext);
    addBetaCommand(cli, cliContext);

    addSdkCommand(cli, cliContext);
    addAutomationsCommand(cli, cliContext);

    // CLI V2 Sanctioned Commands
    addGetOrganizationCommand(cli, cliContext);
    addGeneratorCommands(cli, cliContext);

    addProtocGenFernCommand(cli, cliContext);
    addInstallDependenciesCommand(cli, cliContext);

    cli.middleware(async (argv) => {
        cliContext.setLogLevel(argv["log-level"]);
        if ((argv as Record<string, unknown>).json === true) {
            cliContext.enableJsonMode();
        }
        cliContext.logFernVersionDebug();
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
        if (projectConfig.version === "latest") {
            return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
        }
        return projectConfig.version;
    }
    return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
}

async function getOrganization(cliContext: CliContext): Promise<string | undefined> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory != null) {
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        return projectConfig.organization;
    }
    return undefined;
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
                .option("fern-definition", {
                    boolean: true,
                    description: "Initialize with a sample Fern Definition instead of an OpenAPI spec"
                })
                .option("mintlify", {
                    type: "string",
                    description: "Migrate docs from Mintlify provided a path to a mint.json file"
                })
                .option("readme", {
                    type: "string",
                    description: "Migrate docs from Readme provided a URL to a Readme generated docs site"
                }),
        async (argv) => {
            if (argv.organization == null) {
                const projectConfig = await getOrganization(cliContext);
                if (projectConfig != null) {
                    argv.organization = projectConfig;
                } else {
                    argv.organization = await cliContext.getInput({ message: "Please enter your organization" });
                }
            }
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing(
                    "Cannot specify both --api and --docs. Please choose one.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            } else if (argv.readme != null && argv.mintlify != null) {
                return cliContext.failWithoutThrowing(
                    "Cannot specify both --readme and --mintlify. Please choose one.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            } else if (argv.openapi != null && argv["fern-definition"] === true) {
                return cliContext.failWithoutThrowing(
                    "Cannot specify both --openapi and --fern-definition. Please choose one.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            } else if (argv.readme != null) {
                await cliContext.runTask(async (context) => {
                    await initializeWithReadme({
                        readmeUrl: argv.readme,
                        organization: argv.organization ?? "fern",
                        taskContext: context,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment })
                    });
                });
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
                        organization: argv.organization ?? "fern",
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
                            cliContext.failAndThrow(result.errorMessage, undefined, {
                                code: CliError.Code.NetworkError
                            });
                        }

                        const tmpFilepath = result.filePath;
                        absoluteOpenApiPath = AbsoluteFilePath.of(tmpFilepath);
                    } else {
                        absoluteOpenApiPath = AbsoluteFilePath.of(resolve(cwd(), argv.openapi));
                    }
                    const pathExists = await doesPathExist(absoluteOpenApiPath);
                    if (!pathExists) {
                        cliContext.failAndThrow(`${absoluteOpenApiPath} does not exist`, undefined, {
                            code: CliError.Code.ConfigError
                        });
                    }
                }
                await cliContext.runTask(async (context) => {
                    await initializeAPI({
                        organization: argv.organization,
                        versionOfCli: await getLatestVersionOfCli({ cliEnvironment: cliContext.environment }),
                        context,
                        openApiPath: absoluteOpenApiPath,
                        useFernDefinition: argv["fern-definition"] === true
                    });
                });
            }
        }
    );
}

function addDiffCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "diff",
        "Diff two versions of an API",
        (yargs) =>
            yargs
                .option("from", {
                    string: true,
                    demandOption: true,
                    description: "The previous version of the API"
                })
                .option("to", {
                    string: true,
                    demandOption: true,
                    description: "The next version of the API"
                })
                .option("from-version", {
                    string: true,
                    description: "The previous version of the API (e.g. 1.1.0)"
                })
                .option("from-generator-version", {
                    string: true,
                    description: "The previous version of the generator (e.g. 1.1.0)"
                })
                .option("to-generator-version", {
                    string: true,
                    description: "The next version of the generator (e.g. 1.1.0)"
                })
                .option("quiet", {
                    boolean: true,
                    default: false,
                    alias: "q",
                    description: "Whether to suppress output written to stderr"
                })
                .middleware((argv) => {
                    if (!haveSameNullishness(argv.fromGeneratorVersion, argv.toGeneratorVersion)) {
                        throw new CliError({
                            message:
                                "Both --from-generator-version and --to-generator-version must be provided together, or neither should be provided",
                            code: CliError.Code.ValidationError
                        });
                    }
                }),
        async (argv) => {
            // Large IR files (>2 GB) can exceed Node's default heap limit.
            // If either file exceeds 1 GB and we haven't already re-spawned,
            // re-spawn with --max-old-space-size so that the full IR can be
            // parsed and validated in memory.
            if (process.env.__FERN_DIFF_HEAP_RESPAWNED == null) {
                const fs = await import("node:fs");
                const ONE_GB = 1024 * 1024 * 1024;
                const fromPath = resolve(cwd(), argv.from);
                const toPath = resolve(cwd(), argv.to);
                const fromSize = fs.statSync(fromPath, { throwIfNoEntry: false })?.size ?? 0;
                const toSize = fs.statSync(toPath, { throwIfNoEntry: false })?.size ?? 0;

                if (fromSize > ONE_GB || toSize > ONE_GB) {
                    const { spawnSync } = await import("child_process");
                    const HEAP_SIZE_MB = 8192;
                    const child = spawnSync(
                        process.execPath,
                        [`--max-old-space-size=${HEAP_SIZE_MB}`, ...process.execArgv, ...process.argv.slice(1)],
                        {
                            env: { ...process.env, __FERN_DIFF_HEAP_RESPAWNED: "1" },
                            stdio: "inherit"
                        }
                    );
                    await cliContext.exit({ code: child.status ?? 1 });
                    return;
                }
            }

            const fromVersion = undefinedIfNullish(argv.fromVersion);
            const generatorVersions = undefinedIfSomeNullish({
                from: argv.fromGeneratorVersion,
                to: argv.toGeneratorVersion
            });

            const result = await diff({
                context: cliContext,
                from: argv.from,
                to: argv.to,
                fromVersion,
                generatorVersions
            });
            if (fromVersion != null) {
                // If the user specified the --from-version flag, we write the full
                // JSON object to stdout.
                const { errors, ...rest } = result;
                cliContext.logger.info(JSON.stringify(rest));
            }
            if (!argv.quiet && result.errors.length > 0) {
                cliContext.stderr.info(result.errors.join("\n"));
            }
            const code = result.bump === "major" ? 1 : 0;
            await cliContext.exit({ code });
        }
    );
}

function addSdkDiffCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "sdk-diff <from-dir> <to-dir>",
        false,
        (yargs) =>
            yargs
                .positional("from-dir", {
                    type: "string",
                    demandOption: true,
                    description: "Path to the directory containing the previous version of the SDK"
                })
                .positional("to-dir", {
                    type: "string",
                    demandOption: true,
                    description: "Path to the directory containing the next version of the SDK"
                })
                .option("json", {
                    boolean: true,
                    default: false,
                    description: "Output result as JSON"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern sdk-diff"
            });

            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            const result = await sdkDiffCommand({
                context: cliContext,
                project,
                fromDir: argv.fromDir,
                toDir: argv.toDir
            });

            if (argv.json) {
                // Output as JSON
                cliContext.logger.info(JSON.stringify(result, null, 2));
            } else {
                // Output as formatted text
                cliContext.logger.info("\n" + result.message);
                cliContext.logger.info(`\nVersion Bump: ${result.version_bump}`);
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
            const generatorName = warnAndCorrectIncorrectDockerOrg(argv.generator, cliContext);
            await addGeneratorToWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                generatorName,
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
                .option("id", {
                    type: "string",
                    description:
                        "A stable identifier for the preview. Reusing the same ID overwrites the previous preview, keeping the URL stable."
                })
                .option("group", {
                    type: "string",
                    array: true,
                    description:
                        "The group to generate. Pass --group multiple times to generate for several groups at once."
                })
                .option("generator", {
                    type: "string",
                    description: "The name of a specific generator to run"
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
                })
                .option("broken-links", {
                    boolean: true,
                    description: "Log a warning if there are broken links in the docs.",
                    default: false
                })
                .option("strict-broken-links", {
                    boolean: true,
                    description:
                        "Throw an error (rather than logging a warning) if there are broken links in the docs.",
                    default: false
                })
                .option("disable-snippets", {
                    boolean: true,
                    description: "Disable snippets in docs generation.",
                    default: false
                })
                .option("runner", {
                    choices: ["docker", "podman"],
                    description: "Choose the container runtime to use for local generation.",
                    default: undefined
                })
                .option("lfs-override", {
                    type: "string",
                    hidden: true,
                    description: "Override output mode to local-file-system with the specified path"
                })
                .option("disable-dynamic-snippets", {
                    boolean: true,
                    description: "Disable dynamic SDK snippets in docs generation",
                    default: false
                })
                .option("prompt", {
                    boolean: true,
                    description: "Prompt for confirmation before generating (use --no-prompt to skip)",
                    default: true
                })
                .option("skip-upload", {
                    boolean: true,
                    description: "Skip asset upload step and generate fake links for preview",
                    default: false
                })
                .option("fernignore", {
                    type: "string",
                    description:
                        "Path to a custom .fernignore file. For generators with local file system output, the .fernignore in the output directory is used automatically if not specified"
                })
                .option("dynamic-ir-only", {
                    boolean: true,
                    description:
                        "Only upload dynamic IR for specified version, skip SDK generation (remote generation only)",
                    default: false
                })
                .option("output", {
                    type: "string",
                    description: "Custom output directory (currently only supported with --preview for SDK generation)"
                })
                .option("replay", {
                    boolean: true,
                    default: true,
                    hidden: true,
                    description: "Run replay after generation (use --no-replay to skip)"
                })
                .option("retry-rate-limited", {
                    boolean: true,
                    default: false,
                    description:
                        "Automatically retry with exponential backoff when receiving 429 Too Many Requests responses"
                })
                .option("require-env-vars", {
                    boolean: true,
                    default: true,
                    description:
                        "Require all referenced environment variables to be defined (use --no-require-env-vars to substitute empty strings for missing variables)"
                })
                .option("skip-fernignore", {
                    boolean: true,
                    default: false,
                    description:
                        "Skip the .fernignore file and generate all files. For remote generation, uploads an empty .fernignore. For local generation, skips reading .fernignore from the output directory."
                })
                .option("skip-if-no-diff", {
                    boolean: true,
                    default: false,
                    description:
                        "Skip opening a PR / pushing when the generated output has no diff from the base branch."
                }),
        async (argv) => {
            if (argv.api != null && argv.docs != null) {
                return cliContext.failWithoutThrowing(
                    "Cannot specify both --api and --docs. Please choose one.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv.id != null && !argv.preview) {
                return cliContext.failWithoutThrowing("The --id flag can only be used with --preview.", undefined, {
                    code: CliError.Code.ConfigError
                });
            }
            if (argv.id != null && argv.docs == null) {
                return cliContext.failWithoutThrowing("The --id flag can only be used with --docs.", undefined, {
                    code: CliError.Code.ConfigError
                });
            }
            if (argv.skipUpload && !argv.preview) {
                return cliContext.failWithoutThrowing(
                    "The --skip-upload flag can only be used with --preview.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv.skipUpload && argv.docs == null) {
                return cliContext.failWithoutThrowing(
                    "The --skip-upload flag can only be used with --docs.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv.fernignore != null && (argv.local || argv.runner != null)) {
                return cliContext.failWithoutThrowing(
                    "The --fernignore flag is not supported with local generation (--local or --runner). It can only be used with remote generation.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv["skip-fernignore"] && argv.fernignore != null) {
                return cliContext.failWithoutThrowing(
                    "The --skip-fernignore and --fernignore flags cannot be used together.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv["dynamic-ir-only"] && (argv.local || argv.runner != null)) {
                return cliContext.failWithoutThrowing(
                    "The --dynamic-ir-only flag is not supported with local generation (--local or --runner). It can only be used with remote generation.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv["dynamic-ir-only"] && argv.version == null) {
                return cliContext.failWithoutThrowing(
                    "The --dynamic-ir-only flag requires a version to be specified with --version.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv["dynamic-ir-only"] && argv.docs != null) {
                return cliContext.failWithoutThrowing(
                    "The --dynamic-ir-only flag can only be used for API generation, not docs generation.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv.output != null && !argv.preview) {
                return cliContext.failWithoutThrowing(
                    "The --output flag currently only works with --preview.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            if (argv.output != null && argv.docs != null) {
                return cliContext.failWithoutThrowing(
                    "The --output flag is not supported for docs generation.",
                    undefined,
                    { code: CliError.Code.ConfigError }
                );
            }
            const correctedGeneratorFilter =
                argv.generator != null ? warnAndCorrectIncorrectDockerOrg(argv.generator, cliContext) : undefined;
            const { generatorName, generatorIndex } = parseGeneratorArg(correctedGeneratorFilter);
            if (argv.api != null) {
                return await generateAPIWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    cliContext,
                    version: argv.version,
                    groupNames: argv.group,
                    generatorName,
                    generatorIndex,
                    shouldLogS3Url: argv.printZipUrl,
                    keepDocker: argv.keepDocker,
                    useLocalDocker: argv.local || argv.runner != null,
                    preview: argv.preview,
                    mode: argv.mode,
                    force: argv.force,
                    runner: argv.runner as ContainerRunner,
                    inspect: false,
                    lfsOverride: argv.lfsOverride,
                    fernignorePath: argv.fernignore,
                    skipFernignore: argv["skip-fernignore"],
                    dynamicIrOnly: argv["dynamic-ir-only"],
                    outputDir: argv.output,
                    noReplay: !argv.replay,
                    retryRateLimited: argv["retry-rate-limited"],
                    requireEnvVars: argv["require-env-vars"],
                    skipIfNoDiff: argv["skip-if-no-diff"]
                });
            }
            if (argv.docs != null) {
                if (argv.group != null && argv.group.length > 0) {
                    cliContext.logger.warn("--group is ignored when generating docs");
                }
                if (argv.generator != null) {
                    cliContext.logger.warn("--generator is ignored when generating docs");
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
                    preview: argv.preview,
                    previewId: argv.id,
                    force: argv.force,
                    brokenLinks: argv.brokenLinks,
                    strictBrokenLinks: argv.strictBrokenLinks,
                    disableTemplates: argv.disableSnippets,
                    noPrompt: !argv.prompt,
                    skipUpload: argv.skipUpload
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
                groupNames: argv.group,
                generatorName,
                generatorIndex,
                shouldLogS3Url: argv.printZipUrl,
                keepDocker: argv.keepDocker,
                useLocalDocker: argv.local,
                preview: argv.preview,
                mode: argv.mode,
                force: argv.force,
                runner: argv.runner as ContainerRunner,
                inspect: false,
                lfsOverride: argv.lfsOverride,
                fernignorePath: argv.fernignore,
                skipFernignore: argv["skip-fernignore"],
                dynamicIrOnly: argv["dynamic-ir-only"],
                outputDir: argv.output,
                noReplay: !argv.replay,
                retryRateLimited: argv["retry-rate-limited"],
                requireEnvVars: argv["require-env-vars"],
                skipIfNoDiff: argv["skip-if-no-diff"]
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
                    default: [] as string[],
                    description: "Filter the IR for certain audiences"
                })
                .option("smart-casing", {
                    boolean: true,
                    description: "Whether to use smart casing"
                })
                .option("from-openapi", {
                    boolean: true,
                    description: "Whether to use the new parser and go directly from OpenAPI to IR",
                    default: false
                })
                .option("disable-examples", {
                    boolean: true,
                    description: "Whether to disable automatic example generation in the IR",
                    default: false
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
                readme: undefined,
                directFromOpenapi: argv.fromOpenapi,
                disableExamples: argv.disableExamples
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
                    default: [] as string[],
                    description: "Filter the IR for certain audiences"
                })
                .option("smart-casing", {
                    boolean: true,
                    description: "Whether to use smart casing"
                })
                .option("disable-examples", {
                    boolean: true,
                    description: "Whether to suppress examples from being included in the IR"
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
                smartCasing: argv.smartCasing ?? false,
                disableDynamicExamples: argv.disableExamples ?? false
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
                    default: [] as string[],
                    description: "Filter the FDR API definition for certain audiences"
                })
                .option("v2", {
                    boolean: true,
                    description: "Use v2 format"
                })
                .option("from-openapi", {
                    boolean: true,
                    description: "Whether to use the new parser and go directly from OpenAPI to IR",
                    default: false
                }),
        async (argv) => {
            if (argv.v2) {
                await generateOpenApiToFdrApiDefinitionForWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    outputFilepath: resolve(cwd(), argv.pathToOutput),
                    directFromOpenapi: false,
                    cliContext,
                    audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" }
                });
            } else if (argv.fromOpenapi) {
                await generateOpenApiToFdrApiDefinitionForWorkspaces({
                    project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                        commandLineApiWorkspace: argv.api,
                        defaultToAllApiWorkspaces: false
                    }),
                    outputFilepath: resolve(cwd(), argv.pathToOutput),
                    directFromOpenapi: true,
                    cliContext,
                    audiences: argv.audience.length > 0 ? { type: "select", audiences: argv.audience } : { type: "all" }
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
                })
                .option("broken-links", {
                    boolean: true,
                    description: "Log a warning if there are broken links in the docs.",
                    default: false,
                    deprecated: "Use docs.yml `check.rules.broken-links: warn` instead."
                })
                .option("strict-broken-links", {
                    boolean: true,
                    description:
                        "Throw an error (rather than logging a warning) if there are broken links in the docs.",
                    default: false,
                    deprecated: "Use docs.yml `check.rules.broken-links: error` instead."
                })
                .option("local", {
                    boolean: true,
                    description: "Run validation locally without sending data to Fern API.",
                    default: false
                })
                .option("from-openapi", {
                    boolean: true,
                    description: "Whether to use the new parser and go directly from OpenAPI to IR",
                    default: false
                })
                .option("json", {
                    boolean: true,
                    description: "Output results as JSON to stdout.",
                    default: false
                }),
        async (argv) => {
            await validateWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: true
                }),
                cliContext,
                logWarnings: argv.warnings,
                brokenLinks: argv.brokenLinks,
                errorOnBrokenLinks: argv.strictBrokenLinks,
                directFromOpenapi: argv.fromOpenapi
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
        `Upgrades Fern CLI version in ${PROJECT_CONFIG_FILENAME}`,
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
                })
                .option("to", {
                    string: true,
                    hidden: true
                })
                .option("from", {
                    string: true,
                    description:
                        "The version to migrate from. Use this to manually run migrations when upgrading from an older CLI version."
                })
                .option("from-git", {
                    boolean: true,
                    hidden: true
                })
                .option("yes", {
                    alias: "y",
                    boolean: true,
                    default: false,
                    description: "Automatically answer yes to migration prompts."
                }),
        async (argv) => {
            await upgrade({
                cliContext,
                includePreReleases: argv.rc,
                targetVersion: argv.to ?? argv.version,
                fromVersion: argv.from,
                fromGit: argv["from-git"],
                yes: argv.yes
            });
            onRun();
        }
    );
}

function addDowngradeCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "downgrade <version>",
        `Downgrades Fern CLI version in ${PROJECT_CONFIG_FILENAME}`,
        (yargs) =>
            yargs.positional("version", {
                type: "string",
                description: "The version to downgrade to",
                demandOption: true
            }),
        async (argv) => {
            await downgrade({
                cliContext,
                targetVersion: argv.version
            });
        }
    );
}

function addApiCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("api", "Commands for managing your API specs", (yargs) => {
        addUpdateApiSpecCommand(yargs, cliContext);
        addEnrichCommand(yargs, cliContext);
        return yargs;
    });
}

function addUpdateApiSpecCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "update",
        `Pulls the latest OpenAPI spec from the specified origin in ${GENERATORS_CONFIGURATION_FILENAME} and updates the local spec.`,
        (yargs) =>
            yargs
                .option("api", {
                    string: true,
                    description:
                        "The API to update the spec for. If not specified, all APIs with a declared origin will be updated."
                })
                .option("indent", {
                    type: "number",
                    description: "Indentation width in spaces (default: 2)",
                    default: 2
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
                }),
                indent: argv.indent
            });
        }
    );
}

function addSelfUpdateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "self-update [version]",
        "Updates the globally installed Fern CLI to the latest version or the specified version",
        (yargs) =>
            yargs
                .positional("version", {
                    type: "string",
                    description: "The version to update to (e.g., 0.85.0, 10). Defaults to latest."
                })
                .option("dry-run", {
                    type: "boolean",
                    description: "Show what would be executed without actually running the update",
                    default: false
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern self-update"
            });
            await selfUpdate({
                cliContext,
                version: argv.version,
                dryRun: argv.dryRun
            });
        }
    );
}

function addLoginCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "login",
        "Log in to Fern via GitHub",
        (yargs) =>
            yargs
                .option("device-code", {
                    boolean: true,
                    default: false,
                    description: "Use device code authorization"
                })
                .option("email", {
                    string: true,
                    description: "Log in via enterprise SSO using your email address"
                }),
        async (argv) => {
            await cliContext.runTask(async (context) => {
                cliContext.instrumentPostHogEvent({
                    command: "fern login"
                });
                await login(context, { useDeviceCodeFlow: argv.deviceCode, email: argv.email });
            });
        }
    );
}

function addLogoutCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "logout",
        "Log out of Fern",
        (yargs) => yargs,
        async () => {
            await cliContext.runTask(async (context) => {
                cliContext.instrumentPostHogEvent({
                    command: "fern logout"
                });
                await logout(context);
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
        false,
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
        false,
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

function addOverridesCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("overrides", "Commands for managing OpenAPI overrides", (yargs) => {
        addOverridesCompareCommand(yargs, cliContext);
        addOverridesWriteCommand(yargs, cliContext);
        return yargs;
    });
}

function addOverridesCompareCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "compare <original> <modified>",
        "Compare two OpenAPI specs and generate an overrides file from the differences.",
        (yargs) =>
            yargs
                .positional("original", {
                    type: "string",
                    description: "Path to the original OpenAPI spec",
                    demandOption: true
                })
                .positional("modified", {
                    type: "string",
                    description: "Path to the modified OpenAPI spec",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    description: "Path to write the overrides file (defaults to <original>-overrides.yml)"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern overrides compare"
            });
            const originalPath = resolve(cwd(), argv.original as string);
            const modifiedPath = resolve(cwd(), argv.modified as string);
            const outputPath = argv.output != null ? resolve(cwd(), argv.output) : undefined;
            await compareOpenAPISpecs({
                originalPath: AbsoluteFilePath.of(originalPath),
                modifiedPath: AbsoluteFilePath.of(modifiedPath),
                outputPath: outputPath != null ? AbsoluteFilePath.of(outputPath) : undefined,
                cliContext
            });
        }
    );
}

function addOverridesWriteCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write",
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
                command: "fern overrides write"
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

/**
 * @deprecated Use `fern overrides write` instead
 */
function addWriteOverridesCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-overrides",
        false, // Hidden from help - deprecated in favor of `fern overrides write`
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
            cliContext.logger.warn("The 'write-overrides' command is deprecated. Use 'fern overrides write' instead.");
            cliContext.instrumentPostHogEvent({
                command: "fern write-overrides"
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
            cliContext.instrumentPostHogEvent({
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

function addDocsCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("docs", "Commands for managing your docs", (yargs) => {
        addDocsDevCommand(yargs, cliContext);
        addDocsBrokenLinksCommand(yargs, cliContext);
        addDocsPreviewCommand(yargs, cliContext);
        addDocsDiffCommand(yargs, cliContext);
        addDocsMdCommand(yargs, cliContext);
        return yargs;
    });
}

function addDocsMdCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    // Hidden command - pass false as description to hide from help output
    // This command is in beta and not yet ready for general use
    cli.command("md", false, (yargs) => {
        addDocsMdGenerateCommand(yargs, cliContext);
        addDocsMdCheckCommand(yargs, cliContext);
        return yargs;
    });
}

function addDocsMdGenerateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "generate",
        "[Beta] Generate MDX documentation from library source code. Requires 'libraries' config in docs.yml.",
        (yargs) =>
            yargs.option("library", {
                type: "string",
                description: "Name of a specific library defined in docs.yml to generate docs for"
            }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern docs md generate"
            });

            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            await generateLibraryDocs({
                project,
                cliContext,
                library: argv.library
            });
        }
    );
}

function addDocsDiffCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "diff <preview-url> <files..>",
        "Generate visual diffs between preview and production docs pages",
        (yargs) =>
            yargs
                .positional("preview-url", {
                    type: "string",
                    description: "The preview deployment URL (e.g. acme-preview-abc123.docs.buildwithfern.com)",
                    demandOption: true
                })
                .positional("files", {
                    type: "string",
                    array: true,
                    description: "File paths to generate diffs for (e.g. fern/pages/intro.mdx)",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    default: ".fern/diff",
                    description: "Output directory for diff images"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern docs diff"
            });

            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            const result = await docsDiff({
                cliContext,
                project,
                previewUrl: argv.previewUrl,
                files: argv.files ?? [],
                outputDir: argv.output
            });

            cliContext.logger.info(JSON.stringify(result, null, 2));
        }
    );
}

function addDocsPreviewCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("preview", "Commands for managing preview deployments", (yargs) => {
        addDocsPreviewListCommand(yargs, cliContext);
        addDocsPreviewDeleteCommand(yargs, cliContext);
        return yargs;
    });
}

function addDocsPreviewListCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "list",
        "List all preview deployments",
        (yargs) =>
            yargs
                .option("limit", {
                    type: "number",
                    description: "Maximum number of preview deployments to display"
                })
                .option("page", {
                    type: "number",
                    description: "Page number for pagination (starts at 1)"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern docs preview list"
            });
            await listDocsPreview({
                cliContext,
                limit: argv.limit,
                page: argv.page
            });
        }
    );
}

function addDocsPreviewDeleteCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "delete [target]",
        "Delete a preview deployment",
        (yargs) =>
            yargs
                .positional("target", {
                    type: "string",
                    description: "A preview URL or ID (auto-detected)"
                })
                .option("url", {
                    type: "string",
                    description:
                        "The FQDN of the preview deployment to delete (e.g. acme-preview-abc123.docs.buildwithfern.com)"
                })
                .option("id", {
                    type: "string",
                    description: "The preview ID to delete. Resolves the URL from the organization in fern.config.json."
                })
                .check((argv) => {
                    const sources = [argv.target, argv.url, argv.id].filter(Boolean);
                    if (sources.length === 0) {
                        throw new CliError({
                            message: "Must provide a preview URL or --id.",
                            code: CliError.Code.ConfigError
                        });
                    }
                    if (sources.length > 1) {
                        throw new CliError({
                            message: "Provide only one of: [target], --url, or --id.",
                            code: CliError.Code.ConfigError
                        });
                    }
                    return true;
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern docs preview delete"
            });
            await deleteDocsPreview({
                cliContext,
                target: argv.target,
                previewUrl: argv.url,
                previewId: argv.id
            });
        }
    );
}

function addDocsDevCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "dev",
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
                })
                .option("broken-links", {
                    boolean: true,
                    default: false,
                    description: "Check for broken links in your docs"
                })
                .option("beta", {
                    boolean: true,
                    default: false,
                    description: "Run the app router development server"
                })
                .option("legacy", {
                    boolean: true,
                    default: false,
                    description: "Run the legacy development server"
                })
                .option("backend-port", {
                    number: true,
                    description: "Run the development backend server on the following port"
                })
                .option("force-download", {
                    boolean: true,
                    default: false,
                    description: "Force re-download of the docs preview bundle by deleting the cached bundle"
                }),
        async (argv) => {
            if (argv.beta) {
                cliContext.logger.warn(
                    "--beta flag now accesses the same functionality as default and will be deprecated in a future release"
                );
            }

            let port: number;
            let backendPort: number;
            try {
                if (argv.port != null) {
                    port = argv.port;
                } else {
                    port = await getPort({
                        port: [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010]
                    });
                }

                if (argv.backendPort != null) {
                    backendPort = argv.backendPort;
                } else {
                    backendPort = await getPort({
                        port: [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011]
                    });
                }
            } catch (error) {
                throw new CliError({
                    message: `Failed to find an available port: ${error instanceof Error ? error.message : String(error)}`,
                    code: CliError.Code.EnvironmentError
                });
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
                bundlePath,
                brokenLinks: argv.brokenLinks,
                legacyPreview: argv.legacy,
                backendPort,
                forceDownload: argv.forceDownload
            });
        }
    );
}

function addDocsBrokenLinksCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "broken-links",
        "Check for broken links in your docs",
        (yargs) =>
            yargs.option("strict", { boolean: true, default: false, description: "Fail with non-zero exit status" }),
        async (argv) => {
            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });
            await validateDocsBrokenLinks({
                project,
                cliContext,
                errorOnBrokenLinks: argv.strict
            });
        }
    );
}

function addDocsMdCheckCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "check",
        "Validate MDX syntax in your docs",
        () => {
            // No additional options for this command
        },
        async () => {
            cliContext.instrumentPostHogEvent({
                command: "fern docs md check"
            });

            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            if (project.docsWorkspaces == null) {
                cliContext.failAndThrow("No docs workspace found", undefined, { code: CliError.Code.ConfigError });
            }

            const docsWorkspace = project.docsWorkspaces;
            let hasErrors = false;
            await cliContext.runTaskForWorkspace(docsWorkspace, async (context) => {
                const { errors, totalFiles } = await validateMdxFiles({
                    workspace: docsWorkspace,
                    context
                });

                logMdxValidationResults({ errors, totalFiles, context });

                if (errors.length > 0) {
                    hasErrors = true;
                }
            });

            if (hasErrors) {
                cliContext.failWithoutThrowing(undefined, undefined, { code: CliError.Code.ValidationError });
            }
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
            cliContext.instrumentPostHogEvent({
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
            cliContext.instrumentPostHogEvent({
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

function addWriteTranslationCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "write-translation",
        "Generate translation directories for each language defined in docs.yml",
        (yargs) =>
            yargs.option("stub", {
                alias: "s",
                type: "boolean",
                default: false,
                description: "Return content as-is without calling the translation service"
            }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern write-translation"
            });

            await writeTranslationForProject({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    defaultToAllApiWorkspaces: true,
                    commandLineApiWorkspace: undefined
                }),
                cliContext,
                stub: argv.stub
            });
        }
    );
}

function addExportCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "export <output-path>",
        "Export your API to an OpenAPI spec",
        (yargs) =>
            yargs
                .positional("output-path", {
                    type: "string",
                    description: "Path to write the OpenAPI spec",
                    demandOption: true
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API"
                })
                .option("indent", {
                    type: "number",
                    description: "Indentation width in spaces (default: 2)",
                    default: 2
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern export",
                properties: {
                    outputPath: argv.outputPath
                }
            });

            await generateOpenAPIForWorkspaces({
                project: await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                    commandLineApiWorkspace: argv.api,
                    defaultToAllApiWorkspaces: false
                }),
                cliContext,
                outputPath: resolve(cwd(), argv.outputPath),
                indent: argv.indent
            });
        }
    );
}

function addEnrichCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "enrich <openapi>",
        "Merge an AI examples overrides file into an OpenAPI spec",
        (yargs) =>
            yargs
                .positional("openapi", {
                    type: "string",
                    description: "Path to the OpenAPI spec",
                    demandOption: true
                })
                .option("file", {
                    type: "string",
                    alias: "f",
                    description: "Path to the overrides file (e.g. ai_examples_overrides.yml)",
                    demandOption: true
                })
                .option("output", {
                    type: "string",
                    alias: "o",
                    description: "Path to write the enriched output file",
                    demandOption: true
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern api enrich"
            });
            const openapiPath = resolve(cwd(), argv.openapi as string);
            const overridesPath = resolve(cwd(), argv.file);
            const outputPath = resolve(cwd(), argv.output);
            await mergeOpenAPIWithOverrides({
                openapiPath: AbsoluteFilePath.of(openapiPath),
                overridesPath: AbsoluteFilePath.of(overridesPath),
                outputPath: AbsoluteFilePath.of(outputPath),
                cliContext
            });
        }
    );
}

function addSdkCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("sdk", false, (yargs) => {
        addSdkPreviewCommand(yargs, cliContext);
        return yargs.demandCommand();
    });
}

function addAutomationsCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command("automations", false, (yargs) => {
        addAutomationsGenerateCommand(yargs, cliContext);
        addAutomationsPreviewCommand(yargs, cliContext);
        return yargs.demandCommand();
    });
}

/**
 * `fern automations preview`
 *
 * Runs SDK preview for all previewable generator groups in the project.
 * Discovers eligible groups using the same criteria as `listPreviewGroups`,
 * then calls `sdkPreview` for each one, aggregating results.
 *
 * A generator is considered previewable when:
 * - It is a supported TypeScript/npm generator (fern-typescript-sdk, node-sdk, browser-sdk)
 * - `automation.preview` is not false in generators.yml
 *
 * One preview is run per unique (groupName, apiName) pair. Errors are
 * isolated per group — a failure in one group does not block the others.
 *
 * JSON output format (--json):
 *   {
 *     "results": [
 *       {
 *         "groupName": "ts-sdk",
 *         "apiName": null,
 *         "status": "success",
 *         "org": "acme",
 *         "previews": [{ "preview_id": "...", "install": "...", ... }]
 *       },
 *       { "groupName": "node", "apiName": "bar", "status": "error", "error": "..." }
 *     ]
 *   }
 *
 * Example GitHub Actions usage:
 *   - run: fern automations preview --json --push-diff
 *     env:
 *       FERN_TOKEN: ${{ secrets.FERN_TOKEN }}
 */
interface AutomationsPreviewGroupResult {
    groupName: string;
    apiName: string | null;
    status: "success" | "error";
    org?: string;
    previews?: SdkPreviewSuccess["previews"];
    error?: string;
}

function addAutomationsPreviewCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "preview",
        false, // hidden
        (yargs) =>
            yargs
                .option("group", {
                    type: "string",
                    description:
                        "Filter to a specific generator group (e.g. 'sdk'). Omit to preview all eligible groups."
                })
                .option("json", {
                    boolean: true,
                    default: false,
                    description: "Output results as JSON (for machine consumption)."
                })
                .option("push-diff", {
                    boolean: true,
                    default: false,
                    description:
                        "Push a preview diff branch (fern-preview-{version}) to each SDK repo " +
                        "in addition to publishing to the preview registry."
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern automations preview"
            });

            const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            const groups = listPreviewGroups({
                workspaces: project.apiWorkspaces,
                groupFilter: argv.group
            });

            if (groups.length === 0) {
                if (argv.json) {
                    process.stdout.write(JSON.stringify({ results: [] }, null, 2) + "\n");
                } else {
                    cliContext.logger.info("No eligible generator groups found for preview.");
                }
                return;
            }

            cliContext.logger.info(
                `Found ${groups.length} previewable group(s): ${groups.map((g) => g.groupName).join(", ")}`
            );

            const results: AutomationsPreviewGroupResult[] = [];

            for (const group of groups) {
                const apiLabel = group.apiName != null ? ` (api: ${group.apiName})` : "";
                cliContext.logger.info(`Running preview for ${group.groupName}${apiLabel}...`);

                try {
                    const result = await sdkPreview({
                        cliContext,
                        groupName: group.groupName,
                        generatorFilter: undefined,
                        apiName: group.apiName ?? undefined,
                        output: undefined,
                        local: false,
                        pushDiff: argv["push-diff"]
                    });

                    if (result.status === "success") {
                        results.push({
                            groupName: group.groupName,
                            apiName: group.apiName,
                            status: "success",
                            org: result.org,
                            previews: result.previews
                        });
                    } else {
                        results.push({
                            groupName: group.groupName,
                            apiName: group.apiName,
                            status: "error",
                            error: result.message
                        });
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    cliContext.logger.warn(`Preview failed for group '${group.groupName}': ${message}`);
                    results.push({
                        groupName: group.groupName,
                        apiName: group.apiName,
                        status: "error",
                        error: message
                    });
                }
            }

            if (argv.json) {
                process.stdout.write(JSON.stringify({ results }, null, 2) + "\n");
            } else {
                for (const groupResult of results) {
                    if (groupResult.status === "success" && groupResult.previews != null) {
                        for (const preview of groupResult.previews) {
                            if (preview.install) {
                                cliContext.logger.info(`${groupResult.groupName}: ${preview.install}`);
                            }
                        }
                    } else if (groupResult.status === "error") {
                        cliContext.logger.warn(`${groupResult.groupName}: ${groupResult.error}`);
                    }
                }
            }

            const hasErrors = results.some((r) => r.status === "error");
            if (hasErrors) {
                process.exitCode = 1;
            }
        }
    );
}

/**
 * `fern automations generate`
 *
 * Runs SDK generation for every eligible generator across every API × group in the project,
 * aggregating per-generator outcomes into a single summary. Designed to be invoked as one
 * step inside the `fern-api/fern-generate` GitHub Action.
 *
 * Targeting (all optional — omit to fan out across everything):
 *   - `--api`       Restrict to one API in a multi-API repo.
 *   - `--group`     Restrict to one generator group. `default-group` in generators.yml is
 *                   intentionally ignored — automation fan-out means "all groups" by default.
 *   - `--generator` Restrict to one generator, by 0-based index or name. Indexes reject with
 *                   an error if the targeted generator opts out of automation; names silently
 *                   filter opted-out matches (a name can match multiple generators).
 *
 * Opt-out: generators with `automations.generate: false`, `autorelease: false`, or local-file-system
 * output are silently skipped during fan-out (they never appear in the summary).
 *
 * Automation-mode behaviors (inherited from `automationMode: true`, driven by Fiddle):
 *   - Separate PRs: each invocation creates its own PR, preserving 1:1 spec→SDK mapping.
 *   - No-diff detection: identical-to-default-branch output skips the PR/push.
 *   - Breaking-change detection: MAJOR bumps (via `--version AUTO`) surface in the PR body
 *     and disable automerge.
 *   - Automerge (with `--auto-merge`): enables GitHub automerge; SDK-repo branch protection
 *     still governs actual merge.
 *
 * Reporting:
 *   - stdout: one `X succeeded · Y skipped · Z failed` line at the end.
 *   - Markdown summary: auto-appended to `$GITHUB_STEP_SUMMARY` when that env var is set
 *     (GitHub Actions sets it; any other CI can opt in by setting it to a writable path).
 *   - `--json-file-output <path>`: CI-neutral JSON file with per-generator status, version, and error.
 *   - Exit code: non-zero iff any generator fails. Siblings keep running past a failure.
 *
 * Environment:
 *   - FERN_TOKEN: required. Authenticates with Fern services.
 *   - FERN_RUN_ID: optional. Correlation ID for cross-repo tracing. Typically set to
 *     `${{ github.run_id }}-${{ strategy.job-index }}` in GitHub Actions.
 *
 * Examples:
 *   # Fan out across every eligible generator in the project.
 *   fern automations generate --version AUTO --auto-merge
 *
 *   # Restrict to one API and emit a JSON summary for a non-GitHub CI.
 *   fern automations generate --api payments --version AUTO --json-file-output ./fern-report.json
 */
function addAutomationsGenerateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "generate",
        false, // hidden
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description:
                        "Filter to a specific API in a multi-API repo (e.g. 'foo' for fern/apis/foo/). " +
                        "Omit to fan out across every API in the project."
                })
                .option("group", {
                    type: "string",
                    description:
                        "Filter to a specific generator group (e.g. 'sdk'). " +
                        "Omit to fan out across every group. The default-group field in generators.yml " +
                        "is intentionally ignored."
                })
                .option("generator", {
                    type: "string",
                    description:
                        "Target a specific generator by 0-based index (e.g. '0', '1') or by name. " +
                        "When targeting an opted-out generator by index, the command rejects with an " +
                        "error rather than silently skipping. Omit to fan out across every eligible " +
                        "generator in the selected APIs and groups."
                })
                .option("version", {
                    type: "string",
                    description:
                        "Version for generated packages. Use 'AUTO' for AI-based semantic versioning " +
                        "that analyzes the diff and determines MAJOR/MINOR/PATCH automatically."
                })
                .option("auto-merge", {
                    boolean: true,
                    default: false,
                    description:
                        "Enable GitHub automerge on generated PRs. Automerge is skipped when " +
                        "breaking changes (MAJOR bump) are detected, regardless of this flag."
                })
                .option("json-file-output", {
                    type: "string",
                    description:
                        "Write a JSON summary of per-generator results to the given path. " +
                        "CI-neutral companion to the markdown summary auto-written to $GITHUB_STEP_SUMMARY."
                }),
        async (argv) => {
            await executeAutomationsGenerate({
                cliContext,
                options: {
                    api: argv.api,
                    group: argv.group,
                    generator: argv.generator,
                    version: argv.version,
                    autoMerge: argv["auto-merge"],
                    jsonOutputPath: argv["json-file-output"]
                }
            });
        }
    );
}

function addSdkPreviewCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "preview",
        false, // hidden
        (yargs) =>
            yargs
                .option("group", {
                    type: "string",
                    description: "The generator group to preview"
                })
                .option("generator", {
                    type: "string",
                    description: "The name of a specific generator to run"
                })
                .option("api", {
                    type: "string",
                    description: "Only run the command on the provided API"
                })
                .option("json", {
                    boolean: true,
                    default: false,
                    description: "Output result as JSON"
                })
                .option("output", {
                    type: "array",
                    string: true,
                    description:
                        "Output targets: filesystem paths and/or registry URLs. " +
                        "When omitted, publishes to the default preview registry via remote generation. " +
                        "Examples: --output ./out (disk only), --output https://registry.example.com (registry only), " +
                        "--output ./out --output https://registry.example.com (both)."
                })
                .option("local", {
                    boolean: true,
                    default: false,
                    description:
                        "Run generation locally via Docker instead of remotely through Fiddle. " +
                        "Requires Docker to be installed. " +
                        "Can be combined with --output for local disk output."
                })
                .option("push-diff", {
                    boolean: true,
                    default: false,
                    description:
                        "Push a preview diff branch (fern-preview-{version}) to the SDK repo " +
                        "in addition to publishing to the preview registry. " +
                        "Requires the generator to have github output configuration " +
                        "and the Fern GitHub App installed on the target repo. " +
                        "Cannot be combined with --local."
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern sdk preview"
            });
            const generatorFilter =
                argv.generator != null ? warnAndCorrectIncorrectDockerOrg(argv.generator, cliContext) : undefined;
            const result = await sdkPreview({
                cliContext,
                groupName: argv.group,
                generatorFilter,
                apiName: argv.api,
                output: argv.output,
                local: argv.local,
                pushDiff: argv.pushDiff
            });
            writeSdkPreviewOutput({ result, json: argv.json, cliContext });
        }
    );
}

function writeSdkPreviewOutput({
    result,
    json,
    cliContext
}: {
    result: SdkPreviewResult;
    json: boolean;
    cliContext: CliContext;
}): void {
    if (json) {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
        if (result.status === "error") {
            process.exitCode = 1;
        }
        return;
    }

    if (result.status === "error") {
        return cliContext.failAndThrow(
            result.message,
            undefined,
            result.code != null ? { code: result.code } : undefined
        );
    }

    if (result.previews.length > 0) {
        cliContext.logger.info("");
        const hasRegistry = result.previews.some((p) => p.registry_url !== "");
        if (hasRegistry) {
            cliContext.logger.info(
                `Published ${result.previews.length} preview package${result.previews.length > 1 ? "s" : ""}:`
            );
            for (const preview of result.previews) {
                cliContext.logger.info("");
                cliContext.logger.info(`  ${preview.package_name}@${preview.version}`);
                cliContext.logger.info(`  Install: ${preview.install}`);
                if (preview.diff_url) {
                    cliContext.logger.info(`  Diff: ${preview.diff_url}`);
                }
                if (preview.output_path) {
                    cliContext.logger.info(`  Output: ${preview.output_path}`);
                }
            }
        } else {
            cliContext.logger.info(
                `Generated ${result.previews.length} preview SDK${result.previews.length > 1 ? "s" : ""}:`
            );
            for (const preview of result.previews) {
                cliContext.logger.info("");
                cliContext.logger.info(`  ${preview.package_name}@${preview.version}`);
                if (preview.diff_url) {
                    cliContext.logger.info(`  Diff: ${preview.diff_url}`);
                }
                cliContext.logger.info(`  Output: ${preview.output_path}`);
            }
        }
    }
}

function addBetaCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "beta",
        false, // Hidden from --help while in-development.
        (yargs) =>
            yargs.help(false).version(false).strict(false).parserConfiguration({
                "unknown-options-as-args": true
            }),
        async (argv) => {
            try {
                // Pass through all arguments after "v2" to the v2 CLI
                const v2Args = argv._.slice(1).map(String);
                await runCliV2(v2Args);
            } catch (error) {
                cliContext.logger.error("CLI v2 failed:", String(error));
                cliContext.failWithoutThrowing(undefined, error, { code: CliError.Code.InternalError });
            }
        }
    );
}

function addProtocGenFernCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "protoc-gen-fern",
        false,
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        (yargs) => {},
        async () => {
            const plugin = protocGenFern;
            const data = await readBytes(process.stdin);
            const req = fromBinary(CodeGeneratorRequestSchema, data);
            const res = plugin.run(req);
            await writeBytes(process.stdout, toBinary(CodeGeneratorResponseSchema, res));
            process.exit(0);
        }
    );
}

function readBytes(stream: ReadStream): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
        stream.on("end", () => {
            resolve(new Uint8Array(Buffer.concat(chunks)));
        });
        stream.on("error", (err) => {
            reject(err);
        });
    });
}

/**
 * Corrects the incorrect "fern-api/" Docker org prefix to "fernapi/" and logs a warning.
 * Used for CLI arguments that accept generator names.
 */
function warnAndCorrectIncorrectDockerOrg(generatorName: string, cliContext: CliContext): string {
    const corrected = correctIncorrectDockerOrg(generatorName);
    if (corrected !== generatorName) {
        cliContext.logger.warn(
            `"${generatorName}" is not a valid generator name. Using "${corrected}" instead — the Docker org is "fernapi", not "${INCORRECT_DOCKER_ORG}".`
        );
    }
    return corrected;
}

function writeBytes(stream: WriteStream, data: Uint8Array): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        stream.write(data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function addInstallDependenciesCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "install-dependencies",
        false, // hidden from --help
        // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
        (yargs) => {},
        async () => {
            await installDependencies({ cliContext });
        }
    );
}

function addReplayCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command({
        command: "replay",
        describe: false, // hidden from --help
        builder: (yargs) => {
            addReplayInitCommand(yargs, cliContext);
            addReplayResolveCommand(yargs, cliContext);
            addReplayStatusCommand(yargs, cliContext);
            addReplayForgetCommand(yargs, cliContext);
            return yargs;
        },
        handler: () => {
            // parent command — subcommands handle execution
        }
    });
}

function addReplayInitCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "init",
        false, // hidden from --help
        (yargs) =>
            yargs
                .option("group", {
                    type: "string",
                    description: "Generator group from generators.yml (reads github config automatically)"
                })
                .option("api", {
                    type: "string",
                    description: "If multiple APIs, specify which API workspace to use"
                })
                .option("github", {
                    type: "string",
                    description: "GitHub repository (e.g., owner/repo). Overrides --group config."
                })
                .option("token", {
                    type: "string",
                    description: "GitHub token. Overrides --group config."
                })
                .option("dry-run", {
                    type: "boolean",
                    default: false,
                    description: "Report what would happen without making changes"
                })
                .option("max-commits", {
                    type: "number",
                    description: "Max commits to scan for generation history"
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Overwrite existing lockfile if Replay is already initialized"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern replay init"
            });

            let githubRepo: string | undefined = argv.github;
            let token: string | undefined = argv.token;

            // If --group is provided, load config from generators.yml
            if (argv.group != null) {
                const resolved = await resolveGroupGithubConfig(cliContext, argv.group, argv.api);
                // Use group config as defaults, allow --github/--token to override
                githubRepo = githubRepo ?? resolved.githubRepo;
                token = token ?? resolved.token;
            }

            if (githubRepo == null) {
                return cliContext.failAndThrow(
                    "Missing required github config. Either use --group to read from generators.yml, or provide --github directly.",
                    undefined,
                    {
                        code: CliError.Code.ConfigError
                    }
                );
            }

            if (token == null) {
                cliContext.logger.warn(
                    "No GitHub token found. Clone may fail for private repos. Set GITHUB_TOKEN or pass --token."
                );
            }

            cliContext.logger.info(`Initializing Replay for: ${githubRepo}`);
            if (argv.dryRun) {
                cliContext.logger.info("(dry-run mode)");
            }

            try {
                const result = await replayInit({
                    githubRepo,
                    token,
                    dryRun: argv.dryRun,
                    maxCommitsToScan: argv.maxCommits,
                    force: argv.force
                });

                const logEntries = formatBootstrapSummary(result);
                for (const entry of logEntries) {
                    if (entry.level === "warn") {
                        cliContext.logger.warn(entry.message);
                    } else {
                        cliContext.logger.info(entry.message);
                    }
                }

                if (!result.bootstrap.generationCommit) {
                    return;
                }

                if (argv.dryRun) {
                    cliContext.logger.info("\nDry run complete. No changes made.");
                    return;
                }

                if (result.lockfileContent == null) {
                    return cliContext.failAndThrow("Bootstrap succeeded but lockfile content is missing.", undefined, {
                        code: CliError.Code.InternalError
                    });
                }

                // Send lockfile to Fiddle for server-side PR creation
                const fernToken = await cliContext.runTask((context) => askToLogin(context));

                const { owner, repo } = parseOwnerRepo(githubRepo);
                const fiddleOrigin = getFiddleOrigin();

                const response = await fetch(`${fiddleOrigin}/api/remote-gen/replay/init`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${fernToken.value}`
                    },
                    body: JSON.stringify({
                        owner,
                        repo,
                        lockfileContents: result.lockfileContent,
                        fernignoreEntries: result.fernignoreEntries,
                        prBody: result.prBody
                    })
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        return cliContext.failAndThrow(
                            "The Fern GitHub App is not installed on this repository. " +
                                "Install it at https://github.com/apps/fern-api to enable server-side PR creation.",
                            undefined,
                            { code: CliError.Code.ConfigError }
                        );
                    }
                    const body = await response.text();
                    return cliContext.failAndThrow(`Failed to create PR via Fern: ${body}`, undefined, {
                        code: CliError.Code.NetworkError
                    });
                }

                const data = (await response.json()) as { prUrl: string };
                cliContext.logger.info(`\nPR created: ${data.prUrl}`);
                cliContext.logger.info("Merge the PR to enable Replay for this repository.");
            } catch (error) {
                cliContext.failAndThrow(`Failed to initialize Replay: ${extractErrorMessage(error)}`, error, {
                    code: CliError.Code.NetworkError
                });
            }
        }
    );
}

function addReplayResolveCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "resolve [directory]",
        false, // hidden from --help
        (yargs) =>
            yargs
                .positional("directory", {
                    type: "string",
                    default: ".",
                    description: "SDK directory containing .fern/replay.lock"
                })
                .option("no-check-markers", {
                    type: "boolean",
                    default: false,
                    description: "Skip checking for remaining conflict markers before committing"
                }),
        async (argv) => {
            cliContext.instrumentPostHogEvent({
                command: "fern replay resolve"
            });

            const outputDir = resolve(cwd(), argv.directory ?? ".");

            try {
                const result = await replayResolve({
                    outputDir,
                    checkMarkers: !argv.noCheckMarkers
                });

                switch (result.phase) {
                    case "applied":
                        cliContext.logger.info(
                            `Applied ${result.patchesApplied} unresolved patch(es) to your working tree.`
                        );
                        if (result.unresolvedFiles && result.unresolvedFiles.length > 0) {
                            cliContext.logger.info(`\nFiles with conflict markers:`);
                            for (const file of result.unresolvedFiles) {
                                cliContext.logger.info(`  ${file}`);
                            }
                            cliContext.logger.info(
                                `\nResolve the conflicts in your editor, then run \`fern replay resolve\` again to finalize.`
                            );
                        }
                        break;
                    case "committed":
                        cliContext.logger.info(
                            `Resolved ${result.patchesResolved} patch(es) and committed. Push when ready.`
                        );
                        break;
                    case "nothing-to-resolve":
                        cliContext.logger.info("No unresolved patches found.");
                        break;
                    default:
                        if (!result.success) {
                            if (result.reason === "unresolved-conflicts" && result.unresolvedFiles) {
                                cliContext.logger.warn(`Some files still have conflict markers:`);
                                for (const file of result.unresolvedFiles) {
                                    cliContext.logger.warn(`  ${file}`);
                                }
                                cliContext.logger.warn(`Resolve them first, then run \`fern replay resolve\` again.`);
                            } else {
                                cliContext.failAndThrow(
                                    `Resolve failed: ${result.reason ?? "unknown error"}`,
                                    undefined,
                                    { code: CliError.Code.InternalError }
                                );
                            }
                        }
                }
            } catch (error) {
                cliContext.failAndThrow(`Failed to resolve: ${extractErrorMessage(error)}`, error, {
                    code: CliError.Code.InternalError
                });
            }
        }
    );
}

function addReplayStatusCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "status [directory]",
        false, // hidden from --help
        (yargs) =>
            yargs
                .positional("directory", {
                    type: "string",
                    default: ".",
                    description: "SDK directory containing .fern/replay.lock"
                })
                .option("verbose", {
                    type: "boolean",
                    alias: "v",
                    default: false,
                    description: "Show all patches with full details"
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern replay status"
            });

            const outputDir = resolve(cwd(), argv.directory ?? ".");

            try {
                const result = replayStatus({ outputDir });

                if (!result.initialized) {
                    cliContext.logger.info("Replay is not initialized. Run `fern replay init` to get started.");
                    return;
                }

                // Header
                cliContext.logger.info(
                    `Replay: ${result.patches.length} customization(s) tracked, ${result.generationCount} generation(s)`
                );

                if (result.lastGeneration) {
                    cliContext.logger.info(
                        `Last generation: ${result.lastGeneration.sha} (${result.lastGeneration.timestamp})`
                    );
                }

                if (result.patches.length === 0) {
                    cliContext.logger.info("No customizations tracked.");
                    return;
                }

                // Patches
                const patchesToShow = argv.verbose ? result.patches : result.patches.slice(0, 10);
                for (const patch of patchesToShow) {
                    const statusTag = patch.status ? ` [${patch.status}]` : "";
                    if (argv.verbose) {
                        cliContext.logger.info(
                            `\n  ${patch.id} (${patch.type})${statusTag}\n` +
                                `    ${patch.message}\n` +
                                `    Author: ${patch.author} (${patch.sha})\n` +
                                `    Files (${patch.fileCount}): ${patch.files.join(", ")}`
                        );
                    } else {
                        cliContext.logger.info(
                            `  ${patch.id}: ${patch.message} (${patch.fileCount} file(s))${statusTag}`
                        );
                    }
                }

                if (!argv.verbose && result.patches.length > 10) {
                    cliContext.logger.info(`  ... and ${result.patches.length - 10} more (use --verbose to see all)`);
                }

                if (result.unresolvedCount > 0) {
                    cliContext.logger.warn(
                        `\n${result.unresolvedCount} patch(es) have unresolved conflicts. Run \`fern replay resolve\` to fix.`
                    );
                }

                if (result.excludePatterns.length > 0) {
                    cliContext.logger.info(`\nExclude patterns: ${result.excludePatterns.join(", ")}`);
                }
            } catch (error) {
                cliContext.failAndThrow(`Failed to get Replay status: ${extractErrorMessage(error)}`);
            }
        }
    );
}

function addReplayForgetCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "forget [args..]",
        false, // hidden from --help
        (yargs) =>
            yargs
                .positional("args", {
                    type: "string",
                    array: true,
                    description: "Patch IDs (e.g. patch-abc12345) or a search pattern"
                })
                .option("dry-run", {
                    type: "boolean",
                    default: false,
                    description: "Show what would be removed without actually removing"
                })
                .option("yes", {
                    type: "boolean",
                    alias: "y",
                    default: false,
                    description: "Skip confirmation prompts"
                })
                .option("all", {
                    type: "boolean",
                    default: false,
                    description: "Remove all tracked patches"
                }),
        async (argv) => {
            await cliContext.instrumentPostHogEvent({
                command: "fern replay forget"
            });

            const outputDir = resolve(cwd(), ".");
            const args = argv.args ?? [];
            const dryRun = argv.dryRun;

            try {
                // --all mode
                if (argv.all) {
                    const result = replayForget({ outputDir, options: { all: true, dryRun } });

                    if (!result.initialized) {
                        cliContext.logger.info("Replay is not initialized. Nothing to forget.");
                        return;
                    }

                    if (result.removed.length === 0) {
                        cliContext.logger.info("No patches to remove.");
                        return;
                    }

                    if (dryRun) {
                        cliContext.logger.info(`Would remove ${result.removed.length} patch(es):`);
                    } else {
                        cliContext.logger.info(`Removed ${result.removed.length} patch(es):`);
                    }
                    for (const patch of result.removed) {
                        cliContext.logger.info(`  ${patch.id}: ${patch.message}`);
                    }
                    for (const warning of result.warnings) {
                        cliContext.logger.warn(warning);
                    }
                    return;
                }

                // Patch ID mode: all args start with "patch-"
                if (args.length > 0 && args.every((a) => a.startsWith("patch-"))) {
                    const result = replayForget({ outputDir, options: { patchIds: args, dryRun } });

                    if (!result.initialized) {
                        cliContext.logger.info("Replay is not initialized. Nothing to forget.");
                        return;
                    }

                    if (result.removed.length > 0) {
                        const verb = dryRun ? "Would remove" : "Removed";
                        for (const patch of result.removed) {
                            cliContext.logger.info(`${verb}: ${patch.id} — ${patch.message}`);
                        }
                    }
                    for (const id of result.alreadyForgotten) {
                        cliContext.logger.info(`Already forgotten: ${id}`);
                    }
                    for (const warning of result.warnings) {
                        cliContext.logger.warn(warning);
                    }
                    return;
                }

                // Search/pattern mode or no-args mode
                const pattern = args.length === 1 ? args[0] : undefined;
                const result = replayForget({ outputDir, options: { pattern } });

                if (!result.initialized) {
                    cliContext.logger.info("Replay is not initialized. Nothing to forget.");
                    return;
                }

                const matched = result.matched ?? [];
                if (matched.length === 0) {
                    if (pattern) {
                        cliContext.logger.info(`No patches matching "${pattern}".`);
                    } else {
                        cliContext.logger.info("No patches tracked.");
                    }
                    return;
                }

                // Show matched patches
                cliContext.logger.info(`${matched.length} patch(es) matched:`);
                for (const patch of matched) {
                    const stat = `+${patch.diffstat.additions}/-${patch.diffstat.deletions}`;
                    cliContext.logger.info(`  ${patch.id}: ${patch.message} (${stat})`);
                }

                if (dryRun) {
                    cliContext.logger.info("\nDry run — no patches removed.");
                    return;
                }

                if (!argv.yes) {
                    if (!process.stdout.isTTY) {
                        cliContext.failAndThrow(
                            "Confirmation required. Use --yes to skip confirmation in non-interactive mode."
                        );
                        return;
                    }

                    // Simple y/N confirmation
                    const readline = await import("readline");
                    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
                    const answer = await new Promise<string>((resolvePrompt) => {
                        rl.question(`\nRemove ${matched.length} patch(es)? [y/N] `, resolvePrompt);
                    });
                    rl.close();

                    if (answer.toLowerCase() !== "y") {
                        cliContext.logger.info("Cancelled.");
                        return;
                    }
                }

                // Actually remove the matched patches
                const patchIds = matched.map((p) => p.id);
                const removeResult = replayForget({ outputDir, options: { patchIds, dryRun: false } });

                cliContext.logger.info(
                    `Removed ${removeResult.removed.length} patch(es). ${removeResult.remaining} remaining.`
                );
                for (const warning of removeResult.warnings) {
                    cliContext.logger.warn(warning);
                }
            } catch (error) {
                cliContext.failAndThrow(`Failed to forget patches: ${extractErrorMessage(error)}`);
            }
        }
    );
}

function parseOwnerRepo(githubRepo: string): { owner: string; repo: string } {
    const cleaned = githubRepo
        .replace(/^https?:\/\//, "")
        .replace(/\.git$/, "")
        .replace(/^github\.com\//, "");
    const parts = cleaned.split("/");
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    if (owner == null || repo == null) {
        throw new CliError({
            message: `Could not parse owner/repo from: ${githubRepo}`,
            code: CliError.Code.ParseError
        });
    }
    return { owner, repo };
}
