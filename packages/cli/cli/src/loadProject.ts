import { join, RelativeFilePath } from "@fern-api/core-utils";
import { getFernDirectoryOrThrow, loadProjectConfig, ProjectConfig } from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import chalk from "chalk";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "./commands/generate-ir/handleFailedWorkspaceParserResult";

export interface Project {
    config: ProjectConfig;
    workspaces: Workspace[];
}

export declare namespace loadProject {
    export interface Args {
        commandLineWorkspace: string | undefined;
        /**
         * if false and commandLineWorkspace it not defined,
         * loadProject will throw and error
         */
        defaultToAllWorkspaces: boolean;
    }
}

export async function loadProject({
    commandLineWorkspace,
    defaultToAllWorkspaces,
}: loadProject.Args): Promise<Project> {
    const fernDirectory = await getFernDirectoryOrThrow();
    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    const allWorkspaceDirectoryNames = fernDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    const allWorkspaces = await Promise.all(
        allWorkspaceDirectoryNames.map(async (workspaceDirectoryName) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(fernDirectory, RelativeFilePath.of(workspaceDirectoryName)),
            });
            if (!workspace.didSucceed) {
                handleFailedWorkspaceParserResult(workspace);
                throw new Error("Failed to parse workspace");
            }
            return workspace.workspace;
        })
    );

    if (allWorkspaces.length === 0) {
        throw new Error("No workspaces found.");
    }

    return {
        config: await loadProjectConfig({ directory: fernDirectory }),
        workspaces: maybeFilterWorkspaces({ allWorkspaces, commandLineWorkspace, defaultToAllWorkspaces }),
    };
}

function maybeFilterWorkspaces({
    allWorkspaces,
    commandLineWorkspace,
    defaultToAllWorkspaces,
}: {
    allWorkspaces: Workspace[];
    commandLineWorkspace: string | undefined;
    defaultToAllWorkspaces: boolean;
}): Workspace[] {
    if (commandLineWorkspace == null) {
        if (allWorkspaces.length > 1 && !defaultToAllWorkspaces) {
            let message = chalk.red("There are multiple workspaces. You must specify one with --api:\n");
            const longestWorkspaceName = Math.max(...allWorkspaces.map((workspace) => workspace.name.length));
            message += allWorkspaces
                .map((workspace) => {
                    const suggestedCommand = `fern --api ${workspace.name} ${process.argv.slice(2).join(" ")}`;
                    return ` › ${chalk.bold(workspace.name.padEnd(longestWorkspaceName))}  ${chalk.dim(
                        suggestedCommand
                    )}`;
                })
                .join("\n");
            console.log(message);
            throw new Error("There are multiple workspaces. You must specify one with --api");
        }
        return [...allWorkspaces];
    }

    return [commandLineWorkspace].reduce<Workspace[]>((all, workspaceName) => {
        const workspace = allWorkspaces.find((workspace) => workspace.name === workspaceName);
        if (workspace == null) {
            throw new Error(`Workspace ${workspaceName} not found`);
        }
        return [...all, workspace];
    }, []);
}
