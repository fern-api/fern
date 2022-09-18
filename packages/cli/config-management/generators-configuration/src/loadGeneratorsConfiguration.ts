import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export async function loadRawGeneratorsConfiguration({
    pathToWorkspace,
}: {
    pathToWorkspace: AbsoluteFilePath;
}): Promise<GeneratorsConfigurationSchema> {
    const contentsStr = await readFile(getPathToGeneratorsConfiguration({ pathToWorkspace }));
    const contentsParsed = yaml.load(contentsStr.toString());
    return await validateSchema(GeneratorsConfigurationSchema, contentsParsed);
}

export async function loadGeneratorsConfiguration({
    pathToFernDirectory,
    pathToWorkspace,
}: {
    pathToFernDirectory: AbsoluteFilePath;
    pathToWorkspace: AbsoluteFilePath;
}): Promise<GeneratorsConfiguration> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({ pathToWorkspace });
    return convertGeneratorsConfiguration({
        pathToFernDirectory,
        pathToGeneratorsConfiguration: getPathToGeneratorsConfiguration({ pathToWorkspace }),
        rawGeneratorsConfiguration,
    });
}

function getPathToGeneratorsConfiguration({
    pathToWorkspace,
}: {
    pathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(pathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
}
