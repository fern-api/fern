import { rmdir, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath, moveFolder } from "@fern-api/fs-utils";

import {
    convertLegacyGeneratorsConfiguration,
    getAbsolutePathToGeneratorsConfiguration,
    loadRawGeneratorsConfiguration
} from "./generators-configuration";

/**
 * fern/  <------ path to fern directory
 *   api/ <------ path to workspace
 *    definition/...
 *    generatiors.yml
 *
 * This function moves everything from the workspace directory into the fern directory.
 */
export async function migrateOnlySingleAPI({
    absolutePathToFernDirectory,
    absolutePathToWorkspace
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<void> {
    await migrateAndWriteGeneratorsYml({ absolutePathToWorkspace });
    await moveFolder({ src: absolutePathToWorkspace, dest: absolutePathToFernDirectory });
    await rmdir(absolutePathToWorkspace, { recursive: true });
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
        pathModificationStrategy: "MoveUp"
    });
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(convertedResponse.value));
}
