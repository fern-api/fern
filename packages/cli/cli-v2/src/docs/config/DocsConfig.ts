import type { schemas } from "@fern-api/config";

/**
 * Validated docs configuration. For now, this delegates entirely to the
 * legacy docs pipeline using the raw schema shape.
 */
export interface DocsConfig {
    raw: schemas.DocsSchema;
}
