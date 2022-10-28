import { noop } from "@fern-api/core-utils";
import { cwd, resolve } from "@fern-api/fs-utils";
import { initialize } from "@fern-api/init";
import { Language } from "@fern-api/ir-generator";
import { LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { loadProject, Project } from "@fern-api/project-loader";
import { FernCliError } from "@fern-api/task-context";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CliContext } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateWorkspaces } from "./commands/generate/generateWorkspaces";
import { releaseWorkspaces } from "./commands/release/releaseWorkspaces";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";

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
        const versionOfCliToRun = await getIntendedVersionOfCli(cliContext);
        if (cliContext.environment.packageVersion === versionOfCliToRun) {
            await tryRunCli(cliContext);
        } else {
            const { failed } = await rerunFernCliAtVersion({
                version: versionOfCliToRun,
                cliContext,
            });
            if (failed) {
                cliContext.fail();
            }
        }
    } catch (error) {
        if (error instanceof FernCliError) {
            // thrower is responsible for logging, so we don't need to log here
            cliContext.fail();
        } else {
            cliContext.fail("Failed to run", error);
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
    addReleaseCommand(cli, cliContext);
    addIrCommand(cli, cliContext);
    addValidateCommand(cli, cliContext);

    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage();
        },
    });

    cli.middleware((argv) => {
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
    return getLatestVersionOfCli(cliContext.environment);
}

function addInitCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "init",
        "Initialize a Fern API",
        (yargs) =>
            yargs.option("organization", {
                alias: "org",
                type: "string",
                description: "Organization name",
            }),
        async (argv) => {
            await cliContext.runTask(async (context) =>
                initialize({
                    organization: argv.organization,
                    versionOfCli: await getLatestVersionOfCli(cliContext.environment),
                    context,
                })
            );
        }
    );
}

function addAddCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "add <generator>",
        "Add a code generator to generators.yml",
        (yargs) =>
            yargs
                .positional("generator", {
                    choices: ["typescript", "java", "postman", "openapi"] as const,
                    demandOption: true,
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                }),
        async (argv) => {
            await addGeneratorToWorkspaces(
                await loadProjectAndRegisterWorkspaces(cliContext, {
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: false,
                }),
                argv.generator,
                cliContext
            );
        }
    );
}

function addGenerateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        ["generate"],
        "Run the draft tasks from generators.yml",
        (yargs) =>
            yargs
                .option("keepDocker", {
                    boolean: true,
                    default: false,
                    hidden: true,
                    description:
                        "If true, Docker containers are not removed after generation. This is ignored for remote generation.",
                })
                .option("local", {
                    boolean: true,
                    default: false,
                    hidden: true,
                    description: "If true, code is generated using Docker on this machine.",
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                })
                .option("all", {
                    boolean: true,
                    default: false,
                    description: "Include all APIs",
                }),
        async (argv) => {
            await generateWorkspaces({
                project: await loadProjectAndRegisterWorkspaces(cliContext, {
                    commandLineWorkspace: argv.all ? undefined : argv.api,
                    defaultToAllWorkspaces: argv.all,
                }),
                runLocal: argv.local,
                keepDocker: argv.keepDocker,
                cliContext,
            });
        }
    );
}

function addReleaseCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        ["release <package-version>"],
        "Run the release tasks from generators.yml",
        (yargs) =>
            yargs
                .positional("package-version", {
                    type: "string",
                    demandOption: true,
                    description: "The version for the generated packages",
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                })
                .option("all", {
                    boolean: true,
                    default: false,
                    description: "Include all APIs",
                }),
        async (argv) => {
            await releaseWorkspaces({
                project: await loadProjectAndRegisterWorkspaces(cliContext, {
                    commandLineWorkspace: argv.all ? undefined : argv.api,
                    defaultToAllWorkspaces: argv.all,
                }),
                cliContext,
                version: argv.packageVersion,
            });
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
                .option("language", {
                    choices: Object.values(Language),
                    description: "Only run the command on the provided API",
                }),
        async (argv) => {
            await generateIrForWorkspaces({
                project: await loadProjectAndRegisterWorkspaces(cliContext, {
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: false,
                }),
                irFilepath: resolve(cwd(), argv.pathToOutput),
                cliContext,
                generationLanguage: argv.language,
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
                project: await loadProjectAndRegisterWorkspaces(cliContext, {
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: true,
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
    cli.command("upgrade", "Upgrades versions in generators.yml and fern.config.json", noop, async () => {
        await upgrade({
            cliContext,
        });
        onRun();
    });
}

async function loadProjectAndRegisterWorkspaces(
    cliContext: CliContext,
    args: Omit<loadProject.Args, "context" | "cliName">
): Promise<Project> {
    const context = cliContext.addTask().start();
    const project = await loadProject({
        ...args,
        cliName: cliContext.environment.cliName,
        context,
    });
    context.finish();

    cliContext.registerWorkspaces(project.workspaces);
    return project;
}
