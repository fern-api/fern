import type * as SeedApi from "../../../index.mjs";
export interface UsersListResponse {
    limit?: (number | null) | undefined;
    count?: (number | null) | undefined;
    has_more?: (boolean | null) | undefined;
    links: SeedApi.paginationCustom.Link[];
    data: string[];
}
