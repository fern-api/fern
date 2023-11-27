import { VersionMigrations } from "../../types/VersionMigrations";
import AddSuffixToDocsDomain from "./add-suffix-to-docs-domain";

const versionMigrations: VersionMigrations = {
    version: "0.9.10",
    migrations: [AddSuffixToDocsDomain]
};

export default versionMigrations;
