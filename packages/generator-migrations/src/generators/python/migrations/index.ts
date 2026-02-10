import type { MigrationModule } from "@fern-api/migrations-base";

import { migration_4_0_0 } from "./4.0.0.js";

/**
 * Migration module for Python SDK generator.
 *
 * This module contains migrations for configuration changes for
 * the Python SDK generator:
 * - fernapi/fern-python-sdk
 *
 * Each migration is defined in a separate file under this directory.
 * Migrations are automatically applied by the Fern CLI when running:
 * `fern generator upgrade --generator python-sdk`
 *
 * Note: Versions 1.0.0 and 2.0.0 mentioned "breaking configuration changes"
 * but did not document specific configuration options that changed, so they
 * are not included in this migration module.
 */
const migrationModule: MigrationModule = {
    migrations: [migration_4_0_0]
};

export default migrationModule;
