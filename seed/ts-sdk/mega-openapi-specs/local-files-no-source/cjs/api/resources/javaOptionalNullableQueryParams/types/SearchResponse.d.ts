import type * as SeedApi from "../../../index.js";
/**
 * Search response
 */
export interface SearchResponse {
    results: string[];
    totalCount: number;
    query?: (string | null) | undefined;
    limit?: (number | null) | undefined;
    includeArchived?: (boolean | null) | undefined;
    sortOrder?: (SeedApi.javaOptionalNullableQueryParams.SortOrder | null) | undefined;
}
