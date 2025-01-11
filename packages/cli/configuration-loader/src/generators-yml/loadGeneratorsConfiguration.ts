import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

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
            context.failAndThrow(`Failed to parse ${path.relative(process.cwd(), filepath)}: ${e.reason}`);
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
        rawGeneratorsConfiguration
    });
}

export async function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
}): Promise<AbsoluteFilePath | undefined> {
    const ymlPath = join(absolutePathToWorkspace, RelativeFilePath.of("generators.yml"));
    const yamlPath = join(absolutePathToWorkspace, RelativeFilePath.of("generators.yaml"));

    if (await doesPathExist(ymlPath)) {
        return ymlPath;
    }
    if (await doesPathExist(yamlPath)) {
        return yamlPath;
    }
    return undefined;
}
