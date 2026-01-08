import type { Migration } from "@fern-api/migrations-base";
import { applyDefaults, createMigratedConfig, getConfigObject } from "@fern-api/migrations-base";

/**
 * Migration for version 2.0.0
 *
 * This release changed defaults to enable zero-dependency SDKs by default.
 * To maintain backwards compatibility, we explicitly set the old defaults
 * for users upgrading from pre-2.0.0 versions.
 *
 * Changed defaults:
 * - streamType: "wrapper" → "web"
 * - fileResponseType: "stream" → "binary-response"
 * - formDataSupport: "Node16" → "Node18"
 * - fetchSupport: "node-fetch" → "native"
 */
export const migration_2_0_0: Migration = {
    version: "2.0.0",

    migrateGeneratorConfig: ({ config, context }) => {
        const configObj = getConfigObject(config);

        // Only set old defaults if the fields are not already explicitly configured
        const migratedConfig = applyDefaults(configObj, {
            streamType: "wrapper",
            fileResponseType: "stream",
            formDataSupport: "Node16",
            fetchSupport: "node-fetch"
        });

        return createMigratedConfig(config, migratedConfig);
    },

    migrateGeneratorsYml: ({ document, context }) => document
};
