import type { MigrationModule } from "@fern-api/migrations-base";

import { migration_1_0_0 } from "./1.0.0.js";
import { migration_2_0_0 } from "./2.0.0.js";
import { migration_3_0_0 } from "./3.0.0.js";

/**
 * Migration module for TypeScript SDK generators.
 *
 * This module contains migrations for configuration changes across
 * all TypeScript SDK generator variants:
 * - fernapi/fern-typescript
 * - fernapi/fern-typescript-sdk
 * - fernapi/fern-typescript-node-sdk
 * - fernapi/fern-typescript-browser-sdk
 *
 * Each migration is defined in a separate file under this directory.
 * Migrations are automatically applied by the Fern CLI when running:
 * `fern generator upgrade --generator typescript-sdk`
 */
const migrationModule: MigrationModule = {
    migrations: [migration_1_0_0, migration_2_0_0, migration_3_0_0]
};

export default migrationModule;
