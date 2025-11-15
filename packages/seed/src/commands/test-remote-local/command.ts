import { LogLevel, createLogger } from "@fern-api/logger";
import { runTestCase } from "./case-runner";
import path from "path";

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
    const logger = createLogger(logLevel);

    logger.info("Executing test remote local command for ts-sdk:imdb:no-custom-config");
    await runTestCase({
        generator: "ts-sdk",
        fixture: "imdb",
        outputFolder: "no-custom-config",
        context: {
            fernExecutable: path.join(workingDirectory, "packages", "cli", "cli", "dist", "prod", "cli.cjs"),
            logger,
            githubToken,
            fernToken

        }
    });
}