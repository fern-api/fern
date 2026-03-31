import type { MigrationModule } from "@fern-api/migrations-base";

import { migration_2_0_0 } from "./2.0.0.js";
import { migration_3_0_0 } from "./3.0.0.js";

/**
 * Migration module for Java SDK generator.
 *
 * This module contains migrations for configuration changes for
 * the Java SDK generator:
 * - fernapi/fern-java-sdk
 *
 * Each migration is defined in a separate file under this directory.
 * Migrations are automatically applied by the Fern CLI when running:
 * `fern generator upgrade --generator java-sdk`
 */
const migrationModule: MigrationModule = {
    migrations: [migration_2_0_0, migration_3_0_0]
};

export default migrationModule;
