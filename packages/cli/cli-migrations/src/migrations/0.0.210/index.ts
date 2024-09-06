import { VersionMigrations } from "../../types/VersionMigrations";
import RemoveInlineErrorDeclarationsMigration from "./remove-inline-error-declarations";

const versionMigrations: VersionMigrations = {
    version: "0.0.210",
    migrations: [RemoveInlineErrorDeclarationsMigration]
};

export default versionMigrations;
