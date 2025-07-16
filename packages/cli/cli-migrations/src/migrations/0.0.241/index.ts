import { VersionMigrations } from "../../types/VersionMigrations";
import AddGeneratorGroupsMigration from "./add-generator-groups";

const versionMigrations: VersionMigrations = {
    version: "0.0.241",
    migrations: [AddGeneratorGroupsMigration]
};

export default versionMigrations;
