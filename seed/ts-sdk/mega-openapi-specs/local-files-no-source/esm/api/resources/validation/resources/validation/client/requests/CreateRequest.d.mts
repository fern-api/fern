import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         decimal: 1.1,
 *         even: 1,
 *         name: "name",
 *         shape: "SQUARE"
 *     }
 */
export interface CreateRequest {
    decimal: number;
    even: number;
    name: string;
    shape: SeedApi.validation.Shape;
}
