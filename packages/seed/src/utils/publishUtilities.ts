import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

import { runScript } from "../runScript";

// Replace the version string within the command, if one is specified
// The idea here is to turn a command like "npm publish --tag $VERSION" into "npm publish --tag v1.0.0"
export function subVersion(command: string, version: string, versionSubsitution?: string): string {
    return versionSubsitution ? command.replace(versionSubsitution, version) : command;
}

export async function runCommands(commands: string[], context: TaskContext, cwd: string) {
    for (const command of commands) {
        const splitCommand = command.split(" ");
        if (splitCommand[0] == null) {
            throw new Error(`Failed to run ${command}`);
        }
        const { exitCode, stdout, stderr } = await loggingExeca(
            context.logger,
            splitCommand[0],
            splitCommand.slice(1),
            {
                doNotPipeOutput: true,
                env: {
                    ...process.env
                },
                cwd
            }
        );
        if (exitCode !== 0) {
            context.logger.error(`Failed to run ${command}\n${stdout}\n${stderr}`);
            throw new Error(`Failed to run ${command}`);
        }
    }
}
