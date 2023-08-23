import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { FIXTURES, runTests } from "./commands/test/test";
import { bumpGeneratorSeedVersions } from "./commands/upgrade/upgrade";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);
    addUpgradeCommand(cli);

    await cli.parse();

    CONSOLE_LOGGER.info("Seed has finished...");
}

function addUpgradeCommand(cli: Argv) {
    cli.command(
        "upgrade",
        "Upgrade Seed CLI version within SDK Generators",
        (yargs) =>
            yargs.option("seedVersion", {
                type: "string",
                demandOption: true,
            }),
        async (argv) => {
            await bumpGeneratorSeedVersions({
                version: argv.seedVersion,
            });
        }
    );
}

function addTestCommand(cli: Argv) {
    cli.command(
        "test",
        "Run all snapshot tests",
        (yargs) =>
            yargs
                .option("irVersion", {
                    type: "string",
                    demandOption: false,
                })
                .option("language", {
                    type: "string",
                    choices: Object.values(GenerationLanguage),
                    demandOption: true,
                })
                .option("docker", {
                    type: "string",
                    demandOption: true,
                })
                .option("fixture", {
                    type: "string",
                    choices: Object.values(FIXTURES),
                    demandOption: false,
                    description: "Runs on all fixtures if not provided",
                })
                .options("compile-command", {
                    type: "string",
                    demandOption: false,
                    description: "User inputted command to compile generated code with",
                })
                .option("update", {
                    type: "boolean",
                    alias: "u",
                    description: "Determines whether or not snapshots are written to disk",
                    default: false,
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS,
                })
                .option("output-directory", {
                    type: "string",
                    alias: "output-dir",
                    description:
                        "The output directory of the generated code, useful for generators with multiple dockers",
                    demandOption: false,
                    default: "seed",
                }),
        async (argv) => {
            const parsedDockerImage = validateAndParseDockerImage(argv.docker);
            await runTests({
                fixtures: argv.fixture != null ? [argv.fixture] : Object.values(FIXTURES),
                irVersion: argv.irVersion,
                language: argv.language,
                docker: parsedDockerImage,
                compileCommand: argv["compile-command"],
                logLevel: argv["log-level"],
                outputDir: argv.outputDirectory,
            });
        }
    );
}

export interface ParsedDockerName {
    name: string;
    version: string;
}

function validateAndParseDockerImage(docker: string): ParsedDockerName {
    const dockerArray: string[] = docker.split(":");
    if (dockerArray.length === 2 && dockerArray[0] != null && dockerArray[1] != null) {
        return {
            name: dockerArray[0],
            version: dockerArray[1],
        };
    }
    throw new Error(`Received invalid docker name ${docker}. Must be formatted as <name>:<version>`);
}
