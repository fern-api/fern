import type * as SeedApi from "../../../index.js";
export interface NestedUser {
    Name: string;
    NestedUser: SeedApi.mixedCase.User;
}
