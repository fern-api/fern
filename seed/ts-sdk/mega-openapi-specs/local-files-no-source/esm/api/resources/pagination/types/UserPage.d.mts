import type * as SeedApi from "../../../index.mjs";
export interface UserPage {
    data: SeedApi.pagination.UserListContainer;
    next?: (string | null) | undefined;
}
