import { VersionMigrations } from "../../types/VersionMigrations";
import AddModeToDraftGeneratorsMigration from "./add-mode-to-draft-generators";

const versionMigrations: VersionMigrations = {
    version: "0.0.207",
    migrations: [AddModeToDraftGeneratorsMigration]
};

export default versionMigrations;
