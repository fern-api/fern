import { generatorsYml } from "@fern-api/configuration";
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
    const filepathYml = getPathToGeneratorsConfiguration({ absolutePathToWorkspace, extension: "yml" });
    const filepathYaml = getPathToGeneratorsConfiguration({ absolutePathToWorkspace, extension: "yaml" });

    let filepath: AbsoluteFilePath;
    if (await doesPathExist(filepathYml)) {
        filepath = filepathYml;
    } else if (await doesPathExist(filepathYaml)) {
        filepath = filepathYaml;
    } else {
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
    const filepathYml = getPathToGeneratorsConfiguration({ absolutePathToWorkspace, extension: "yml" });
    const filepathYaml = getPathToGeneratorsConfiguration({ absolutePathToWorkspace, extension: "yaml" });
    const filepath = (await doesPathExist(filepathYml)) ? filepathYml : filepathYaml;
    return convertGeneratorsConfiguration({
        absolutePathToGeneratorsConfiguration: filepath,
        rawGeneratorsConfiguration
    });
}

export function getPathToGeneratorsConfiguration({
    absolutePathToWorkspace,
    extension
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    extension: "yml" | "yaml";
}): AbsoluteFilePath {
    return join(absolutePathToWorkspace, RelativeFilePath.of(`generators.${extension}`));
}
