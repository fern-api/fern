import { VersionMigrations } from "../../types/VersionMigrations";
import GeneratorsConfigurationMigration from "./generators-configuration";

const versionMigrations: VersionMigrations = {
    version: "0.0.188",
    migrations: [GeneratorsConfigurationMigration]
};

export default versionMigrations;
