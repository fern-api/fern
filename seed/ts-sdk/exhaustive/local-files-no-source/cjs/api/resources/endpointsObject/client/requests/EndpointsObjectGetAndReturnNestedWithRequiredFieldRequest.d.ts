import type * as SeedApi from "../../../../index.js";
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
export interface EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest {
    string: string;
    body: SeedApi.TypesNestedObjectWithRequiredField;
}
