import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         bar: {
 *             foo: "foo",
 *             bar: {
 *                 foo: "foo",
 *                 ref: {
 *                     foo: "foo"
 *                 }
 *             },
 *             ref: {
 *                 foo: "foo"
 *             },
 *             type: "type1"
 *         },
 *         foo: "foo"
 *     }
 */
export interface GetDiscriminatedUnionRequest {
    bar: SeedApi.javaInlineTypes.DiscriminatedUnion1;
    foo: string;
}
