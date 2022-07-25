import { ProjectConfig } from "@fern-api/project-configuration";
import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { lstat } from "fs/promises";
import glob from "glob-promise";
import path from "path";
import { WorkspaceConfigurationFilePath } from "./WorkspaceConfigurationFilePath";

export async function getWorkspaceConfigurationPaths({
    commandLineWorkspaces,
    projectConfig,
}: {
    commandLineWorkspaces: readonly string[];
    projectConfig: ProjectConfig;
}): Promise<WorkspaceConfigurationFilePath[]> {
    if (commandLineWorkspaces.length > 0) {
        return uniq(await getWorkspaceConfigurationPathsFromCommandLineArgs(commandLineWorkspaces));
    }

    const workspacesGlobs = projectConfig.workspaces;
    const allWorkspaces: WorkspaceConfigurationFilePath[] = [];
    for (const workspacesGlob of workspacesGlobs) {
        const workspacesInGlob = await findWorkspaceConfigurationPaths(workspacesGlob);
        allWorkspaces.push(...workspacesInGlob);
    }
    return uniq(allWorkspaces);
}

async function getWorkspaceConfigurationPathsFromCommandLineArgs(
    commandLineWorkspaces: readonly string[]
): Promise<WorkspaceConfigurationFilePath[]> {
    const promises = commandLineWorkspaces.flatMap(async (commandLineWorkspace) => {
        const stats = await lstat(commandLineWorkspace);
        if (stats.isFile()) {
            if (path.basename(commandLineWorkspace) !== WORKSPACE_CONFIGURATION_FILENAME) {
                throw new Error("Not a workspace configuration: " + commandLineWorkspace);
            }
            return [commandLineWorkspace as WorkspaceConfigurationFilePath];
        } else if (stats.isDirectory()) {
            return findWorkspaceConfigurationPaths(commandLineWorkspace);
        } else {
            throw new Error("Filepath is not a file or a directory " + commandLineWorkspace);
        }
    });

    return (await Promise.all(promises)).flat();
}

async function findWorkspaceConfigurationPaths(pathToSearch: string): Promise<WorkspaceConfigurationFilePath[]> {
    const workspaceConfigurationFilePaths = await glob(`${pathToSearch}/**/${WORKSPACE_CONFIGURATION_FILENAME}`, {
        absolute: true,
    });

    return workspaceConfigurationFilePaths.map(
        (workspaceConfigurationFilePath: string) => workspaceConfigurationFilePath as WorkspaceConfigurationFilePath
    );
}

function uniq<T>(items: readonly T[]): T[] {
    const uniqueItems: T[] = [];
    const seen = new Set<T>();

    for (const item of items) {
        if (!seen.has(item)) {
            uniqueItems.push(item);
        }
        seen.add(item);
    }

    return uniqueItems;
}
