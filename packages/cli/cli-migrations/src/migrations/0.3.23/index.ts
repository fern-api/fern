import { VersionMigrations } from "../../types/VersionMigrations";
import ChangeServicesKeyToServiceMigration from "./change-services-key-to-service";

const versionMigrations: VersionMigrations = {
    version: "0.3.23",
    migrations: [ChangeServicesKeyToServiceMigration]
};

export default versionMigrations;
