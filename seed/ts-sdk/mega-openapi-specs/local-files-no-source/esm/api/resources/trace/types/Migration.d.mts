import type * as SeedApi from "../../../index.mjs";
export interface Migration {
    name: string;
    status: SeedApi.trace.MigrationStatus;
}
