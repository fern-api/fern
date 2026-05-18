import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         sortField: "DEFAULT",
 *         query: "test query"
 *     }
 */
export interface SearchRequest {
    /** The sort field to use */
    sortField?: SeedApi.goOptionalLiteralAlias.SortField | null;
    /** The search query */
    query: string;
}
