import { Migration } from "./Migration.js";

export interface VersionMigrations {
    version: string;
    migrations: Migration[];
}
