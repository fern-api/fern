import type * as SeedApi from "../../../index.js";
export interface NestedUser {
    name: string;
    user: SeedApi.queryParameters.User;
}
