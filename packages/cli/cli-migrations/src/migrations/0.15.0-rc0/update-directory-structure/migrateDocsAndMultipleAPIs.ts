import { mkdir, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";

import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, join, moveFolder } from "@fern-api/fs-utils";

import { getAbsolutePathToDocsFolder, getAbsolutePathToDocsYaml, loadRawDocsConfiguration } from "./docs-config";
import { convertLegacyDocsConfig } from "./docs-config/convertLegacyDocsConfig";
import {
    convertLegacyGeneratorsConfiguration,
    getAbsolutePathToGeneratorsConfiguration,
    loadRawGeneratorsConfiguration
} from "./generators-configuration";
import { PathModificationStrategy } from "./generators-configuration/convertLegacyGeneratorsConfiguration";
import { migrateDocsInstances } from "./migrateDocsInstances";

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
    workspaceContainingDocs
}: {
    absolutePathToFernDirectory: NewType;
    workspaces: string[];
    workspaceContainingDocs: string;
}): Promise<Promise<Promise<void>>> {
    const absolutePathToApisDirectory = join(absolutePathToFernDirectory, RelativeFilePath.of(APIS_DIRECTORY));
    await mkdir(absolutePathToApisDirectory);
    for (const workspace of workspaces) {
        const absolutePathToWorkspace = join(absolutePathToFernDirectory, RelativeFilePath.of(workspace));

        const docsURLs = await migrateAndWriteGeneratorsYml({ absolutePathToWorkspace });

        if (workspace === workspaceContainingDocs) {
            await migrateAndWriteDocsYml({ absolutePathToWorkspace, docsURLs, apiName: workspaceContainingDocs });
            const absolutePathToDocsFolder = getAbsolutePathToDocsFolder({ absolutePathToWorkspace });
            await moveFolder({ src: absolutePathToDocsFolder, dest: absolutePathToFernDirectory });
            await rm(absolutePathToDocsFolder, { recursive: true });
        }

        const absolutePathToNestedWorkspace = join(absolutePathToApisDirectory, RelativeFilePath.of(workspace));
        await moveFolder({ src: absolutePathToWorkspace, dest: absolutePathToNestedWorkspace });
        await rm(absolutePathToWorkspace, { recursive: true });
    }
}

async function migrateAndWriteGeneratorsYml({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<docsYml.RawSchemas.DocsInstance[]> {
    const generatorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace });
    if (generatorsConfiguration == null) {
        return [];
    }
    const absolutePathToGeneratorsConfiguration = getAbsolutePathToGeneratorsConfiguration({ absolutePathToWorkspace });
    const convertedResponse = convertLegacyGeneratorsConfiguration({
        generatorsConfiguration,
        pathModificationStrategy: PathModificationStrategy.Nest
    });
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(convertedResponse.value));
    return convertedResponse.docsURLs;
}

async function migrateAndWriteDocsYml({
    absolutePathToWorkspace,
    docsURLs,
    apiName
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    docsURLs: docsYml.RawSchemas.DocsInstance[];
    apiName: string;
}): Promise<void> {
    const docsConfiguration = await loadRawDocsConfiguration({ absolutePathToWorkspace });
    if (docsConfiguration == null) {
        return;
    }
    const convertedDocsConfig = convertLegacyDocsConfig({
        docsConfiguration,
        docsURLs: migrateDocsInstances(docsURLs),
        apiName
    });
    const absolutePathToDocsConfig = getAbsolutePathToDocsYaml({ absolutePathToWorkspace });
    await writeFile(absolutePathToDocsConfig, yaml.dump(convertedDocsConfig));
}
