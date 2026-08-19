import { VersionMigrations } from "../../types/VersionMigrations.js";
import UnionSinglePropertyKeyMigration from "./union-single-property-key/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.203",
    migrations: [UnionSinglePropertyKeyMigration]
};

export default versionMigrations;
