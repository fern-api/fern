import { VersionMigrations } from "../../types/VersionMigrations.js";
import { migration } from "./update-settings-defaults/migration.js";

const versionMigrations: VersionMigrations = {
    version: "1.0.0",
    migrations: [migration]
};

export default versionMigrations;
