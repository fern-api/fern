import type * as SeedApi from "../../../../../../../../index.mjs";
/**
 * @example
 *     {
 *         string: "string",
 *         body: {
 *             string: "string",
 *             NestedObject: {}
 *         }
 *     }
 */
export interface GetAndReturnNestedWithRequiredFieldObjectRequest {
    string: string;
    body: SeedApi.goDeterministicOrdering.TypesNestedObjectWithRequiredField;
}
