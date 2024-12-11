import { entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/path-utils";
import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { FernWorkspace } from "../FernWorkspace";
import { getAllPackageMarkers } from "./getAllPackageMarkers";

export function visitAllPackageMarkers(
    workspace: FernWorkspace,
    visitor: (filepath: RelativeFilePath, packageMarker: PackageMarkerFileSchema) => void
): void {
    for (const [relativeFilepath, file] of entries(getAllPackageMarkers(workspace.definition))) {
        visitor(relativeFilepath, file.contents);
    }
}
