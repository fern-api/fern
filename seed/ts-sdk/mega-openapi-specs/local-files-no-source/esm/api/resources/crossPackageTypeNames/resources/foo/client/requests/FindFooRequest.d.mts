import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface FindFooRequest {
    optionalString?: SeedApi.crossPackageTypeNames.OptionalString | null;
    publicProperty?: string | null;
    privateProperty?: number | null;
}
