import { VersionMigrations } from "../../types/VersionMigrations.js";
import MoveServiceDocsToTopLevelMigration from "./move-service-docs-to-top-level/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.5.4",
    migrations: [MoveServiceDocsToTopLevelMigration]
};

export default versionMigrations;
