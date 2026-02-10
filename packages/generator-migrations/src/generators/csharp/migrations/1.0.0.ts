import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 1.0.0
//
// Context:
// Version 1.0.0 introduced new defaults to improve the developer experience and modernize
// the generated C# SDK. These changes make the SDK more ergonomic and follow C# conventions
// more closely, but could break existing code that relied on the old defaults.
//
// To ensure backwards compatibility during upgrades, this migration explicitly sets the
// old defaults for users upgrading from pre-1.0.0 versions. This allows their existing
// code to continue working without changes.
//
// Changed Defaults:
// - root-namespace-for-core-classes: false → true (Core classes are now in the root namespace)
// - pascal-case-environments: false → true (Environment names use PascalCase instead of UPPER_CASE)
// - simplify-object-dictionaries: false → true (Object dictionaries use simplified syntax)
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// values that are explicitly undefined. This means:
// - If a user has explicitly configured a field (even to the new default), that value is preserved
// - If a field is undefined, the old default is set for backwards compatibility
// - Unknown/custom fields are preserved
export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Only set old defaults if the fields are not already explicitly configured
            // Using the nullish coalescing assignment operator (??=) to set only if undefined
            draft["root-namespace-for-core-classes"] ??= false;
            draft["pascal-case-environments"] ??= false;
            draft["simplify-object-dictionaries"] ??= false;
        }),

    migrateGeneratorsYml: ({ document }) => document
};
