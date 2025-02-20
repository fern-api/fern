import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./use-generators-yml-specs/migration";

const versionMigrations: VersionMigrations = {
    version: "0.53.15",
    migrations: [migration]
};

export default versionMigrations;
