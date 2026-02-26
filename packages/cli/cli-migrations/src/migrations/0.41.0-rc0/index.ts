import { VersionMigrations } from "../../types/VersionMigrations.js";
import RequireGeneratorsYml from "./require-generators-yml/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.41.0-rc0",
    migrations: [RequireGeneratorsYml]
};

export default versionMigrations;
