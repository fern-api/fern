import type * as SeedApi from "../../../index.js";
export interface PaginatedResult {
    paging: SeedApi.allof.PagingCursors;
    /** Current page of results from the requested resource. */
    results: unknown[];
}
