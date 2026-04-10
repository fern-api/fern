import type * as SeedApi from "../../../../index.mjs";
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
