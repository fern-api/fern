import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddInlineRequestsMigration from "./add-inline-requests/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.1.3-rc3",
    migrations: [AddInlineRequestsMigration]
};

export default versionMigrations;
