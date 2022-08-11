import {
    loadProjectConfig,
    loadProjectConfigFromFilepath,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { WORKSPACE_CONFIGURATION_FILENAME } from "@fern-api/workspace-configuration";
import { findUp } from "find-up";
import { readdir } from "fs/promises";
import path from "path";
import { getWorkspaceConfigurationPaths } from "./getWorkspaceConfigurationPaths";
import { WorkspaceConfigurationFilePath } from "./WorkspaceConfigurationFilePath";

const FERN_DIRECTORY = ".fern";

export interface Project {
    organization: string;
    workspaces: Workspace[];
}

export interface Workspace {
    name: string;
    absolutePath: string;
    workspaceConfigurationFilePath: WorkspaceConfigurationFilePath;
}

export async function loadProject({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const project =
        (await loadProjectV2({ commandLineWorkspaces })) ?? (await loadProjectV1({ commandLineWorkspaces }));
    if (project.workspaces.length === 0) {
        throw new Error("No workspaces found");
    }
    return project;
}

async function loadProjectV1({ commandLineWorkspaces }: { commandLineWorkspaces: readonly string[] }) {
    const projectConfig = await loadProjectConfig();

    const workspaceConfigurationPaths = await getWorkspaceConfigurationPaths({
        commandLineWorkspaces,
        projectConfig,
    });

    return {
        organization: projectConfig.organization,
        workspaces: workspaceConfigurationPaths.map((workspaceConfigurationPath): Workspace => {
            return {
                name: "Workspace",
                absolutePath: path.dirname(workspaceConfigurationPath),
                workspaceConfigurationFilePath: workspaceConfigurationPath,
            };
        }),
    };
}

async function loadProjectV2({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project | undefined> {
    const fernDirectory = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectory == null) {
        return undefined;
    }

    const fernDirectoryContents = await readdir(fernDirectory, { withFileTypes: true });
    const allWorkspaces = fernDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    let filteredWorkspaces: readonly string[] = allWorkspaces;

    if (commandLineWorkspaces.length > 0) {
        filteredWorkspaces = commandLineWorkspaces;
    } else {
        if (allWorkspaces.length > 1) {
            throw new Error("There are multiple workspaces. You must specify one with --api");
        }

        const allWorkspacesSet = new Set(allWorkspaces);
        for (const commandLineWorkspace of commandLineWorkspaces) {
            if (!allWorkspacesSet.has(commandLineWorkspace)) {
                throw new Error("Workspace not found: " + commandLineWorkspace);
            }
        }
    }

    const workspaces = filteredWorkspaces.map((commandLineWorkspace): Workspace => {
        const absolutePath = path.join(fernDirectory, commandLineWorkspace);

        return {
            name: commandLineWorkspace,
            absolutePath,
            workspaceConfigurationFilePath: path.join(
                absolutePath,
                WORKSPACE_CONFIGURATION_FILENAME
            ) as WorkspaceConfigurationFilePath,
        };
    });

    const projectConfig = await loadProjectConfigFromFilepath(path.join(fernDirectory, PROJECT_CONFIG_FILENAME));

    return {
        organization: projectConfig.organization,
        workspaces,
    };
}
