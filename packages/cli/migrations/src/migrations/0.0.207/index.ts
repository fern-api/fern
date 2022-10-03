import { VersionMigrations } from "../../types/VersionMigrations";
import UnionSinglePropertyKeyMigration from "./add-mode-to-draft-generators";

const versionMigrations: VersionMigrations = {
    version: "0.0.207",
    migrations: [UnionSinglePropertyKeyMigration],
};

export default versionMigrations;
