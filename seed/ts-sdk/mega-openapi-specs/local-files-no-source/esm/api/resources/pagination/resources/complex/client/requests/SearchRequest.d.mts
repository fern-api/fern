import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         index: "index",
 *         query: {}
 *     }
 */
export interface SearchRequest {
    index: string;
    pagination?: SeedApi.pagination.StartingAfterPaging | null;
    query: SeedApi.pagination.SearchRequestQuery;
}
