import { entries } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { formatServiceFile } from "./formatServiceFile";

export async function formatWorkspace({
    workspace,
    context,
    shouldFix,
}: {
    workspace: Workspace;
    context: TaskContext;
    shouldFix: boolean;
}): Promise<void> {
    for (const [relativeFilepath, file] of entries(workspace.serviceFiles)) {
        const formatted = formatServiceFile({
            fileContents: file.rawContents,
            absoluteFilepath: file.absoluteFilepath,
            context,
        });
        if (formatted === file.rawContents) {
            context.logger.info(chalk.dim(relativeFilepath));
        } else {
            if (shouldFix) {
                await writeFile(relativeFilepath, formatted);
                context.logger.info(chalk.green(relativeFilepath));
            } else {
                context.logger.info(chalk.red(relativeFilepath));
                context.failWithoutThrowing();
            }
        }
    }
}
