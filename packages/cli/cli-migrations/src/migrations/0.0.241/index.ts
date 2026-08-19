import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddGeneratorGroupsMigration from "./add-generator-groups/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.241",
    migrations: [AddGeneratorGroupsMigration]
};

export default versionMigrations;
