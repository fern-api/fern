import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./use-generators-yml-specs/migration";

const versionMigrations: VersionMigrations = {
    version: "0.54.0-rc0",
    migrations: [migration]
};

export default versionMigrations;
