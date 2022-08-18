import { join, RelativeFilePath } from "@fern-api/core-utils";
import {
    FERN_DIRECTORY,
    getFernDirectory,
    loadProjectConfigFromFilepath,
    PROJECT_CONFIG_FILENAME,
} from "@fern-api/project-configuration";
import { loadWorkspace, Workspace } from "@fern-api/workspace-loader";
import { readdir } from "fs/promises";
import { handleFailedWorkspaceParserResult } from "../../generate-ir/handleFailedWorkspaceParserResult";

export interface Project {
    organization: string;
    workspaces: Workspace[];
}

export async function loadProject({
    commandLineWorkspaces,
}: {
    commandLineWorkspaces: readonly string[];
}): Promise<Project> {
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        throw new Error(`No ${FERN_DIRECTORY} directory found.`);
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
