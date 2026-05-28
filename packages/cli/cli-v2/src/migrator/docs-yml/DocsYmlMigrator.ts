import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";

export interface DocsYmlMigratorResult {
    /** If docs.yml exists, a `$ref` pointer to include in fern.yml. */
    docsRef?: { $ref: string };
    found: boolean;
}

/**
 * Checks if docs.yml exists in the fern directory. If so, returns a `$ref`
 * pointer so the migrated fern.yml can reference docs.yml directly.
 * The path is relative to the project root (where fern.yml is created).
 */
export async function migrateDocsYml(
    projectRoot: AbsoluteFilePath,
    fernDir: AbsoluteFilePath
): Promise<DocsYmlMigratorResult> {
    const filePath = join(fernDir, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(filePath, "file"))) {
        return { found: false };
    }
    const relPath = path.relative(projectRoot, filePath).split(path.sep).join(path.posix.sep);
    return { docsRef: { $ref: `./${relPath}` }, found: true };
}
