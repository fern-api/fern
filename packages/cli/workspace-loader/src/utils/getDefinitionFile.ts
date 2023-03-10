import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { FernWorkspace } from "../types/Workspace";
import { getAllNamedDefinitionFiles } from "./getAllNamedDefinitionFiles";

export function getDefinitionFile(
    workspace: FernWorkspace,
    relativeFilepath: RelativeFilePath
): DefinitionFileSchema | undefined {
    return getAllNamedDefinitionFiles(workspace.definition)[relativeFilepath]?.contents;
}
