import { VersionMigrations } from "../../types/VersionMigrations";
import RenameAliasKeyToTypeMigration from "./rename-alias-key-to-type";

const versionMigrations: VersionMigrations = {
    version: "0.0.220",
    migrations: [RenameAliasKeyToTypeMigration]
};

export default versionMigrations;
