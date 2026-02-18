import { VersionMigrations } from "../../types/VersionMigrations.js";
import UpdateDirectoryStructure from "./update-directory-structure/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.15.0-rc0",
    migrations: [UpdateDirectoryStructure]
};

export default versionMigrations;
