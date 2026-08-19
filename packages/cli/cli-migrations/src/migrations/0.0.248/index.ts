import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddErrorDiscriminationConfig from "./add-error-discrimination-config/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.248",
    migrations: [AddErrorDiscriminationConfig]
};

export default versionMigrations;
