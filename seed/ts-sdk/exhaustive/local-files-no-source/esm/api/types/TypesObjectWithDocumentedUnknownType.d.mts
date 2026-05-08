import type * as SeedApi from "../index.mjs";
/**
 * Tests that unknown types are able to preserve their type names.
 */
export interface TypesObjectWithDocumentedUnknownType {
    documentedUnknownType?: SeedApi.TypesDocumentedUnknownType | undefined;
}
