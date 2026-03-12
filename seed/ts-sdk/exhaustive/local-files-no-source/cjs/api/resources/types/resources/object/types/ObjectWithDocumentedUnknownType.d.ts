import type * as SeedExhaustive from "../../../../../index.js";
/**
 * Tests that unknown types are able to preserve their type names.
 */
export interface ObjectWithDocumentedUnknownType {
    documentedUnknownType?: SeedExhaustive.types.DocumentedUnknownType | undefined;
}
