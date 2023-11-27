import { VersionMigrations } from "../../types/VersionMigrations";
import UnionSinglePropertyKeyMigration from "./union-single-property-key";

const versionMigrations: VersionMigrations = {
    version: "0.0.203",
    migrations: [UnionSinglePropertyKeyMigration]
};

export default versionMigrations;
