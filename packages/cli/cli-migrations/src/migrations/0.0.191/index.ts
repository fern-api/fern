import { VersionMigrations } from "../../types/VersionMigrations.js";
import DiscriminantMigration from "./discriminant/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.191",
    migrations: [DiscriminantMigration]
};

export default versionMigrations;
