import type * as SeedApi from "../../../index.mjs";
export interface ListUsersMixedTypePaginationResponse {
    next: string;
    data: SeedApi.pagination.User[];
}
