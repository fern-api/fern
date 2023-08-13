import { GenerationLanguage } from "@fern-api/generators-configuration";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { TaskContext } from "@fern-api/task-context";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { FIXTURES, runTests } from "./commands/test/test";
import { TaskContextImpl } from "./TaskContextImpl";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));
    const taskContext = new TaskContextImpl({
        logImmediately: (logs) => {
            logs.forEach((log) => {
                CONSOLE_LOGGER.info(...log.parts);
            });
        },
        takeOverTerminal: async () => {
            return;
        },
        shouldBufferLogs: false,
        instrumentPostHogEvent: () => {
            return;
        },
    });

    addTestCommand(cli, taskContext);

    await cli.parse();

    taskContext.logger.info("Seed has finished...");
}

function addTestCommand(cli: Argv, taskContext: TaskContext) {
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
                }),
        async (argv) => {
            taskContext.logger.info("Hello");
            const parsedDockerImage = validateAndParseDockerImage(argv.docker);
            await runTests({
                fixtures: argv.fixture != null ? [argv.fixture] : Object.values(FIXTURES),
                irVersion: argv.irVersion,
                language: argv.language,
                docker: parsedDockerImage,
                compileCommand: argv["compile-command"],
                taskContext,
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
