import { RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIFile, OpenAPISubPackage } from "@fern-fern/openapi-ir-model/ir";
import { RawOpenAPIDefinition } from "./parse";
import { parseFile } from "./parseFile";

export async function parseDefinition({
    definition,
    taskContext,
    files,
}: {
    definition: RawOpenAPIDefinition;
    taskContext: TaskContext;
    files: Record<string, OpenAPIFile>;
}): Promise<OpenAPISubPackage> {
    const subpackage: OpenAPISubPackage = {
        file: undefined,
        name: definition.file?.relativeFilepath != null ? getNameFromFilepath(definition.file.relativeFilepath) : "",
        subpackages: [],
    };
    if (definition.file != null) {
        const parsedFile = await parseFile({
            absoluteFilePath: definition.file.absoluteFilepath,
            relativeFilepath: definition.file.relativeFilepath,
            taskContext,
        });
        files[parsedFile.id] = parsedFile.file;
        subpackage.file = parsedFile.id;
    }
    for (const subdir of definition.subDirectories) {
        const subpackage = await parseDefinition({
            definition: subdir,
            taskContext,
            files,
        });
        subpackage.subpackages.push(subpackage);
    }
    return subpackage;
}

function getNameFromFilepath(filepath: RelativeFilePath): string {
    const splitFilepath = filepath.split("/");
    if (splitFilepath.length === 0 || splitFilepath.length === 1) {
        return "";
    }
    const folder = splitFilepath[splitFilepath.length - 1];
    return folder ?? "";
}
