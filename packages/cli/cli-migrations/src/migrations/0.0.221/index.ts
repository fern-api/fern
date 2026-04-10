import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddErrorDiscriminantMigration from "./add-error-discriminant/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.221",
    migrations: [AddErrorDiscriminantMigration]
};

export default versionMigrations;
