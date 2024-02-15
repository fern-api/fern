import { validateSchema } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GENERATORS_CONFIGURATION_FILENAME } from "@fern-api/project-configuration";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration";
import { GeneratorsConfiguration } from "./GeneratorsConfiguration";
import { GeneratorsConfigurationSchema } from "./schemas/GeneratorsConfigurationSchema";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<GeneratorsConfigurationSchema | undefined> {
    const filepath = getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (!(await doesPathExist(filepath))) {
        return undefined;
    }
    const contentsStr = await readFile(filepath);
    const contentsParsed = yaml.load(contentsStr.toString());
    return validateSchema({
        schema: GeneratorsConfigurationSchema,
        value: contentsParsed,
        context,
        filepathBeingParsed: filepath
    });
}

export async function loadGeneratorsConfiguration({
    absolutePathToWorkspace,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<GeneratorsConfiguration | undefined> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace, context });
    if (rawGeneratorsConfiguration == null) {
        return undefined;
    }
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: getPathToGeneratorsConfiguration({ absolutePathToWorkspace }),
        rawGeneratorsConfiguration
    });
}

export function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
}
