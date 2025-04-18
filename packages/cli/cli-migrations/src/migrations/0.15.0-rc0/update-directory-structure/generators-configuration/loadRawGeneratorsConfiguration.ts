import { readFile } from "fs/promises";
import yaml from "js-yaml";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { LegacyGenerators } from ".";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<LegacyGenerators.GeneratorsConfigurationSchema | undefined> {
    const filepath = getAbsolutePathToGeneratorsConfiguration({ absolutePathToWorkspace });
    const contentsStr = await readFile(filepath);
    const contentsParsed = yaml.load(contentsStr.toString());
    const result = await LegacyGenerators.GeneratorsConfigurationSchema.safeParseAsync(contentsParsed);
    if (result.success) {
        return result.data;
    }
    return undefined;
}

const GENERATORS_YML = "generators.yml";

export function getAbsolutePathToGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_YML));
}
