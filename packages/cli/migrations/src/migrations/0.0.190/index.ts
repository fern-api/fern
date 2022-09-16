import { VersionMigrations } from "../../types/VersionMigrations";
import DiscriminantMigration from "./discriminant";

const versionMigrations: VersionMigrations = {
    version: "0.0.190",
    migrations: [DiscriminantMigration],
};

export default versionMigrations;
