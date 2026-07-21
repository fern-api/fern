import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";

import { FernWorkspace } from "../FernWorkspace.js";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles.js";

const definitionFilesByWorkspace = new WeakMap<FernWorkspace, ReturnType<typeof getAllDefinitionFiles>>();

export function getDefinitionFile(
    workspace: FernWorkspace,
    relativeFilepath: RelativeFilePath
): DefinitionFileSchema | undefined {
    // FernWorkspace.definition is readonly, so this cache is stable for the workspace lifetime.
    let definitionFiles = definitionFilesByWorkspace.get(workspace);
    if (definitionFiles == null) {
        definitionFiles = getAllDefinitionFiles(workspace.definition);
        definitionFilesByWorkspace.set(workspace, definitionFiles);
    }
    return definitionFiles[relativeFilepath]?.contents;
}
