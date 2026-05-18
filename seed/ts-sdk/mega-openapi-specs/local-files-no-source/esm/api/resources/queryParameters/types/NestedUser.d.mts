import type * as SeedApi from "../../../index.mjs";
export interface NestedUser {
    name: string;
    user: SeedApi.queryParameters.User;
}
