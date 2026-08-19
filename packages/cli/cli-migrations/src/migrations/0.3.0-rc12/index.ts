import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddValueKeyToTypeExamplesMigration from "./add-value-key-to-type-examples/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.3.0-rc12",
    migrations: [AddValueKeyToTypeExamplesMigration]
};

export default versionMigrations;
