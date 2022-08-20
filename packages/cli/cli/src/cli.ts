import { cwd, FilePath, noop, resolve } from "@fern-api/core-utils";
import { initialize } from "@fern-api/init";
import { getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import inquirer, { InputQuestion } from "inquirer";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { CliContext } from "./cli-context/CliContext";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateWorkspaces } from "./commands/generate/generateWorkspaces";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { loadProject } from "./loadProject";
import { rerunFernCliAtVersion } from "./rerunFernCliAtVersion";

void runCli();

interface GlobalCliOptions {
    api: string | undefined;
}

async function runCli() {
    const cliContext = new CliContext();

    const fernDirectory = await getFernDirectory();
    const versionOfCliToRun =
        fernDirectory != null
            ? (await loadProjectConfig({ directory: fernDirectory })).version
            : await getLatestVersionOfCli(cliContext.environment);
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
        .demandCommand()
        .recommendCommands()
        .option("api", {
            string: true,
            description: "Only run the command on the provided API",
        });

    addInitCommand(cli, cliContext);
    addAddCommand(cli);
    addConvertCommand(cli);
    addGenerateCommand(cli);
    addLoginCommand(cli);
    addIrCommand(cli, cliContext);
    addValidateCommand(cli);

    addUpgradeCommand({
        cli,
        cliContext,
        onRun: () => {
            cliContext.suppressUpgradeMessage = true;
        },
    });

    await cli.parse();
    await cliContext.exit();
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
            await initialize({
                organization,
                versionOfCli: await getLatestVersionOfCli(cliContext.environment),
            });
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

function addAddCommand(cli: Argv<GlobalCliOptions>) {
    cli.command(
        "add <generator>",
        "Add a generator to .fernrc.yml",
        (yargs) =>
            yargs.positional("generator", {
                choices: ["typescript", "java", "postman", "openapi"] as const,
                demandOption: true,
            }),
        async (argv) => {
            await addGeneratorToWorkspaces(await loadProject({ commandLineWorkspace: argv.api }), argv.generator);
        }
    );
}

function addGenerateCommand(cli: Argv<GlobalCliOptions>) {
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
                }),
        async (argv) => {
            await generateWorkspaces({
                project: await loadProject({ commandLineWorkspace: argv.api }),
                runLocal: argv.local,
                keepDocker: argv.keepDocker,
            });
        }
    );
}

function addIrCommand(cli: Argv<GlobalCliOptions>, cliContext: CliContext) {
    cli.command(
        "ir",
        "Compiles your Fern API Definition",
        (yargs) =>
            yargs.option("output", {
                type: "string",
                description: "Path to write intermediate representation (IR)",
                demandOption: true,
            }),
        async (argv) =>
            generateIrForWorkspaces({
                project: await loadProject({ commandLineWorkspace: argv.api }),
                irFilepath: resolve(cwd(), FilePath.of(argv.output)),
                cliContext,
            })
    );
}

function addValidateCommand(cli: Argv<GlobalCliOptions>) {
    cli.command("check", "Validates your Fern API Definition", noop, async (argv) =>
        validateWorkspaces({
            project: await loadProject({ commandLineWorkspace: argv.api }),
        })
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
        await upgrade({
            cliContext,
            project: await loadProject({ commandLineWorkspace: argv.api }),
        });
        onRun();
    });
}
