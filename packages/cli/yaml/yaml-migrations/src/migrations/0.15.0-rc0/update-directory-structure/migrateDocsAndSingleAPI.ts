import { AbsoluteFilePath, join, moveFolder, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { DocsURL, LegacyDocs, LegacyDocsSerializers } from "./docs-config";
import { convertLegacyDocsConfig } from "./docs-config/convertLegacyDocsConfig";
import { getAbsolutePathToGeneratorsConfiguration, loadRawGeneratorsConfiguration } from "./generators-configuration";
import { convertLegacyGeneratorsConfiguration } from "./generators-configuration/convertLegacyGeneratorsConfiguration";

/**
 * fern/  <------ path to fern directory
 *   api/ <------ path to workspace
 *    definition/...
 *    generatiors.yml
 *    docs.yml
 *
 * This function migrates docs.yml and generators.yml to the new format, and then moves
 * everything in the workspace directory up one level.
 */
export async function migrateDocsAndSingleAPI({
    absolutePathToFernDirectory,
    absolutePathToWorkspace,
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<void> {
    const docsURLs = await migrateAndWriteGeneratorsYml({ absolutePathToWorkspace });
    await migrateAndWriteDocsYml({ absolutePathToWorkspace, docsURLs });
    await moveFolder({ src: absolutePathToWorkspace, dest: absolutePathToFernDirectory });
}

async function migrateAndWriteDocsYml({
    absolutePathToWorkspace,
    docsURLs,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    docsURLs: DocsURL[];
}): Promise<void> {
    const docsConfiguration = await loadRawDocsConfiguration({ absolutePathToWorkspace });
    if (docsConfiguration == null) {
        return;
    }
    const convertedDocsConfig = convertLegacyDocsConfig({
        docsConfiguration,
        docsURLs,
    });
    const absolutePathToDocsConfig = getAbsolutePathToDocsConfiguration({ absolutePathToWorkspace });
    await writeFile(absolutePathToDocsConfig, yaml.dump(convertedDocsConfig));
}

async function loadRawDocsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<LegacyDocs.DocsConfiguration | undefined> {
    const filepath = getAbsolutePathToDocsConfiguration({ absolutePathToWorkspace });
    const contentsStr = await readFile(filepath);
    const contentsParsed = yaml.load(contentsStr.toString());
    const result = await LegacyDocsSerializers.DocsConfiguration.parse(contentsParsed);
    if (result.ok) {
        return result.value;
    }
    return undefined;
}

const DOCS_YML = "docs.yml";

function getAbsolutePathToDocsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}) {
    return join(absolutePathToWorkspace, RelativeFilePath.of(DOCS_YML));
}

async function migrateAndWriteGeneratorsYml({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<DocsURL[]> {
    const generatorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace });
    if (generatorsConfiguration == null) {
        return [];
    }
    const absolutePathToGeneratorsConfiguration = getAbsolutePathToGeneratorsConfiguration({ absolutePathToWorkspace });
    const convertedResponse = convertLegacyGeneratorsConfiguration({
        generatorsConfiguration,
        pathModificationStrategy: "MoveUp",
    });
    await writeFile(absolutePathToGeneratorsConfiguration, yaml.dump(convertedResponse.value));
    return convertedResponse.docsURLs;
}
