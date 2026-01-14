import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 2.0.0
//
// Context:
// Version 2.0.0 introduced significant changes to defaults to improve the developer experience
// and modernize the generated C# SDK. These changes make the SDK more ergonomic and follow
// modern C# best practices, but could break existing code that relied on the old defaults.
//
// To ensure backwards compatibility during upgrades, this migration explicitly sets the
// old defaults for users upgrading from pre-2.0.0 versions. This allows their existing
// code to continue working without changes.
//
// Configuration Renames (old names are automatically migrated to new names):
// - experimental-enable-forward-compatible-enums → enable-forward-compatible-enums
// - experimental-additional-properties → additional-properties
//
// Changed Defaults:
// - additional-properties: false → true (Enables additional properties on generated models)
// - enable-forward-compatible-enums: false → true (Enables forward-compatible enum handling)
// - generate-mock-server-tests: false → true (Generates mock server tests)
// - inline-path-parameters: false → true (Path parameters are inlined into method signatures)
// - simplify-object-dictionaries: true → false (Reverts to non-simplified object dictionary syntax)
// - use-discriminated-unions: false → true (Uses discriminated unions for union types)
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// values that are explicitly undefined. This means:
// - If a user has explicitly configured a field (even to the new default), that value is preserved
// - If a field is undefined, the old default is set for backwards compatibility
// - Unknown/custom fields are preserved
// - Old experimental names are migrated to new stable names, preserving the user's configured value
export const migration_2_0_0: Migration = {
    version: "2.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Migrate renamed configuration options from experimental to stable names
            // If the old name exists, move its value to the new name and delete the old name
            if ("experimental-additional-properties" in draft) {
                const value = draft["experimental-additional-properties"];
                delete draft["experimental-additional-properties"];
                draft["additional-properties"] = value;
            }

            if ("experimental-enable-forward-compatible-enums" in draft) {
                const value = draft["experimental-enable-forward-compatible-enums"];
                delete draft["experimental-enable-forward-compatible-enums"];
                draft["enable-forward-compatible-enums"] = value;
            }

            // Set old defaults for fields that are not explicitly configured
            // Using the nullish coalescing assignment operator (??=) to set only if undefined
            draft["additional-properties"] ??= false;
            draft["enable-forward-compatible-enums"] ??= false;
            draft["generate-mock-server-tests"] ??= false;
            draft["inline-path-parameters"] ??= false;
            draft["simplify-object-dictionaries"] ??= true;
            draft["use-discriminated-unions"] ??= false;
        }),

    migrateGeneratorsYml: ({ document }) => document
};
