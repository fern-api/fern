import { createLogger, LogLevel } from "@fern-api/logger";
import path from "path";
import { TaskContextFactory } from "../test/TaskContextFactory";
import { runTestCase } from "./case-runner";

export async function executeTestRemoteLocalCommand({
    generator,
    fixture,
    outputFolder,
    logLevel,
    workingDirectory,
    githubToken,
    fernToken
}: {
    generator: string[];
    fixture: string[];
    outputFolder: string;
    logLevel: LogLevel;
    workingDirectory: string;
    githubToken: string;
    fernToken: string;
}): Promise<void> {
    console.log("Executing test remote local command");
    // TODO(jsklan): Do something better here maybe
    const taskContextFactory = new TaskContextFactory(LogLevel.Debug);
    const taskContext = taskContextFactory.create("test-remote-local");
    const logger = taskContext.logger;

    logger.info("Executing test remote local command for ts-sdk:imdb:no-custom-config");
    await runTestCase({
        generator: "ts-sdk",
        fixture: "imdb",
        outputFolder: "no-custom-config",
        outputMode: "local-file-system",
        context: {
            fernExecutable: path.join(workingDirectory, "packages", "cli", "cli", "dist", "prod", "cli.cjs"),
            fernRepoDirectory: workingDirectory,
            workingDirectory: path.join(workingDirectory, "seed-remote-local", "ts-sdk", "imdb", "no-custom-config"),
            logger,
            githubToken,
            fernToken
        }
    });
}
