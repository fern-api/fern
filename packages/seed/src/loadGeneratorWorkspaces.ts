import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { FernSeedConfig } from "./config/index.js";

export interface CliWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.CliSeedWorkspaceConfiguration;
}

export const SEED_CONFIG_FILENAME = "seed.yml";
export const CLI_SEED_DIRECTORY = "fern-cli";
const CLI_SEED_DIRECTORY_PATH = `packages/seed/${CLI_SEED_DIRECTORY}`;

export async function loadCliWorkspace(): Promise<CliWorkspace> {
    const directory = await findUp(CLI_SEED_DIRECTORY_PATH, { type: "directory" });
    if (directory == null) {
        throw new Error(`Failed to find ${CLI_SEED_DIRECTORY_PATH}`);
    }

    const absolutePathToWorkspace = AbsoluteFilePath.of(directory);
    const seedConfig = await readFile(join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME)));
    const workspaceConfig = yaml.load(seedConfig.toString()) as unknown as FernSeedConfig.CliSeedWorkspaceConfiguration;

    return {
        workspaceName: CLI_SEED_DIRECTORY,
        absolutePathToWorkspace,
        workspaceConfig
    };
}
