import { VersionMigrations } from "../../types/VersionMigrations";
import AddValueKeyToTypeExamplesMigration from "./add-value-key-to-type-examples";

const versionMigrations: VersionMigrations = {
    version: "0.3.0-rc12",
    migrations: [AddValueKeyToTypeExamplesMigration]
};

export default versionMigrations;
