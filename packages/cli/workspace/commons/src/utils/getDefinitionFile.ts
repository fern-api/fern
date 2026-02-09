import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { FernWorkspace } from "../FernWorkspace.js";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles.js";

export function getDefinitionFile(
    workspace: FernWorkspace,
    relativeFilepath: RelativeFilePath
): DefinitionFileSchema | undefined {
    return getAllDefinitionFiles(workspace.definition)[relativeFilepath]?.contents;
}
