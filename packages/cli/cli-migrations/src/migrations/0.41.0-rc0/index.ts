import { VersionMigrations } from "../../types/VersionMigrations";
import RequireGeneratorsYml from "./require-generators-yml";

const versionMigrations: VersionMigrations = {
    version: "0.41.0-rc0",
    migrations: [RequireGeneratorsYml]
};

export default versionMigrations;
