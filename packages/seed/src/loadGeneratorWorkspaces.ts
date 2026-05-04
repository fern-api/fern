import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { findUp } from "find-up";
import { access, readdir, readFile } from "fs/promises";
import yaml from "js-yaml";

import { FernSeedConfig } from "./config/index.js";

export interface GeneratorWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.SeedWorkspaceConfiguration;
}

export interface CliWorkspace {
    workspaceName: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceConfig: FernSeedConfig.CliSeedWorkspaceConfiguration;
}

export const SEED_DIRECTORY = "seed";
export const SEED_CONFIG_FILENAME = "seed.yml";
export const CLI_SEED_DIRECTORY = "fern-cli";

export async function loadGeneratorWorkspaces(): Promise<GeneratorWorkspace[]> {
    const seedDirectory = await getSeedDirectory();

    if (seedDirectory == null) {
        throw new Error("Failed to find seed folder");
    }

    const seedDirectoryContents = await readdir(seedDirectory, { withFileTypes: true });

    const workspaceDirectoryNames = seedDirectoryContents.reduce<string[]>((all, item) => {
        if (item.isDirectory() && item.name !== CLI_SEED_DIRECTORY) {
            all.push(item.name);
        }
        return all;
    }, []);

    const workspaces: GeneratorWorkspace[] = [];

    for (const workspace of workspaceDirectoryNames) {
        const absolutePathToWorkspace = join(seedDirectory, RelativeFilePath.of(workspace));
        const seedConfigPath = join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME));
        try {
            await access(seedConfigPath);
        } catch {
            CONSOLE_LOGGER.warn(`Skipping ${workspace}: no ${SEED_CONFIG_FILENAME} found`);
            continue;
        }
        const seedConfig = await readFile(seedConfigPath);
        const workspaceConfig = yaml.load(
            seedConfig.toString()
        ) as unknown as FernSeedConfig.SeedWorkspaceConfiguration;
        if (workspaceConfig.disabled === true) {
            // Use warn (stderr) so that commands emitting machine-readable output
            // on stdout (e.g. `seed affected --json`) remain parseable.
            CONSOLE_LOGGER.warn(`Skipping ${workspace}: disabled in ${SEED_CONFIG_FILENAME}`);
            continue;
        }
        workspaces.push({
            absolutePathToWorkspace,
            workspaceConfig,
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

export async function getFernCliSeedDirectory(): Promise<AbsoluteFilePath | undefined> {
    const seedDirectoryStr = await findUp(SEED_DIRECTORY, { type: "directory" });
    if (seedDirectoryStr == null) {
        return undefined;
    }
    return join(AbsoluteFilePath.of(seedDirectoryStr), RelativeFilePath.of(CLI_SEED_DIRECTORY));
}

export async function loadCliWorkspace(): Promise<CliWorkspace> {
    const seedDirectory = await getSeedDirectory();

    if (seedDirectory == null) {
        throw new Error("Failed to find seed folder");
    }

    const absolutePathToWorkspace = join(seedDirectory, RelativeFilePath.of(CLI_SEED_DIRECTORY));
    const seedConfig = await readFile(join(absolutePathToWorkspace, RelativeFilePath.of(SEED_CONFIG_FILENAME)));
    const workspaceConfig = yaml.load(seedConfig.toString()) as unknown as FernSeedConfig.CliSeedWorkspaceConfiguration;

    return {
        workspaceName: CLI_SEED_DIRECTORY,
        absolutePathToWorkspace,
        workspaceConfig
    };
}
