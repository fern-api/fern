import type * as SeedApi from "../../../index.mjs";
export interface UserSearchResponse {
    /** Current page of results from the requested resource. */
    results?: SeedApi.allof.User[] | undefined;
    paging: SeedApi.allof.PagingCursors;
}
