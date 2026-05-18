import type * as SeedApi from "../../../index.mjs";
export interface UserOptionalListPage {
    data: SeedApi.pagination.UserOptionalListContainer;
    next?: (string | null) | undefined;
}
