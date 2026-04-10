import { VersionMigrations } from "../../types/VersionMigrations.js";
import RenameAliasKeyToTypeMigration from "./rename-alias-key-to-type/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.220",
    migrations: [RenameAliasKeyToTypeMigration]
};

export default versionMigrations;
