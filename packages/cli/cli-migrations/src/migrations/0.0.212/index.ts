import { VersionMigrations } from "../../types/VersionMigrations";
import AddPublishingToReleaseGeneratorsMigration from "./add-publishing-to-release-generators";

const versionMigrations: VersionMigrations = {
    version: "0.0.212",
    migrations: [AddPublishingToReleaseGeneratorsMigration]
};

export default versionMigrations;
