import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { readdir, readFile } from "fs/promises";
import yaml from "js-yaml";
import { FernSeedConfig } from "./config";

export interface GeneratorWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.SeedWorkspaceConfiguration;
}

export const SEED_DIRECTORY = "seed";
export const SEED_CONFIG_FILENAME = "seed.yml";

export async function loadGeneratorWorkspaces(): Promise<GeneratorWorkspace[]> {
    const seedDirectory = await getSeedDirectory();

    if (seedDirectory == null) {
        throw new Error("Failed to find seed folder");
    }

    const seedDirectoryContents = await readdir(seedDirectory, { withFileTypes: true });

    const workspaceDirectoryNames = seedDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory()) {
            all.push(item.name);
        }
        return all;
    }, []);

    const workspaces: GeneratorWorkspace[] = [];

    for (const workspace of workspaceDirectoryNames) {
        const absolutePathToWorkspace = join(seedDirectory, RelativeFilePath.of(workspace));
        const seedConfig = await readFile(join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME)));
        workspaces.push({
            absolutePathToWorkspace,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            workspaceConfig: yaml.load(seedConfig.toString()) as any as FernSeedConfig.SeedWorkspaceConfiguration,
            workspaceName: workspace
        });
    }

    return workspaces;
}

async function getSeedDirectory(): Promise<AbsoluteFilePath | undefined> {
    const seedDirectoryStr = await findUp(SEED_DIRECTORY, { type: "directory" });
    if (seedDirectoryStr == null) {
        return undefined;
    }
    return AbsoluteFilePath.of(seedDirectoryStr);
}
