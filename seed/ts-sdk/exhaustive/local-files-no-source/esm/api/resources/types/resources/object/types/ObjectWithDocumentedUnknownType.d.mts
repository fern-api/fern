import type * as SeedExhaustive from "../../../../../index.mjs";
/**
 * Tests that unknown types are able to preserve their type names.
 */
export interface ObjectWithDocumentedUnknownType {
    documentedUnknownType?: SeedExhaustive.types.DocumentedUnknownType | undefined;
}
