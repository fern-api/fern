import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { DefinitionFileSchema } from "@fern-api/yaml-schema";
import path from "path";
import { FernWorkspace } from "../types/Workspace";
import { getAllNamedDefinitionFiles } from "./getAllNamedDefinitionFiles";
import { getAllPackageMarkers } from "./getAllPackageMarkers";

export async function visitAllDefinitionFiles(
    workspace: FernWorkspace,
    visitor: (
        filepath: RelativeFilePath,
        definitionFile: DefinitionFileSchema,
        metadata: { isPackageMarker: boolean }
    ) => void | Promise<void>
): Promise<void> {
    for (const [relativeFilepath, file] of entries({
        ...getAllPackageMarkers(workspace.definition),
        ...getAllNamedDefinitionFiles(workspace.definition),
    })) {
        await visitor(relativeFilepath, file.contents, {
            isPackageMarker: path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME,
        });
    }
}
