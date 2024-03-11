import { validateSchema } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export async function loadRawGeneratorsConfiguration({
    absolutePathToGeneratorsConfiguration,
    context
}: {
    absolutePathToGeneratorsConfiguration: AbsoluteFilePath;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema> {
    const contentsStr = await readFile(absolutePathToGeneratorsConfiguration);
    const contentsParsed = yaml.load(contentsStr.toString());
    return await validateSchema({
        schema: GeneratorsConfigurationSchema,
        value: contentsParsed,
        context,
        filepathBeingParsed: absolutePathToGeneratorsConfiguration
    });
}
