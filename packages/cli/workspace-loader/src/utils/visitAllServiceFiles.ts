import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { ServiceFileSchema } from "@fern-api/yaml-schema";
import path from "path";
import { Workspace } from "../types/Workspace";
import { getAllServiceFiles } from "./getAllServiceFiles";

export async function visitAllServiceFiles(
    workspace: Workspace,
    visitor: (
        filepath: RelativeFilePath,
        serviceFile: ServiceFileSchema,
        metadata: { isPackageMarker: boolean }
    ) => void | Promise<void>
): Promise<void> {
    for (const [relativeFilepath, file] of entries(getAllServiceFiles(workspace.definition))) {
        await visitor(relativeFilepath, file.contents, {
            isPackageMarker: path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME,
        });
    }
}
