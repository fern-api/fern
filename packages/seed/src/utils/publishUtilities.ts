import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

// Replace the version string within the command, if one is specified
// The idea here is to turn a command like "npm publish --tag $VERSION" into "npm publish --tag v1.0.0"
export function subVersion(command: string, version: string, versionSubsitution?: string): string {
    return versionSubsitution ? command.replace(versionSubsitution, version) : command;
}

export async function runCommands(commands: string[], context: TaskContext, cwd: string | undefined) {
    for (const command of commands) {
        await loggingExeca(context.logger, "cd", [cwd ?? ".", "&&", command]);
    }
}
