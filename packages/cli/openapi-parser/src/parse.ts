import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FileId, OpenAPIFile, OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/ir";
import { parseDefinition } from "./parseDefinition";

export interface RawOpenAPIDefinition {
    file: RawOpenAPIFile | undefined;
    subDirectories: RawOpenAPIDefinition[];
}

export interface RawOpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    /* relative filepath from the root of the definition */
    relativeFilepath: RelativeFilePath;
    contents: string;
}

export async function parse({
    root,
    taskContext,
}: {
    root: RawOpenAPIDefinition;
    taskContext: TaskContext;
}): Promise<OpenAPIIntermediateRepresentation> {
    const files: Record<FileId, OpenAPIFile> = {};
    const rootPackage = await parseDefinition({ definition: root, taskContext, files });
    return {
        files,
        rootPackage,
    };
}
