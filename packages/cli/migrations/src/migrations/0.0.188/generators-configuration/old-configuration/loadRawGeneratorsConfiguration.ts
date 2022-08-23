import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath } from "@fern-api/core-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export async function loadRawGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
}): Promise<GeneratorsConfigurationSchema> {
    const contentsStr = await readFile(absolutePathToGeneratorsConfiguration);
    const contentsParsed = yaml.load(contentsStr.toString());
    return await validateSchema(GeneratorsConfigurationSchema, contentsParsed);
}
