import type * as SeedApi from "../../../index.js";
export interface UserPage {
    data: SeedApi.pagination.UserListContainer;
    next?: (string | null) | undefined;
}
