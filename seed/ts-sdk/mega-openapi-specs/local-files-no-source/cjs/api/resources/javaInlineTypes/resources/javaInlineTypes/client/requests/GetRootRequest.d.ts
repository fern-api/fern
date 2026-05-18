import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         bar: {
 *             foo: "foo"
 *         },
 *         foo: "foo"
 *     }
 */
export interface GetRootRequest {
    bar: SeedApi.javaInlineTypes.RequestTypeInlineType1;
    foo: string;
}
