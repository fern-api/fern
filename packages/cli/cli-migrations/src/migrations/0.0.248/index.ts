import { VersionMigrations } from "../../types/VersionMigrations";
import AddErrorDiscriminationConfig from "./add-error-discrimination-config";

const versionMigrations: VersionMigrations = {
    version: "0.0.248",
    migrations: [AddErrorDiscriminationConfig]
};

export default versionMigrations;
