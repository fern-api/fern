import {
    loadProjectConfig,
    loadProjectConfigFromFilepath,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import { findUp } from "find-up";
import { readdir } from "fs/promises";
import path from "path";
import { handleFailedWorkspaceParserResult } from "../../generate-ir/handleFailedWorkspaceParserResult";
import { getWorkspaceConfigurationPaths } from "./getWorkspaceConfigurationPaths";

const FERN_DIRECTORY = ".fern";

export interface Project {
    organization: string;
    workspaces: Workspace[];
}

export async function loadProject({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const v1Project = await loadProjectV1({ commandLineWorkspaces });
    if (v1Project.workspaces.length > 0) {
        return v1Project;
    }
    const v2Project = await loadProjectV2({ commandLineWorkspaces });
    if (v2Project == null || v2Project.workspaces.length === 0) {
        throw new Error("No workspaces found");
    }
    return v2Project;
}

async function loadProjectV1({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const projectConfig = await loadProjectConfig();

    const workspaceConfigurationPaths = await getWorkspaceConfigurationPaths({
        commandLineWorkspaces,
        projectConfig,
    });

    return {
        organization: projectConfig.organization,
        workspaces: await Promise.all(
            workspaceConfigurationPaths.map(async (workspaceConfigurationPath) => {
                const workspace = await loadWorkspace({
                    absolutePathToWorkspace: path.dirname(workspaceConfigurationPath),
                    version: 1,
                });
                if (!workspace.didSucceed) {
                    handleFailedWorkspaceParserResult(workspace);
                    throw new Error("Failed to parse workspace");
                }
                return workspace.workspace;
            })
        ),
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
        filteredWorkspaces = commandLineWorkspaces.map((commandLineWorkspace) => path.resolve(commandLineWorkspace));
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

    const workspaces = await Promise.all(
        filteredWorkspaces.map(async (absolutePathToWorkspace) => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace,
                version: 2,
            });
            if (!workspace.didSucceed) {
                handleFailedWorkspaceParserResult(workspace);
                throw new Error("Failed to parse workspace");
            }
            return workspace.workspace;
        })
    );

    const projectConfig = await loadProjectConfigFromFilepath(path.join(fernDirectory, PROJECT_CONFIG_FILENAME));

    return {
        organization: projectConfig.organization,
        workspaces,
    };
}
