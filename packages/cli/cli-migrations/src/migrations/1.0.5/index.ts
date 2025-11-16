import { VersionMigrations } from "../../types/VersionMigrations";
import migration from "./ensure-1.0.0-runs";

const versionMigrations: VersionMigrations = {
    version: "1.0.5",
    migrations: [migration]
};

export default versionMigrations;
