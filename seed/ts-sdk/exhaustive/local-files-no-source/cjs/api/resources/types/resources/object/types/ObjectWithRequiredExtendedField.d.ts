import type * as SeedExhaustive from "../../../../../index.js";
/**
 * Tests that a struct with a required field whose type extends a non-Default
 * base type does NOT incorrectly derive Default in Rust. Reproduces the bug
 * where namedTypeSupportsDefault only checked properties but not extends.
 */
export interface ObjectWithRequiredExtendedField {
    requiredExtended: SeedExhaustive.types.ExtendedObjectWithInheritedEnum;
}
