import { VersionMigrations } from "../../types/VersionMigrations.js";
import { migration } from "./disable-disambiguate-request-names/migration.js";

const versionMigrations: VersionMigrations = {
    version: "4.106.1",
    migrations: [migration]
};

export default versionMigrations;
