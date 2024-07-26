import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import path from "path";
import { FernWorkspace } from "../workspaces";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles";

export async function visitAllDefinitionFiles(
    workspace: FernWorkspace,
    visitor: (
        filepath: RelativeFilePath,
        definitionFile: DefinitionFileSchema,
        metadata: { isPackageMarker: boolean; defaultUrl: string | undefined }
    ) => void | Promise<void>
): Promise<void> {
    for (const [relativeFilepath, file] of entries(getAllDefinitionFiles(workspace.definition))) {
        await visitor(relativeFilepath, file.contents, {
            isPackageMarker: path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME,
            defaultUrl: file.defaultUrl
        });
    }
}
