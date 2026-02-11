import { VersionMigrations } from "../../types/VersionMigrations.js";
import { migration } from "./update-settings-defaults/migration.js";

const versionMigrations: VersionMigrations = {
    version: "2.0.0-rc0",
    migrations: [migration]
};

export default versionMigrations;
