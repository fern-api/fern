import type * as SeedExhaustive from "../../../../../index.js";
/**
 * Tests that dynamic snippets recursively construct default objects for
 * required properties whose type is a named object. The nested object's
 * own required properties should also be filled with defaults.
 */
export interface ObjectWithRequiredNestedObject {
    requiredString: string;
    requiredObject: SeedExhaustive.types.NestedObjectWithRequiredField;
}
