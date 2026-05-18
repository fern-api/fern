import type * as SeedApi from "../../../index.mjs";
export interface NestedUser {
    Name: string;
    NestedUser: SeedApi.mixedCase.User;
}
