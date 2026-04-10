import { VersionMigrations } from "../../types/VersionMigrations.js";
import ChangeServicesKeyToServiceMigration from "./change-services-key-to-service/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.3.23",
    migrations: [ChangeServicesKeyToServiceMigration]
};

export default versionMigrations;
