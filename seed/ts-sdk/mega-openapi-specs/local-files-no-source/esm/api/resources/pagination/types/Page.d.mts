import type * as SeedApi from "../../../index.mjs";
export interface Page {
    /** The current page */
    page: number;
    next?: (SeedApi.pagination.NextPage | null) | undefined;
    per_page: number;
    total_page: number;
}
