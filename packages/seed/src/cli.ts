import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { FIXTURES, testWorkspace } from "./commands/test/testWorkspace";
import { loadSeedWorkspaces } from "./loadSeedWorkspaces";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);

    await cli.parse();

    CONSOLE_LOGGER.info("Seed has finished...");
}

function addTestCommand(cli: Argv) {
    cli.command(
        "test",
        "Run all snapshot tests",
        (yargs) =>
            yargs
                .option("workspace", {
                    type: "string",
                })
                .option("parallel", {
                    type: "number",
                    default: 4,
                })
                .option("fixture", {
                    type: "string",
                    choices: Object.values(FIXTURES),
                    demandOption: false,
                    description: "Runs on all fixtures if not provided",
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
                }),
        async (argv) => {
            const workspaces = await loadSeedWorkspaces();

            const filteredWorkspace = workspaces.filter((workspace) => {
                return workspace.workspaceName === argv.workspace;
            });

            if (filteredWorkspace[0] == null) {
                throw new Error(`Failed to find workspace ${argv.workspace}`);
            }

            const workspace = filteredWorkspace[0];

            const parsedDockerImage = validateAndParseDockerImage(workspace.workspaceConfig.docker);
            await testWorkspace({
                workspace,
                fixtures: argv.fixture != null ? [argv.fixture] : Object.values(FIXTURES),
                irVersion: workspace.workspaceConfig.irVersion,
                language: workspace.workspaceConfig.language,
                generatorType: workspace.workspaceConfig.generatorType,
                docker: parsedDockerImage,
                compileCommand: undefined,
                logLevel: argv["log-level"],
                numDockers: argv.parallel,
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
