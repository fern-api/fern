import type * as SeedApi from "../index.js";
/**
 * Tests that unknown types are able to preserve their type names.
 */
export interface TypesObjectWithDocumentedUnknownType {
    documentedUnknownType?: SeedApi.TypesDocumentedUnknownType | undefined;
}
