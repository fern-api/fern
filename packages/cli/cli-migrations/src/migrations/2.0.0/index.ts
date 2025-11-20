import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./update-settings-defaults/migration";

const versionMigrations: VersionMigrations = {
    version: "2.0.0-rc0",
    migrations: [migration]
};

export default versionMigrations;
