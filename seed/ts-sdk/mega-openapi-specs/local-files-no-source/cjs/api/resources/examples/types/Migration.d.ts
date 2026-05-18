import type * as SeedApi from "../../../index.js";
export interface Migration {
    name: string;
    status: SeedApi.examples.MigrationStatus;
}
