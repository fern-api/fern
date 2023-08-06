import { GenerationLanguage } from "@fern-api/generators-configuration";
import { createMockTaskContext, TaskContext } from "@fern-api/task-context";
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";
import { FIXTURE, runTests } from "./commands/test";

void tryRunCli();

export async function tryRunCli(): Promise<void> {
    const cli: Argv = yargs(hideBin(process.argv));
    const taskContext = createMockTaskContext();

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
                    choices: Object.values(FIXTURE),
                    demandOption: false,
                    description: "Runs on all fixtures if not provided",
                }),
        async (argv) => {
            await runTests({
                fixture: argv.fixture,
                irVersion: argv.irVersion,
                language: argv.language,
                taskContext,
            });
        }
    );
}
