import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { FernWorkspace } from "../types/Workspace";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles";

export function getDefinitionFile(
    workspace: FernWorkspace,
    relativeFilepath: RelativeFilePath
): DefinitionFileSchema | undefined {
    return getAllDefinitionFiles(workspace.definition)[relativeFilepath]?.contents;
}
