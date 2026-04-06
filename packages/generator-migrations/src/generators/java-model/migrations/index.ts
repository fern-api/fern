import type { MigrationModule } from "@fern-api/migrations-base";

import { migration_1_0_0 } from "./1.0.0.js";

/**
 * Migration module for Java Model generators.
 *
 * This module contains migrations for configuration changes for
 * the Java Model generator (fernapi/fern-java-model).
 *
 * Each migration is defined in a separate file under this directory.
 * Migrations are automatically applied by the Fern CLI when running:
 * `fern generator upgrade --generator java-model`
 */
const migrationModule: MigrationModule = {
    migrations: [migration_1_0_0]
};

export default migrationModule;
