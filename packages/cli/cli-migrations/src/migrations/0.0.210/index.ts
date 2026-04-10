import { VersionMigrations } from "../../types/VersionMigrations.js";
import RemoveInlineErrorDeclarationsMigration from "./remove-inline-error-declarations/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.0.210",
    migrations: [RemoveInlineErrorDeclarationsMigration]
};

export default versionMigrations;
