import type * as SeedApi from "../../../index.mjs";
export interface NestedUser {
    name?: string | undefined;
    user?: SeedApi.queryParametersOpenapi.User | undefined;
}
