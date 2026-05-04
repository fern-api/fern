import { DOCS_CONFIGURATION_FILENAME } from "@fern-api/configuration";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";

export interface DocsYmlMigratorResult {
    /** If docs.yml exists, a `$ref` pointer to include in fern.yml. */
    docsRef?: { $ref: string };
    found: boolean;
}

/**
 * Checks if docs.yml exists in the fern directory. If so, returns a `$ref`
 * pointer so the migrated fern.yml can reference docs.yml directly.
 */
export async function migrateDocsYml(fernDir: AbsoluteFilePath): Promise<DocsYmlMigratorResult> {
    const filePath = join(fernDir, RelativeFilePath.of(DOCS_CONFIGURATION_FILENAME));
    if (!(await doesPathExist(filePath, "file"))) {
        return { found: false };
    }
    return { docsRef: { $ref: `./${DOCS_CONFIGURATION_FILENAME}` }, found: true };
}
