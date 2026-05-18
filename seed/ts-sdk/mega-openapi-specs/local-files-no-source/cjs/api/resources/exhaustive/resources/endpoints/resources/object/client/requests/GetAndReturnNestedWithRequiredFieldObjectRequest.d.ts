import type * as SeedApi from "../../../../../../../../index.js";
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
    body: SeedApi.exhaustive.TypesNestedObjectWithRequiredField;
}
