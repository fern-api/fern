import { VersionMigrations } from "../../types/VersionMigrations";
import AddGeneratorGroupsMigration from "./add-generator-groups";

const versionMigrations: VersionMigrations = {
    version: "0.0.242",
    migrations: [AddGeneratorGroupsMigration],
};

export default versionMigrations;
