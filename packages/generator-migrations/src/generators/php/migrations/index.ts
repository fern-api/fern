import type { MigrationModule } from "@fern-api/migrations-base";
import { migration_3_0_0 } from "./3.0.0.js";

const phpSdkMigrations: MigrationModule = {
    migrations: [migration_3_0_0]
};

export default phpSdkMigrations;
