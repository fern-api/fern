import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER, LogLevel, LOG_LEVELS } from "@fern-api/logger";
import path from "path";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { rewriteInputsForWorkspace } from "./commands/rewrite-inputs/rewriteInputsForWorkspace";
import { TaskContextFactory } from "./commands/test/TaskContextFactory";
import { testCustomFixture } from "./commands/test/testCustomFixture";
import { FIXTURES, testWorkspaceFixtures } from "./commands/test/testWorkspaceFixtures";
import { loadSeedWorkspaces } from "./loadSeedWorkspaces";
import { runScript } from "./runScript";
import { parseDockerOrThrow } from "./utils/parseDockerOrThrow";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));

    addTestCommand(cli);
    addWriteInputsCommand(cli);

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
                .option("outputFolder", {
                    type: "string",
                    demandOption: false,
                    description: "A specific output folder to test against"
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

                const parsedDockerImage = parseDockerOrThrow(workspace.workspaceConfig.docker);

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
                        skipScripts: argv.skipScripts,
                        outputFolder: argv.outputFolder
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

function addWriteInputsCommand(cli: Argv) {
    cli.command(
        "write-inputs",
        "Rewrites the .inputs directory for each workspace",
        (yargs) =>
            yargs
                .option("workspace", {
                    type: "array",
                    string: true,
                    demandOption: false,
                    description: "Workspaces to write inputs for"
                })
                .option("fixture", {
                    type: "array",
                    string: true,
                    default: FIXTURES,
                    choices: FIXTURES,
                    demandOption: false,
                    description: "Runs on all fixtures if not provided"
                })
                .option("log-level", {
                    default: LogLevel.Info,
                    choices: LOG_LEVELS
                }),
        async (argv) => {
            const workspaces = await loadSeedWorkspaces();
            for (const workspace of workspaces) {
                if (argv.workspace != null && !argv.workspace.includes(workspace.workspaceName)) {
                    continue;
                }
                await rewriteInputsForWorkspace({
                    workspace,
                    fixtures: argv.fixture,
                    taskContextFactory: new TaskContextFactory(argv["log-level"])
                });
            }
        }
    );
}
