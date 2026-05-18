import type * as SeedApi from "../../../index.mjs";
export interface Organization {
    id: SeedApi.mixedFileDirectory.Id;
    name: string;
    users: SeedApi.mixedFileDirectory.User[];
}
