import { VersionMigrations } from "../../types/VersionMigrations";
import UpdateDirectoryStructure from "./update-directory-structure";

const versionMigrations: VersionMigrations = {
    version: "0.15.0-rc0",
    migrations: [UpdateDirectoryStructure]
};

export default versionMigrations;
