import { VersionMigrations } from "../../types/VersionMigrations";
import RequireGeneratorsYml from "./require-generators-yml"

const versionMigrations: VersionMigrations = {
    version: "0.40.4",
    migrations: [RequireGeneratorsYml]
};

export default versionMigrations;