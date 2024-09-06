import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { Entries, entries } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema } from "@fern-api/fern-definition-schema";
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
    const sortedDefinitionFiles = entries(getAllDefinitionFiles(workspace.definition)).sort(([a], [b]) => {
        // Sort by length first, then by alphabetical order.
        // This ensures subpackage files are visited _before_
        // their nested subpackages (if any).
        //
        // For example, 'user.yml' should be visited _before_ 'user/a.yml'.
        const lengthDifference = a.length - b.length;
        if (lengthDifference !== 0) {
            return lengthDifference;
        }
        return a.localeCompare(b);
    });
    for (const [relativeFilepath, file] of sortedDefinitionFiles) {
        await visitor(relativeFilepath, file.contents, {
            isPackageMarker: path.basename(relativeFilepath) === FERN_PACKAGE_MARKER_FILENAME,
            defaultUrl: file.defaultUrl
        });
    }
}
