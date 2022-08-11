import { noop } from "@fern-api/core-utils";
import { initialize } from "@fern-api/init";
import { initiateLogin } from "@fern-api/login";
import inquirer, { InputQuestion } from "inquirer";
import { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { RawCliEnvironment, readRawCliEnvironment, tryParseRawCliEnvironment } from "./cliEnvironment";
import { addGeneratorToWorkspaces } from "./commands/add-generator/addGeneratorToWorkspaces";
import { convertOpenApiToFernApiDefinition } from "./commands/convert-openapi/convertOpenApi";
import { generateIrForWorkspaces } from "./commands/generate-ir/generateIrForWorkspaces";
import { generateWorkspaces } from "./commands/generate/generateWorkspaces";
import { upgrade } from "./commands/upgrade/upgrade";
import { validateWorkspaces } from "./commands/validate/validateWorkspaces";
import { getFernCliUpgradeMessage } from "./upgradeNotifier";

void runCli();

interface GlobalCliOptions {
    api: string | undefined;
}

async function runCli() {
    const rawCliEnvironment = readRawCliEnvironment();

    const cli: Argv<GlobalCliOptions> = yargs(hideBin(process.argv))
        .scriptName(rawCliEnvironment.cliName ?? "fern")
        .version(rawCliEnvironment.packageVersion ?? "<unknown>")
        .strict()
        .alias("v", "version")
        .demandCommand()
        .recommendCommands()
        .option("api", {
            string: true,
            description: "Only run the command on the provided API",
        });

    addInitCommand(cli);
    addAddCommand(cli);
    addConvertCommand(cli);
    addGenerateCommand(cli);
    addLoginCommand(cli);
    addGenerateIrCommand(cli);
    addValidateCommand(cli);

    const cliContext = { showUpgradeMessageIfAvailable: true };
    addUpgradeCommand({
        cli,
        rawCliEnvironment,
        onRun: () => {
            cliContext.showUpgradeMessageIfAvailable = false;
        },
    });

    await cli.parse();

    if (cliContext.showUpgradeMessageIfAvailable) {
        await printUpgradeMessageIfUpgradeIsAvailable(rawCliEnvironment);
    }
}

async function printUpgradeMessageIfUpgradeIsAvailable(rawCliEnvironment: RawCliEnvironment): Promise<void> {
    const parsedCliEnvironment = tryParseRawCliEnvironment(rawCliEnvironment);
    if (parsedCliEnvironment == null) {
        return;
    }
    const upgradeMessage = await getFernCliUpgradeMessage(parsedCliEnvironment);
    if (upgradeMessage != null) {
        console.error(upgradeMessage);
    }
}

function addInitCommand(cli: Argv<GlobalCliOptions>) {
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
            await addGeneratorToWorkspaces(argv.api != null ? [argv.api] : [], argv.generator);
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
                commandLineWorkspaces: argv.api != null ? [argv.api] : [],
                runLocal: argv.local,
                keepDocker: argv.keepDocker,
            });
        }
    );
}

function addConvertCommand(cli: Argv<GlobalCliOptions>) {
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

function addLoginCommand(cli: Argv<GlobalCliOptions>) {
    cli.command({
        command: "login",
        describe: "Authenticate with Fern",
        handler: async () => {
            await initiateLogin();
        },
    });
}

function addGenerateIrCommand(cli: Argv<GlobalCliOptions>) {
    cli.command(
        "ir",
        "Compiles your Fern API Definition",
        (yargs) =>
            yargs.option("output", {
                type: "string",
                description: "Path to write intermediate representation (IR)",
                demandOption: true,
            }),
        (argv) =>
            generateIrForWorkspaces({
                commandLineWorkspaces: argv.api != null ? [argv.api] : [],
                irFilepath: argv.output,
            })
    );
}

function addValidateCommand(cli: Argv<GlobalCliOptions>) {
    cli.command("check", "Validates your Fern API Definition", noop, (argv) =>
        validateWorkspaces({
            commandLineWorkspaces: argv.api != null ? [argv.api] : [],
        })
    );
}

function addUpgradeCommand({
    cli,
    rawCliEnvironment,
    onRun,
}: {
    cli: Argv<GlobalCliOptions>;
    rawCliEnvironment: RawCliEnvironment;
    onRun: () => void;
}) {
    cli.command("upgrade", "Upgrades generator versions in your workspace", noop, async (argv) => {
        await upgrade({ commandLineWorkspaces: argv.api != null ? [argv.api] : [], rawCliEnvironment });
        onRun();
    });
}
