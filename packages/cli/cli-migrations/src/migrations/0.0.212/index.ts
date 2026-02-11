import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddPublishingToReleaseGeneratorsMigration from "./add-publishing-to-release-generators/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.212",
    migrations: [AddPublishingToReleaseGeneratorsMigration]
};

export default versionMigrations;
