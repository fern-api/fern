import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { entries } from "@fern-api/core-utils";
import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/path-utils";
import { basename } from "@fern-api/path-utils";

import { FernWorkspace } from "../FernWorkspace";
import { getAllDefinitionFiles } from "./getAllDefinitionFiles";

export function visitAllDefinitionFiles(
    workspace: FernWorkspace,
    visitor: (
        filepath: RelativeFilePath,
        definitionFile: DefinitionFileSchema,
        metadata: { isPackageMarker: boolean; defaultUrl: string | undefined }
    ) => void
): void {
    for (const [relativeFilepath, file] of entries(getAllDefinitionFiles(workspace.definition))) {
        visitor(relativeFilepath, file.contents, {
            isPackageMarker: basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME,
            defaultUrl: file.defaultUrl
        });
    }
}
