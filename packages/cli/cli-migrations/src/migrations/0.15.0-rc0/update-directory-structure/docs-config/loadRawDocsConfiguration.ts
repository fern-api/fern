import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { LegacyDocs, LegacyDocsSerializers } from ".";

export async function loadRawDocsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<LegacyDocs.DocsConfiguration | undefined> {
    const filepath = getAbsolutePathToDocsYaml({ absolutePathToWorkspace });
    const contentsStr = await readFile(filepath);
    const contentsParsed = yaml.load(contentsStr.toString());
    const result = await LegacyDocsSerializers.DocsConfiguration.parse(contentsParsed);
    if (result.ok) {
        return result.value;
    }
    return undefined;
}

const DOCS_FOLDER = "docs";
const DOCS_YML = "docs.yml";

export function getAbsolutePathToDocsYaml({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(getAbsolutePathToDocsFolder({ absolutePathToWorkspace }), RelativeFilePath.of(DOCS_YML));
}

export function getAbsolutePathToDocsFolder({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, RelativeFilePath.of(DOCS_FOLDER));
}
