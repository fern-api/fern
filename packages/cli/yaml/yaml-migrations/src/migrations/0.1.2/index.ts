import { VersionMigrations } from "../../types/VersionMigrations";
import AddInlineRequestsMigration from "./add-inline-requests";

const versionMigrations: VersionMigrations = {
    version: "0.1.2",
    migrations: [AddInlineRequestsMigration],
};

export default versionMigrations;
