import { Migration } from "./Migration";

export interface VersionMigrations {
    version: string;
    migrations: Migration[];
}
