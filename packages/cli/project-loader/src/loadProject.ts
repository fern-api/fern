import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "./handleFailedWorkspaceParserResult";
import { Project } from "./Project";

export declare namespace loadProject {
    export interface Args {
        cliName: string;
        cliVersion: string;
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
    cliVersion,
    commandLineWorkspace,
    defaultToAllWorkspaces,
    context,
}: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
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
            return context.failAndThrow("API does not exist: " + commandLineWorkspace);
        }
    } else if (allWorkspaceDirectoryNames.length === 0) {
        return context.failAndThrow("No APIs found.");
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
        return context.failAndThrow(message);
    }

    const workspaces = await loadWorkspaces({
        fernDirectory,
        workspaceDirectoryNames:
            commandLineWorkspace != null ? [commandLineWorkspace] : [...allWorkspaceDirectoryNames],
        context,
        cliVersion,
    });

    return {
        config: await loadProjectConfig({ directory: fernDirectory, context }),
        workspaces,
    };
}

async function loadWorkspaces({
    fernDirectory,
    workspaceDirectoryNames,
    context,
    cliVersion,
}: {
    fernDirectory: AbsoluteFilePath;
    workspaceDirectoryNames: string[];
    context: TaskContext;
    cliVersion: string;
}): Promise<Workspace[]> {
    const allWorkspaces: Workspace[] = [];

    await Promise.all(
        workspaceDirectoryNames.map(async (workspaceDirectoryName) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
                context,
                cliVersion,
            });
            if (workspace.didSucceed) {
                allWorkspaces.push(workspace.workspace);
            } else {
                handleFailedWorkspaceParserResult(workspace, context.logger);
                context.failAndThrow();
            }
        })
    );

    return allWorkspaces;
}
