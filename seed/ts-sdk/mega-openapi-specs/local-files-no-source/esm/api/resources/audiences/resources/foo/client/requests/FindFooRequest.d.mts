import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {}
 */
export interface FindFooRequest {
    optionalString?: SeedApi.audiences.OptionalString | null;
    publicProperty?: string | null;
    privateProperty?: number | null;
}
