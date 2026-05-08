import type * as SeedApi from "../index.mjs";
/**
 * Tests that map value types with unknown types don't get spurious | undefined.
 */
export type TypesMapOfDocumentedUnknownType = Record<string, SeedApi.TypesDocumentedUnknownType>;
