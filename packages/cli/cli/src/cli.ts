import { cwd, FilePath, noop, resolve } from "@fern-api/core-utils";
import { initialize } from "@fern-api/init";
import { LogLevel, LOG_LEVELS } from "@fern-api/logger";
import { getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import ansiEscapes from "ansi-escapes";
import inquirer, { InputQuestion } from "inquirer";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CliContext, GlobalCliOptions } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateWorkspaces } from "./commands/generate/generateWorkspaces";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { loadProject } from "./loadProject";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";

void tryRunCli();

async function tryRunCli() {
    const cliContext = new CliContext();

    process.stdout.write(ansiEscapes.cursorHide);
    const exit = async () => {
        process.stdout.write(ansiEscapes.cursorShow);
        await cliContext.exit();
    };
    process.on("SIGINT", exit);

    try {
        await runCli(cliContext);
    } catch (error) {
        cliContext.fail(error instanceof Error ? error.stack ?? error.message : JSON.stringify(error));
    } finally {
        await exit();
    }
}

async function runCli(cliContext: CliContext) {
    const versionOfCliToRun = await getIntendedVersionOfCli(cliContext);
    if (cliContext.environment.packageVersion !== versionOfCliToRun) {
        await rerunFernCliAtVersion({
            version: versionOfCliToRun,
            cliEnvironment: cliContext.environment,
        });
        return;
    }

    const cli: Argv<GlobalCliOptions> = yargs(hideBin(process.argv))
        .scriptName(cliContext.environment.cliName)
        .version(cliContext.environment.packageVersion)
        .strict()
        .alias("v", "version")
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
    addValidateCommand(cli, cliContext);

    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage = true;
        },
    });

    await cli.parse();
}

async function getIntendedVersionOfCli(cliContext: CliContext): Promise<string> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory != null) {
        try {
            return (await loadProjectConfig({ directory: fernDirectory })).version;
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
            cliContext.processArgv(argv);
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
        "Add a generator to .fernrc.yml",
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
            cliContext.processArgv(argv);
            await addGeneratorToWorkspaces(
                await loadProject({
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: false,
                    cliContext,
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
        "Generate typesafe servers and clients",
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
                    descriptoin: "Include all APIs",
                }),
        async (argv) => {
            cliContext.processArgv(argv);
            await generateWorkspaces({
                project: await loadProject({
                    commandLineWorkspace: argv.all ? undefined : argv.api,
                    defaultToAllWorkspaces: argv.all,
                    cliContext,
                }),
                runLocal: argv.local,
                keepDocker: argv.keepDocker,
                cliContext,
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
            cliContext.processArgv(argv);
            await generateIrForWorkspaces({
                project: await loadProject({
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: false,
                    cliContext,
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
            cliContext.processArgv(argv);
            await validateWorkspaces({
                project: await loadProject({
                    commandLineWorkspace: argv.api,
                    defaultToAllWorkspaces: true,
                    cliContext,
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
    cli.command("upgrade", "Upgrades generator versions in your workspace", noop, async (argv) => {
        cliContext.processArgv(argv);
        await upgrade({
            cliContext,
            project: await loadProject({
                commandLineWorkspace: undefined,
                defaultToAllWorkspaces: true,
                cliContext,
            }),
        });
        onRun();
    });
}
