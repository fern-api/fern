import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         stringValue: "string",
 *         body: {
 *             string: "string",
 *             NestedObject: {}
 *         }
 *     }
 */
export interface GetAndReturnNestedWithRequiredFieldObjectRequest {
    stringValue: string;
    body: SeedApi.TypesNestedObjectWithRequiredField;
}
