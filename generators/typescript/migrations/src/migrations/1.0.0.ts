import type { Migration } from "@fern-api/migrations-base";
import { applyDefaults, createMigratedConfig, getConfigObject } from "@fern-api/migrations-base";

/**
 * Migration for version 1.0.0
 *
 * This release changed the defaults for several configuration options.
 * To maintain backwards compatibility, we explicitly set the old defaults
 * for users upgrading from pre-1.0.0 versions.
 *
 * Changed defaults:
 * - inlineFileProperties: false → true
 * - inlinePathParameters: false → true
 * - enableInlineTypes: false → true
 * - noSerdeLayer: false → true
 * - omitUndefined: false → true
 * - skipResponseValidation: false → true
 * - useLegacyExports: true → false
 */
export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config, context }) => {
        const configObj = getConfigObject(config);

        // Only set old defaults if the fields are not already explicitly configured
        const migratedConfig = applyDefaults(configObj, {
            inlineFileProperties: false,
            inlinePathParameters: false,
            enableInlineTypes: false,
            noSerdeLayer: false,
            omitUndefined: false,
            skipResponseValidation: false,
            useLegacyExports: true
        });

        return createMigratedConfig(config, migratedConfig);
    },

    migrateGeneratorsYml: ({ document, context }) => document
};
