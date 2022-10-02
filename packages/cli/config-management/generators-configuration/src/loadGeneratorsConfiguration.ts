import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join } from "@fern-api/core-utils";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<GeneratorsConfigurationSchema> {
    const contentsStr = await readFile(getPathToGeneratorsConfiguration({ absolutePathToWorkspace }));
    const contentsParsed = yaml.load(contentsStr.toString());
    return await validateSchema(GeneratorsConfigurationSchema, contentsParsed);
}

export async function loadGeneratorsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<GeneratorsConfiguration> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace });
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: getPathToGeneratorsConfiguration({ absolutePathToWorkspace }),
        rawGeneratorsConfiguration,
    });
}

function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, GENERATORS_CONFIGURATION_FILENAME);
}
