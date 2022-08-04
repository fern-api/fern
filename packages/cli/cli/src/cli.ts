import { initialize } from "@fern-api/init";
import { initiateLogin } from "@fern-api/login";
import inquirer, { InputQuestion } from "inquirer";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { convertOpenApiToFernApiDefinition } from "./commands/convert-openapi/convertOpenApi";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateWorkspaces } from "./commands/generate/generateWorkspaces";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { getFernCliUpgradeMessage } from "./upgradeNotifier";

void runCli();

export interface PackageInfo {
    packageName: string | undefined;
    packageVersion: string | undefined;
}

async function runCli() {
    const cli = yargs(hideBin(process.argv));

    cli.scriptName(process.env.CLI_NAME ?? "fern")
        .strict()
        .alias("v", "version")
        .demandCommand()
        .recommendCommands();

    const packageInfo = {
        packageName: process.env.PACKAGE_NAME,
        packageVersion: process.env.PACKAGE_VERSION,
    };
    if (packageInfo.packageVersion != null) {
        cli.version(packageInfo.packageVersion);
    }

    addInitCommand(cli);
    addAddCommand(cli);
    addConvertCommand(cli);
    addGenerateCommand(cli);
    addLoginCommand(cli);
    addGenerateIrCommand(cli);
    addValidateCommand(cli);
    addUpgradeCommand(cli, packageInfo);

    await cli.parse();
    if (packageInfo.packageVersion != null && packageInfo.packageName != null) {
        const upgradeMessage = await getFernCliUpgradeMessage({
            packageVersion: packageInfo.packageVersion,
            packageName: packageInfo.packageName,
        });
        if (upgradeMessage != null) {
            console.error(upgradeMessage);
        }
    }
}

function addInitCommand(cli: Argv) {
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
            await initialize({ organization });
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

function addAddCommand(cli: Argv) {
    cli.command(
        "add <generator> [workspaces...]",
        "Add a generator to .fernrc.yml",
        (yargs) =>
            yargs
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                })
                .positional("generator", {
                    choices: ["typescript", "java", "postman", "openapi"] as const,
                    demandOption: true,
                }),
        async (argv) => {
            await addGeneratorToWorkspaces(argv.workspaces ?? [], argv.generator);
        }
    );
}

function addGenerateCommand(cli: Argv) {
    cli.command(
        ["generate [workspaces...]", "gen"],
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
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                }),
        async (argv) => {
            await generateWorkspaces({
                commandLineWorkspaces: argv.workspaces ?? [],
                runLocal: argv.local,
                keepDocker: argv.keepDocker,
            });
        }
    );
}

function addConvertCommand(cli: Argv) {
    cli.command(
        "convert <openapiPath> <fernDefinitionDir>",
        "Converts Open API to Fern API Definition.",
        (yargs) =>
            yargs
                .positional("openapiPath", {
                    type: "string",
                    demandOption: true,
                    description: "Path to your Open API definition",
                })
                .positional("fernDefinitionDir", {
                    type: "string",
                    demandOption: true,
                    description: "Output directory for your Fern API definition",
                }),
        (argv) => convertOpenApiToFernApiDefinition(argv.openapiPath, argv.fernDefinitionDir)
    );
}

function addLoginCommand(cli: Argv) {
    cli.command({
        command: "login",
        describe: "Authenticate with Fern",
        handler: async () => {
            await initiateLogin();
        },
    });
}

function addGenerateIrCommand(cli: Argv) {
    cli.command(
        "ir [workspaces...]",
        "Compiles your Fern API Definition",
        (yargs) =>
            yargs
                .option("output", {
                    type: "string",
                    description: "Path to write intermediate representation (IR)",
                    demandOption: true,
                })
                .positional("workspaces", {
                    array: true,
                    type: "string",
                    description:
                        "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
                }),
        (argv) =>
            generateIrForWorkspaces({
                commandLineWorkspaces: argv.workspaces ?? [],
                irFilepath: argv.output,
            })
    );
}

function addValidateCommand(cli: Argv) {
    cli.command(
        "check [workspaces...]",
        "Validates your Fern API Definition",
        (yargs) =>
            yargs.positional("workspaces", {
                array: true,
                type: "string",
                description:
                    "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
            }),
        (argv) =>
            validateWorkspaces({
                commandLineWorkspaces: argv.workspaces ?? [],
            })
    );
}

function addUpgradeCommand(cli: Argv, packageInfo: PackageInfo) {
    cli.command(
        "upgrade [workspaces...]",
        "Upgrades generator versions in your workspace",
        (yargs) =>
            yargs.positional("workspaces", {
                array: true,
                type: "string",
                description:
                    "If omitted, every workspace specified in the project-level configuration (fern.config.json) will be processed.",
            }),
        async (argv) => {
            await upgrade({ commandLineWorkspaces: argv.workspaces ?? [], packageInfo });
        }
    );
}
