import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import { FernWorkspace } from "../types/Workspace";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles";

export async function getDefinitionFile(
    workspace: FernWorkspace,
    relativeFilepath: RelativeFilePath
): Promise<DefinitionFileSchema | undefined> {
    return getAllDefinitionFiles(await workspace.getDefinition())[relativeFilepath]?.contents;
}
