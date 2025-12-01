import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./migrate-deprecated-generator-api-settings/migration";

const versionMigrations: VersionMigrations = {
    version: "2.13.0",
    migrations: [migration]
};

export default versionMigrations;
