import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         docs: "Types extend this type to include a docs property.",
 *         name: "Example",
 *         unique: "unique"
 *     }
 */
export interface ExtendedInlineRequestBodyRequest extends SeedApi.extends_.ExampleType {
    unique: string;
}
