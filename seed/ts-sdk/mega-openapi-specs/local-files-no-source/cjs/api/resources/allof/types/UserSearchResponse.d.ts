import type * as SeedApi from "../../../index.js";
export interface UserSearchResponse {
    /** Current page of results from the requested resource. */
    results?: SeedApi.allof.User[] | undefined;
    paging: SeedApi.allof.PagingCursors;
}
