import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";

export interface RemoteVsLocalWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: RemoteVsLocalConfig;
}

export interface RemoteVsLocalConfig {
    displayName: string;
    image: string;
    changelogLocation: string;
    test: {
        docker: {
            image: string;
        };
    };
    language: string;
    generatorType: string;
    defaultOutputMode: string;
    remoteVsLocalFixtures?: string[];
}

export const SEED_REMOTE_LOCAL_DIRECTORY = "seed-remote-local";
export const SEED_CONFIG_FILENAME = "seed.yml";

export async function loadRemoteVsLocalWorkspaces(): Promise<RemoteVsLocalWorkspace[]> {
    const seedRemoteLocalDirectory = await getSeedRemoteLocalDirectory();

    if (seedRemoteLocalDirectory == null) {
        throw new Error("Failed to find seed-remote-local folder");
    }

    const dirContents = await readdir(seedRemoteLocalDirectory, { withFileTypes: true });

    const workspaceDirectoryNames = dirContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    const workspaces: RemoteVsLocalWorkspace[] = [];

    for (const workspace of workspaceDirectoryNames) {
        const absolutePathToWorkspace = join(seedRemoteLocalDirectory, RelativeFilePath.of(workspace));
        const seedConfigPath = join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME));

        try {
            const seedConfig = await readFile(seedConfigPath);
            const config = yaml.load(seedConfig.toString()) as unknown as RemoteVsLocalConfig;

            // Only include workspaces that have remoteVsLocalFixtures defined
            if (config.remoteVsLocalFixtures && config.remoteVsLocalFixtures.length > 0) {
                workspaces.push({
                    absolutePathToWorkspace,
                    workspaceConfig: config,
                    workspaceName: workspace
                });
            }
        } catch (error) {
            console.warn(`Warning: Could not load config for ${workspace}:`, error);
        }
    }

    return workspaces;
}

async function getSeedRemoteLocalDirectory(): Promise<AbsoluteFilePath | undefined> {
    const repoRoot = await findUp(".git", { type: "directory" });
    if (repoRoot == null) {
        return undefined;
    }

    const repoRootPath = AbsoluteFilePath.of(repoRoot).slice(0, -4); // Remove '/.git'
    return join(AbsoluteFilePath.of(repoRootPath), RelativeFilePath.of(SEED_REMOTE_LOCAL_DIRECTORY));
}
