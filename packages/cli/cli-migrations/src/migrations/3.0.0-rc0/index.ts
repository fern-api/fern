import { VersionMigrations } from "../../types/VersionMigrations";
import { migration } from "./enable-smart-casing/migration";

const versionMigrations: VersionMigrations = {
    version: "3.0.0-rc0",
    migrations: [migration]
};

export default versionMigrations;
