import { AbsoluteFilePath, cwd, FilePath, resolve } from "@fern-api/core-utils";
import { ProjectConfig } from "@fern-api/project-configuration";
import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { lstat } from "fs/promises";
import glob from "glob-promise";
import path from "path";

export async function getWorkspaceConfigurationPaths({
    commandLineWorkspaces,
    projectConfig,
}: {
    commandLineWorkspaces: readonly string[];
    projectConfig: ProjectConfig;
}): Promise<AbsoluteFilePath[]> {
    if (commandLineWorkspaces.length > 0) {
        return uniq(await getWorkspaceConfigurationPathsFromCommandLineArgs(commandLineWorkspaces));
    }

    const workspacesGlobs = projectConfig.workspaces;
    const allWorkspaces: AbsoluteFilePath[] = [];
    for (const workspacesGlob of workspacesGlobs) {
        const workspacesInGlob = await findWorkspaceConfigurationPaths(workspacesGlob);
        allWorkspaces.push(...workspacesInGlob);
    }
    return uniq(allWorkspaces);
}

async function getWorkspaceConfigurationPathsFromCommandLineArgs(
    commandLineWorkspaces: readonly string[]
): Promise<AbsoluteFilePath[]> {
    const promises = commandLineWorkspaces.flatMap(async (commandLineWorkspace) => {
        const absolutePathToWorkspace = resolve(cwd(), FilePath.of(commandLineWorkspace));
        const stats = await lstat(absolutePathToWorkspace);
        if (stats.isFile()) {
            if (path.basename(absolutePathToWorkspace) !== WORKSPACE_CONFIGURATION_FILENAME) {
                throw new Error("Not a workspace configuration: " + commandLineWorkspace);
            }
            return [absolutePathToWorkspace];
        } else if (stats.isDirectory()) {
            return findWorkspaceConfigurationPaths(absolutePathToWorkspace);
        } else {
            throw new Error("Filepath is not a file or a directory " + commandLineWorkspace);
        }
    });

    return (await Promise.all(promises)).flat();
}

async function findWorkspaceConfigurationPaths(globToSearch: string): Promise<AbsoluteFilePath[]> {
    return (
        await glob(`${globToSearch}/**/${WORKSPACE_CONFIGURATION_FILENAME}`, {
            absolute: true,
        })
    ).map(AbsoluteFilePath.of);
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
