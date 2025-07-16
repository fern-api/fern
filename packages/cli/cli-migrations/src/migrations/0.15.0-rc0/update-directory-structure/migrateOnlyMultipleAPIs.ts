import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath, RelativeFilePath, join, moveFolder } from "@fern-api/fs-utils";

import { getAbsolutePathToGeneratorsConfiguration, loadRawGeneratorsConfiguration } from "./generators-configuration";
import {
    PathModificationStrategy,
    convertLegacyGeneratorsConfiguration
} from "./generators-configuration/convertLegacyGeneratorsConfiguration";

const APIS_DIRECTORY = "apis";

/**
 * fern/  <------ path to fern directory
 *   api/ <------ path to workspace
 *    definition/...
 *    generators.yml
 *   api1/ <----- path to workspace
 *    definition/...
 *    generators.yml
 *   api2/
 *    definition/...
 *    generators.yml
 *
 * This function migrates generators.yml to the new format, and then moves
 * every workspace inside an apis directory.
 */
export async function migrateOnlyMultipleAPIs({
    absolutePathToFernDirectory,
    workspaces
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    workspaces: string[];
}): Promise<void> {
    const absolutePathToApisDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    await mkdir(absolutePathToApisDirectory);
    for (const workspace of workspaces) {
        const absolutePathToWorkspace = join(absolutePathToFernDirectory, RelativeFilePath.of(workspace));
        await migrateAndWriteGeneratorsYml({ absolutePathToWorkspace });

        const absolutePathToNestedWorkspace = join(absolutePathToApisDirectory, RelativeFilePath.of(workspace));
        await moveFolder({ src: absolutePathToWorkspace, dest: absolutePathToNestedWorkspace });

        await rm(absolutePathToWorkspace, { recursive: true });
    }
}

async function migrateAndWriteGeneratorsYml({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<void> {
    const generatorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace });
    if (generatorsConfiguration == null) {
        return;
    }
    const absolutePathToGeneratorsConfiguration = getAbsolutePathToGeneratorsConfiguration({ absolutePathToWorkspace });
    const convertedResponse = convertLegacyGeneratorsConfiguration({
        generatorsConfiguration,
        pathModificationStrategy: PathModificationStrategy.Nest
    });
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(convertedResponse.value));
}
