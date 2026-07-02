import type * as SeedExhaustive from "../../../../../../index.mjs";
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
    _fields?: string;
    body: SeedExhaustive.types.ObjectWithRequiredField;
}
