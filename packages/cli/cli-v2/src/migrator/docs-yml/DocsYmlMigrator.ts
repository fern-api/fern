import { DOCS_CONFIGURATION_FILENAME, FERN_DIRECTORY } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

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
export async function migrateDocsYml(fernDir: AbsoluteFilePath): Promise<DocsYmlMigratorResult> {
    const filePath = join(fernDir, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(filePath, "file"))) {
        return { found: false };
    }
    return { docsRef: { $ref: `./${FERN_DIRECTORY}/${DOCS_CONFIGURATION_FILENAME}` }, found: true };
}
