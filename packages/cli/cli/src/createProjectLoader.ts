import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { ProjectConfig } from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "./commands/generate-ir/handleFailedWorkspaceParserResult";

export interface Project {
    config: ProjectConfig;
    workspaces: Workspace[];
}

export type ProjectLoader = (args: ProjectLoader.Args) => Promise<Project>;

export declare namespace ProjectLoader {
    export interface Args {
        commandLineWorkspace: string | undefined;
    }
}

export function createProjectLoader({
    projectConfig,
    fernDirectory,
}: {
    projectConfig: ProjectConfig;
    fernDirectory: AbsoluteFilePath;
}): ProjectLoader {
    return async ({ commandLineWorkspace }) => {
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
            config: projectConfig,
            workspaces: maybeFilterWorkspaces({ allWorkspaces, commandLineWorkspace }),
        };
    };
}

function maybeFilterWorkspaces({
    allWorkspaces,
    commandLineWorkspace,
}: {
    allWorkspaces: readonly Workspace[];
    commandLineWorkspace: string | undefined;
}): Workspace[] {
    if (commandLineWorkspace == null) {
        if (allWorkspaces.length > 1) {
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
