import type * as SeedApi from "../../../index.mjs";
/**
 * Outer union where one variant is an object containing a nested union field.
 * Tests that the deserializer correctly handles transitive union deserialization.
 */
export type OuterNestedUnion = string | SeedApi.undiscriminatedUnions.WrapperObject;
