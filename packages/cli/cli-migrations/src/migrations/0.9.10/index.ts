import { VersionMigrations } from "../../types/VersionMigrations.js";
import AddSuffixToDocsDomain from "./add-suffix-to-docs-domain/index.js";

const versionMigrations: VersionMigrations = {
    version: "0.9.10",
    migrations: [AddSuffixToDocsDomain]
};

export default versionMigrations;
