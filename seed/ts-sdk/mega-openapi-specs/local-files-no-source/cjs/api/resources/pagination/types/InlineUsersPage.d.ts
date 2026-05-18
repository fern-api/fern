import type * as SeedApi from "../../../index.js";
export interface InlineUsersPage {
    /** The current page */
    page: number;
    next?: (SeedApi.pagination.InlineUsersNextPage | null) | undefined;
    per_page: number;
    total_page: number;
}
