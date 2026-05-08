import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         id: "id",
 *         body: {
 *             string: "string"
 *         }
 *     }
 */
export interface TestPutHttpMethodsRequest {
    id: string;
    body: SeedApi.TypesObjectWithRequiredField;
}
