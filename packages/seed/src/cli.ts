import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import path from "path";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { TaskContextFactory } from "./commands/test/TaskContextFactory";
import { testCustomFixture } from "./commands/test/testCustomFixture";
import { FIXTURES, testWorkspaceFixtures } from "./commands/test/testWorkspaceFixtures";
import { loadSeedWorkspaces } from "./loadSeedWorkspaces";
import { runScript } from "./runScript";

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
                    type: "array",
                    string: true,
                    demandOption: false,
                    description: "The workspace to run tests on"
                })
                .option("parallel", {
                    type: "number",
                    default: 4
                })
                .option("custom-fixture", {
                    type: "string",
                    demandOption: false,
                    description: "Path to the API directory"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    default: FIXTURES,
                    choices: FIXTURES,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("keepDocker", {
                    type: "boolean",
                    demandOption: false,
                    description: "Keeps the docker container after the tests are finished"
                })
                .option("update", {
                    type: "boolean",
                    alias: "u",
                    description: "Determines whether or not snapshots are written to disk",
                    default: false
                })
                .option("skip-scripts", {
                    type: "boolean",
                    demandOption: false,
                    default: false
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                }),
        async (argv) => {
            const workspaces = await loadSeedWorkspaces();

            let failurePresent = false;
            for (const workspace of workspaces) {
                if (argv.workspace != null && !argv.workspace.includes(workspace.workspaceName)) {
                    continue;
                }

                const parsedDockerImage = validateAndParseDockerImage(workspace.workspaceConfig.docker);

                const taskContextFactory = new TaskContextFactory(argv["log-level"]);
                if (workspace.workspaceConfig.dockerCommand != null) {
                    const workspaceTaskContext = taskContextFactory.create(workspace.workspaceName);
                    await runScript({
                        commands:
                            typeof workspace.workspaceConfig.dockerCommand === "string"
                                ? [workspace.workspaceConfig.dockerCommand]
                                : workspace.workspaceConfig.dockerCommand,
                        logger: workspaceTaskContext.logger,
                        workingDir: path.dirname(path.dirname(workspace.absolutePathToWorkspace)),
                        doNotPipeOutput: false
                    });
                }

                if (argv.customFixture != null) {
                    await testCustomFixture({
                        pathToFixture: argv.customFixture.startsWith("/")
                            ? AbsoluteFilePath.of(argv.customFixture)
                            : join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of(argv.customFixture)),
                        workspace,
                        irVersion: workspace.workspaceConfig.irVersion,
                        language: workspace.workspaceConfig.language,
                        docker: parsedDockerImage,
                        logLevel: argv["log-level"],
                        numDockers: argv.parallel,
                        keepDocker: argv.keepDocker,
                        skipScripts: argv.skipScripts
                    });
                } else {
                    const passed = await testWorkspaceFixtures({
                        workspace,
                        fixtures: argv.fixture,
                        irVersion: workspace.workspaceConfig.irVersion,
                        language: workspace.workspaceConfig.language,
                        docker: parsedDockerImage,
                        scripts: workspace.workspaceConfig.scripts,
                        logLevel: argv["log-level"],
                        numDockers: argv.parallel,
                        taskContextFactory,
                        keepDocker: argv.keepDocker,
                        skipScripts: argv.skipScripts
                    });
                    failurePresent = failurePresent || !passed;
                }
            }

            if (failurePresent) {
                process.exit(1);
            }
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
            version: dockerArray[1]
        };
    }
    throw new Error(`Received invalid docker name ${docker}. Must be formatted as <name>:<version>`);
}
