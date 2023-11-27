import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";

export function getResolvedPathOfImportedFile({
    referencedIn,
    importPath
}: {
    referencedIn: RelativeFilePath;
    importPath: RelativeFilePath;
}): RelativeFilePath {
    return join(dirname(referencedIn), importPath);
}
