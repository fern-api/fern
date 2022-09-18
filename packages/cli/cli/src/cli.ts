import { cwd, FilePath, noop, resolve } from "@fern-api/core-utils";
import { initialize } from "@fern-api/init";
import { LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { getPathToFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { loadProject, Project } from "@fern-api/project-loader";
import { TASK_FAILURE } from "@fern-api/task-context";
import inquirer, { InputQuestion } from "inquirer";
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

void tryRunCli();

async function tryRunCli() {
    const cliContext = new CliContext(process.stdout);

    const exit = async () => {
        await cliContext.exit();
    };
    process.on("SIGINT", exit);

    const versionOfCliToRun = await getIntendedVersionOfCli(cliContext);
    if (cliContext.environment.packageVersion !== versionOfCliToRun) {
        const { failed } = await rerunFernCliAtVersion({
            version: versionOfCliToRun,
            cliContext,
        });
        if (failed) {
            cliContext.fail();
        }
    } else {
        try {
            await runCli(cliContext);
        } catch (error) {
            cliContext.fail("Failed to run", error);
        }
    }

    await exit();
}

async function runCli(cliContext: CliContext) {
    const cli: Argv<GlobalCliOptions> = yargs(hideBin(process.argv))
        .scriptName(cliContext.environment.cliName)
        .version(false)
        .strict()
        .command(
            "$0",
            false,
            (yargs) =>
                yargs
                    .option("--version", {
                        describe: "Print current version",
                        alias: "v",
                    })
                    .version(false),
            (argv) => {
                if (argv["--version"] != null) {
                    cliContext.logger.info(cliContext.environment.packageVersion);
                } else {
                    cliContext.fail();
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
    const pathToFernDirectory = await getPathToFernDirectory();
    if (pathToFernDirectory != null) {
        try {
            return (await loadProjectConfig({ directory: pathToFernDirectory })).version;
        } catch {}
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
            const organization = argv.organization ?? (await askForOrganization());
            await cliContext.runTask(async (context) =>
                initialize({
                    organization,
                    versionOfCli: await getLatestVersionOfCli(cliContext.environment),
                    context,
                })
            );
        }
    );
}

async function askForOrganization() {
    const organizationQuestion: InputQuestion<{ organization: string }> = {
        type: "input",
        name: "organization",
        message: "What's the name of your organization?",
    };
    const answers = await inquirer.prompt(organizationQuestion);
    return answers.organization;
}

function addAddCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "add <generator>",
        "Add a generator to generators.yml",
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
                await loadProjectOrExit(cliContext, {
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
                    description:
                        "If true, Docker containers are not removed after generation. This is ignored for remote generation.",
                })
                .option("local", {
                    boolean: true,
                    default: false,
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
                project: await loadProjectOrExit(cliContext, {
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
                project: await loadProjectOrExit(cliContext, {
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
        "ir",
        "Compiles your Fern API Definition",
        (yargs) =>
            yargs
                .option("output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true,
                })
                .option("api", {
                    string: true,
                    description: "Only run the command on the provided API",
                }),
        async (argv) => {
            await generateIrForWorkspaces({
                project: await loadProjectOrExit(cliContext, {
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: false,
                }),
                irFilepath: resolve(cwd(), FilePath.of(argv.output)),
                cliContext,
            });
        }
    );
}

function addValidateCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "check",
        "Validates your Fern API Definition",
        (yargs) =>
            yargs.option("api", {
                string: true,
                description: "Only run the command on the provided API",
            }),
        async (argv) => {
            await validateWorkspaces({
                project: await loadProjectOrExit(cliContext, {
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
    cli.command("upgrade", "Upgrades generator versions in your workspace", noop, async () => {
        await upgrade({
            cliContext,
        });
        onRun();
    });
}

async function loadProjectOrExit(
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

    if (project === TASK_FAILURE) {
        return cliContext.exit();
    }

    cliContext.registerWorkspaces(project.workspaces);
    return project;
}
