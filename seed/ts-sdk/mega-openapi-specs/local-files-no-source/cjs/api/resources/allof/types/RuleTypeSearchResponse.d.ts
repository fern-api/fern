import type * as SeedApi from "../../../index.js";
export interface RuleTypeSearchResponse {
    /** Current page of results from the requested resource. */
    results?: SeedApi.allof.RuleType[] | undefined;
    paging: SeedApi.allof.PagingCursors;
}
