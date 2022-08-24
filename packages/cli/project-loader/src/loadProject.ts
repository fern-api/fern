import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { TaskContext, TASK_FAILURE } from "@fern-api/task-context";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "./handleFailedWorkspaceParserResult";
import { Project } from "./Project";

export declare namespace loadProject {
    export interface Args {
        cliName: string;
        commandLineWorkspace: string | undefined;
        /**
         * if false and commandLineWorkspace it not defined,
         * loadProject will cause the CLI to fail
         */
        defaultToAllWorkspaces: boolean;
        context: TaskContext;
    }
}

export async function loadProject({
    cliName,
    commandLineWorkspace,
    defaultToAllWorkspaces,
    context,
}: loadProject.Args): Promise<Project | TASK_FAILURE> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return context.fail(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    const allWorkspaceDirectoryNames = fernDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    if (commandLineWorkspace != null) {
        if (!allWorkspaceDirectoryNames.includes(commandLineWorkspace)) {
            return context.fail("API does not exist: " + commandLineWorkspace);
        }
    } else if (allWorkspaceDirectoryNames.length === 0) {
        return context.fail("No APIs found.");
    } else if (allWorkspaceDirectoryNames.length > 1 && !defaultToAllWorkspaces) {
        let message = "There are multiple workspaces. You must specify one with --api:\n";
        const longestWorkspaceName = Math.max(
            ...allWorkspaceDirectoryNames.map((workspaceName) => workspaceName.length)
        );
        message += allWorkspaceDirectoryNames
            .map((workspaceName) => {
                const suggestedCommand = `${cliName} ${process.argv.slice(2).join(" ")} --api ${workspaceName}`;
                return ` › ${chalk.bold(workspaceName.padEnd(longestWorkspaceName))}  ${chalk.dim(suggestedCommand)}`;
            })
            .join("\n");
        return context.fail(message);
    }

    const workspaces = await loadWorkspaces({
        fernDirectory,
        workspaceDirectoryNames:
            commandLineWorkspace != null ? [commandLineWorkspace] : [...allWorkspaceDirectoryNames],
        context,
    });

    if (workspaces === TASK_FAILURE) {
        return workspaces;
    }

    return {
        config: await loadProjectConfig({ directory: fernDirectory }),
        workspaces,
    };
}

async function loadWorkspaces({
    fernDirectory,
    workspaceDirectoryNames,
    context,
}: {
    fernDirectory: AbsoluteFilePath;
    workspaceDirectoryNames: string[];
    context: TaskContext;
}): Promise<Workspace[] | TASK_FAILURE> {
    const allWorkspaces: Workspace[] = [];

    let encounteredError = false;

    await Promise.all(
        workspaceDirectoryNames.map(async (workspaceDirectoryName) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
            });
            if (workspace.didSucceed) {
                allWorkspaces.push(workspace.workspace);
            } else {
                handleFailedWorkspaceParserResult(workspace, context.logger);
                context.fail();
                encounteredError = true;
            }
        })
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (encounteredError) {
        return TASK_FAILURE;
    }

    return allWorkspaces;
}
