import { VersionMigrations } from "../../types/VersionMigrations.js";
import { migration } from "./enable-smart-casing/migration.js";

const versionMigrations: VersionMigrations = {
    version: "3.0.0",
    migrations: [migration]
};

export default versionMigrations;
