import type * as SeedExhaustive from "../../../../../../index.js";
/**
 * @example
 *     {
 *         _fields: "_fields",
 *         body: {
 *             string: "string"
 *         }
 *     }
 */
export interface CreateWithBodyAndQuery {
    _fields?: string | undefined;
    body: SeedExhaustive.types.ObjectWithRequiredField;
}
