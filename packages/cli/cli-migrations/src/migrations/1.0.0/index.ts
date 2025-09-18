import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./update-settings-defaults/migration";

const versionMigrations: VersionMigrations = {
    version: "1.0.0",
    migrations: [migration]
};

export default versionMigrations;
