import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddModeToDraftGeneratorsMigration from "./add-mode-to-draft-generators/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.207",
    migrations: [AddModeToDraftGeneratorsMigration]
};

export default versionMigrations;
