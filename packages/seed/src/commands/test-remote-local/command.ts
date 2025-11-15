import { LogLevel } from "@fern-api/logger";


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
}