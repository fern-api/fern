import { VersionMigrations } from "../../types/VersionMigrations";
import AddErrorDiscriminantMigration from "./add-error-discriminant";

const versionMigrations: VersionMigrations = {
    version: "0.0.221",
    migrations: [AddErrorDiscriminantMigration]
};

export default versionMigrations;
