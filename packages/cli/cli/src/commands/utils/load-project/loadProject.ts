import { dirname, join, RelativeFilePath } from "@fern-api/core-utils";
import {
    getFernDirectory,
    loadProjectConfig,
    loadProjectConfigFromFilepath,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "../../generate-ir/handleFailedWorkspaceParserResult";
import { getWorkspaceConfigurationPaths } from "./getWorkspaceConfigurationPaths";

export interface Project {
    organization: string;
    workspaces: Workspace[];
}

export async function loadProject({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const v2Project = await loadProjectV2({ commandLineWorkspaces });
    if (v2Project != null) {
        if (v2Project.workspaces.length === 0) {
            throw new Error("No workspaces found");
        }
        return v2Project;
    }
    return loadProjectV1({ commandLineWorkspaces });
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
                    absolutePathToWorkspace: dirname(workspaceConfigurationPath),
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
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return undefined;
    }

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
                version: 2,
            });
            if (!workspace.didSucceed) {
                handleFailedWorkspaceParserResult(workspace);
                throw new Error("Failed to parse workspace");
            }
            return workspace.workspace;
        })
    );

    const { organization } = await loadProjectConfigFromFilepath(
        join(fernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME))
    );

    return {
        workspaces: maybeFilterWorkspaces({ allWorkspaces, commandLineWorkspaces }),
        organization,
    };
}

function maybeFilterWorkspaces({
    allWorkspaces,
    commandLineWorkspaces,
}: {
    allWorkspaces: readonly Workspace[];
    commandLineWorkspaces: readonly string[];
}): Workspace[] {
    if (commandLineWorkspaces.length === 0) {
        if (allWorkspaces.length > 1) {
            throw new Error("There are multiple workspaces. You must specify one with --api");
        }
        return [...allWorkspaces];
    }

    return commandLineWorkspaces.reduce<Workspace[]>((all, workspaceName) => {
        const workspace = allWorkspaces.find((workspace) => workspace.name === workspaceName);
        if (workspace == null) {
            throw new Error(`Workspace ${workspaceName} not found`);
        }
        return [...all, workspace];
    }, []);
}
