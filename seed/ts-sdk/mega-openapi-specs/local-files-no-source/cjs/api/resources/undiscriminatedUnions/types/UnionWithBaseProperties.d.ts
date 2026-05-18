import type * as SeedApi from "../../../index.js";
/**
 * Tests that base-properties on an undiscriminated union are correctly
 * represented in the IR and generated code.
 */
export type UnionWithBaseProperties = SeedApi.undiscriminatedUnions.NamedMetadata | SeedApi.undiscriminatedUnions.OptionalMetadata | null;
