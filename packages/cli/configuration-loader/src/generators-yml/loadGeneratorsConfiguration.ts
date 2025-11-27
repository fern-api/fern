import {
    GENERATORS_CONFIGURATION_FILENAME,
    GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE,
    generatorsYml
} from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { convertGeneratorsConfiguration } from "./convertGeneratorsConfiguration";

export async function loadRawGeneratorsConfiguration({
    absolutePathToWorkspace,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<generatorsYml.GeneratorsConfigurationSchema | undefined> {
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (filepath == null) {
        return undefined;
    }

    const contentsStr = await readFile(filepath);
    try {
        const contentsParsed = yaml.load(contentsStr.toString());
        const parsed = generatorsYml.serialization.GeneratorsConfigurationSchema.parse(contentsParsed, {
            allowUnrecognizedEnumValues: false,
            unrecognizedObjectKeys: "fail",
            allowUnrecognizedUnionMembers: false,
            skipValidation: false,
            breadcrumbsPrefix: undefined,
            omitUndefined: false
        });
        if (parsed.ok) {
            return parsed.value;
        }
        // TODO: improve error message
        throw new Error(parsed.errors.map((e) => e.message).join("\n"));
    } catch (e) {
        if (e instanceof yaml.YAMLException) {
            const relativePath = path.relative(process.cwd(), filepath);
            let errorMessage = `Failed to parse ${relativePath}: ${e.reason}`;

            if (e.mark != null) {
                errorMessage += `\n  at line ${e.mark.line + 1}, column ${e.mark.column + 1}`;

                if (e.mark.snippet) {
                    errorMessage += `\n\n${e.mark.snippet}`;
                }
            }

            context.failAndThrow(errorMessage);
        } else {
            throw e;
        }
    }
    return undefined;
}

export async function loadGeneratorsConfiguration({
    absolutePathToWorkspace,
    context
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
}): Promise<generatorsYml.GeneratorsConfiguration | undefined> {
    const rawGeneratorsConfiguration = await loadRawGeneratorsConfiguration({ absolutePathToWorkspace, context });
    if (rawGeneratorsConfiguration == null) {
        return undefined;
    }
    const filepath = await getPathToGeneratorsConfiguration({ absolutePathToWorkspace });
    if (filepath == null) {
        return undefined;
    }
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: filepath,
        rawGeneratorsConfiguration,
        context
    });
}

export async function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<AbsoluteFilePath | undefined> {
    const ymlPath = join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
    const yamlPath = join(absolutePathToWorkspace, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME_ALTERNATIVE));

    if (await doesPathExist(ymlPath)) {
        return ymlPath;
    }
    if (await doesPathExist(yamlPath)) {
        return yamlPath;
    }
    return undefined;
}
