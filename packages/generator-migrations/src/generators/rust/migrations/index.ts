import type { MigrationModule } from "@fern-api/migrations-base";
import { migration_1_0_0 } from "./1.0.0.js";

const rustSdkMigrations: MigrationModule = {
    migrations: [migration_1_0_0]
};

export default rustSdkMigrations;
