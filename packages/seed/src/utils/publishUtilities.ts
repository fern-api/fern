import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { runScript } from "../runScript";

// Replace the version string within the command, if one is specified
// The idea here is to turn a command like "npm publish --tag $VERSION" into "npm publish --tag v1.0.0"
export function subVersion(command: string, version: string, versionSubsitution?: string): string {
    return versionSubsitution ? command.replace(versionSubsitution, version) : command;
}

export async function runCommands(commands: string[], context: TaskContext, cwd: string) {
    await runScript({
        commands,
        doNotPipeOutput: false,
        logger: context.logger,
        workingDir: cwd
    });
    for (const command of commands) {
        if (commands[0] == null) {
            throw new Error(`Failed to run ${command}`);
        }
        const { exitCode } = await loggingExeca(context.logger, commands[0], commands.slice(-1), {
            doNotPipeOutput: false,
            env: {
                ...process.env
            },
            cwd
        });
        if (exitCode !== 0) {
            throw new Error(`Failed to run ${command}`);
        }
    }
}
