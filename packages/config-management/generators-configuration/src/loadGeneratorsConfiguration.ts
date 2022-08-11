import { validateSchema } from "@fern-api/config-management-commons";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";
import { substituteEnvVariables } from "./substituteEnvVariables";

export const GENERATORS_CONFIGURATION_FILENAME = "generators.yml";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: string;
}): Promise<GeneratorsConfigurationSchema> {
    const contentsStr = await readFile(getPathToGeneratorsConfiguration({ absolutePathToWorkspace }));
    const contentsParsed = substituteEnvVariables(yaml.load(contentsStr.toString()));
    return await validateSchema(GeneratorsConfigurationSchema, contentsParsed);
}

export async function loadGeneratorsConfiguration({
    absolutePathToWorkspace,
}: {
    absolutePathToWorkspace: string;
}): Promise<GeneratorsConfiguration> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace });
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: getPathToGeneratorsConfiguration({ absolutePathToWorkspace }),
        rawGeneratorsConfiguration,
    });
}

function getPathToGeneratorsConfiguration({ absolutePathToWorkspace }: { absolutePathToWorkspace: string }): string {
    return path.join(absolutePathToWorkspace, GENERATORS_CONFIGURATION_FILENAME);
}
