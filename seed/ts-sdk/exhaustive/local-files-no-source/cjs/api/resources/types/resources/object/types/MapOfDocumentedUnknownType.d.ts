import type * as SeedExhaustive from "../../../../../index.js";
/**
 * Tests that map value types with unknown types don't get spurious | undefined.
 */
export type MapOfDocumentedUnknownType = Record<string, SeedExhaustive.types.DocumentedUnknownType>;
