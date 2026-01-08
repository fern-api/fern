import type { Migration } from "@fern-api/migrations-base";
import { applyDefaults, createMigratedConfig, getConfigObject } from "@fern-api/migrations-base";

/**
 * Migration for version 3.0.0
 *
 * This release changed defaults to use modern tooling (pnpm and vitest).
 * To maintain backwards compatibility, we explicitly set the old defaults
 * for users upgrading from pre-3.0.0 versions.
 *
 * Changed defaults:
 * - packageManager: "yarn" → "pnpm"
 * - testFramework: "jest" → "vitest"
 *
 * Note: vitest is not supported with useBigInt: true, streamType: wrapper, or packagePath
 */
export const migration_3_0_0: Migration = {
    version: "3.0.0",

    migrateGeneratorConfig: ({ config, context }) => {
        const configObj = getConfigObject(config);

        // Only set old defaults if the fields are not already explicitly configured
        const migratedConfig = applyDefaults(configObj, {
            packageManager: "yarn",
            testFramework: "jest"
        });

        return createMigratedConfig(config, migratedConfig);
    },

    migrateGeneratorsYml: ({ document, context }) => document
};
