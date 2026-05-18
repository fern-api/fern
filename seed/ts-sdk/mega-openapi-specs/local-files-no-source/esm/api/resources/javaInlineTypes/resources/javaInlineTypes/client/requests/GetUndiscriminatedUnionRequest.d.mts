import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         bar: "SUNNY",
 *         foo: "foo"
 *     }
 */
export interface GetUndiscriminatedUnionRequest {
    bar: SeedApi.javaInlineTypes.UndiscriminatedUnion1;
    foo: string;
}
