import type * as SeedExhaustive from "../../../../../index.mjs";
/**
 * Extends ObjectWithInheritedRequiredEnum, inheriting the required enum field.
 * This type should NOT derive Default in Rust because the parent type
 * has a required enum field.
 */
export interface ExtendedObjectWithInheritedEnum extends SeedExhaustive.types.ObjectWithInheritedRequiredEnum {
    optionalDescription?: string | undefined;
}
