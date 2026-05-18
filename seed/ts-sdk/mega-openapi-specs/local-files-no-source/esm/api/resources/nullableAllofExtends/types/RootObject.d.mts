import type * as SeedApi from "../../../index.mjs";
/**
 * Object inheriting from a nullable schema via allOf.
 */
export interface RootObject extends SeedApi.nullableAllofExtends.NormalObject, SeedApi.nullableAllofExtends.NullableObject {
}
