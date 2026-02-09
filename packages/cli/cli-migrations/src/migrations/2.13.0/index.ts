import { VersionMigrations } from "../../types/VersionMigrations.js";
import { migration } from "./migrate-deprecated-generator-api-settings/migration.js";

const versionMigrations: VersionMigrations = {
    version: "2.13.0",
    migrations: [migration]
};

export default versionMigrations;
