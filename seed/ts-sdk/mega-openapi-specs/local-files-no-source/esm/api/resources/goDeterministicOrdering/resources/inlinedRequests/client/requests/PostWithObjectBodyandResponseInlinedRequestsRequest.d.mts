import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         string: "string",
 *         integer: 1,
 *         NestedObject: {}
 *     }
 */
export interface PostWithObjectBodyandResponseInlinedRequestsRequest {
    string: string;
    integer: number;
    NestedObject: SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField;
}
