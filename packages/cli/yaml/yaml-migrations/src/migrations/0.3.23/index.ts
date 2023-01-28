import { VersionMigrations } from "../../types/VersionMigrations";
import ChangeApiNameToOrganizationNameMigration from "./change-api-name-to-organization-name";

const versionMigrations: VersionMigrations = {
    version: "0.3.23",
    migrations: [ChangeApiNameToOrganizationNameMigration],
};

export default versionMigrations;
