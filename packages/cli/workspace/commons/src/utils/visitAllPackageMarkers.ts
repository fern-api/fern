import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/path-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { FernWorkspace } from "../FernWorkspace";
import { getAllPackageMarkers } from "./getAllPackageMarkers";

export async function visitAllPackageMarkers(
    workspace: FernWorkspace,
    visitor: (filepath: RelativeFilePath, packageMarker: PackageMarkerFileSchema) => void | Promise<void>
): Promise<void> {
    for (const [relativeFilepath, file] of entries(getAllPackageMarkers(workspace.definition))) {
        await visitor(relativeFilepath, file.contents);
    }
}
