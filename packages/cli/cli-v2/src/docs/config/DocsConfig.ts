import type { schemas } from "@fern-api/config";
import type { AbsoluteFilePath } from "@fern-api/fs-utils";

/**
 * Validated docs configuration. For now, this delegates entirely to the
 * legacy docs pipeline using the raw schema shape.
 */
export interface DocsConfig {
    raw: schemas.DocsSchema;
    /**
     * Absolute path to the docs config file (docs.yml).
     * When docs is inlined via `$ref`, this points to the referenced file
     * rather than fern.yml, so that relative paths inside docs.yml resolve correctly.
     */
    absoluteFilePath?: AbsoluteFilePath;
}
