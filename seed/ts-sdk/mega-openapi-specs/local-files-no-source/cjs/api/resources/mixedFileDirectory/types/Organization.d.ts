import type * as SeedApi from "../../../index.js";
export interface Organization {
    id: SeedApi.mixedFileDirectory.Id;
    name: string;
    users: SeedApi.mixedFileDirectory.User[];
}
