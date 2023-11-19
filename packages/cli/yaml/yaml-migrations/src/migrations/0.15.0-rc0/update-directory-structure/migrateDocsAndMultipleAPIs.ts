import { AbsoluteFilePath, join, moveFile, moveFolder, RelativeFilePath } from "@fern-api/fs-utils";
import { mkdir, writeFile } from "fs/promises";
import yaml from "js-yaml";
import {
    convertLegacyGeneratorsConfiguration,
    getAbsolutePathToGeneratorsConfiguration,
    loadRawGeneratorsConfiguration,
} from "./generators-configuration";
import { PathModificationStrategy } from "./generators-configuration/convertLegacyGeneratorsConfiguration";
import { getPathToDocsYaml } from "./migration";

const APIS_DIRECTORY = "apis";

type NewType = AbsoluteFilePath;

/**
 * fern/  <------ path to fern directory
 *   api/ <------ path to workspace
 *    definition/...
 *    generators.yml
 *   api1/ <----- path to workspace
 *    definition/...
 *    generators.yml
 *    docs.yml <------- docs.yml
 *   api2/
 *    definition/...
 *    generators.yml
 *
 * This function migrates generators.yml to the new format, and then moves
 * every workspace inside an apis directory.
 */
export async function migrateDocsAndMultipleAPIs({
    absolutePathToFernDirectory,
    workspaces,
    workspaceContainingDocs,
}: {
    absolutePathToFernDirectory: NewType;
    workspaces: string[];
    workspaceContainingDocs: string;
}): Promise<Promise<Promise<void>>> {
    const absolutePathToApisDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    await mkdir(absolutePathToApisDirectory);
    for (const workspace of workspaces) {
        const absolutePathToWorkspace = join(absolutePathToFernDirectory, RelativeFilePath.of(workspace));
        if (workspace === workspaceContainingDocs) {
            const absolutePathToDocsConfig = getPathToDocsYaml({ absolutePathToWorkspace });
            await moveFile({
                src: absolutePathToDocsConfig,
                dest: join(absolutePathToFernDirectory, RelativeFilePath.of("docs.yml")),
            });
        }
        await migrateAndWriteGeneratorsYml({ absolutePathToWorkspace });

        const absolutePathToNestedWorkspace = join(absolutePathToApisDirectory, RelativeFilePath.of(workspace));
        await moveFolder({ src: absolutePathToWorkspace, dest: absolutePathToNestedWorkspace });
    }
}

async function migrateAndWriteGeneratorsYml({
    absolutePathToWorkspace,
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
        pathModificationStrategy: PathModificationStrategy.Nest,
    });
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(convertedResponse.value));
}
