import { VersionMigrations } from "../../types/VersionMigrations";
import MoveServiceDocsToTopLevelMigration from "./move-service-docs-to-top-level";

const versionMigrations: VersionMigrations = {
    version: "0.5.4",
    migrations: [MoveServiceDocsToTopLevelMigration]
};

export default versionMigrations;
