import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 3.0.0
//
// Context:
// Version 3.0.0 introduced a breaking change by defaulting to forward-compatible enums.
// This provides resilience against new enum variants added on the backend but changes
// the structure of generated enum types from traditional Java enums to class-based enums
// that support unknown values through a visitor pattern.
//
// Forward-compatible enums are particularly important for:
// - Mobile applications that cannot be easily updated
// - Maintaining backward compatibility when backend adds new enum values
// - Arrays of enum values where new variants previously caused client failures
//
// To ensure backwards compatibility during upgrades, this migration explicitly disables
// forward-compatible enums for users upgrading from pre-3.0.0 versions. This allows their
// existing code to continue using traditional Java enums without changes.
//
// Changed Default:
// - enable-forward-compatible-enums: false → true (when migrating from v2 to v3)
//   In v3, enums are generated as class-based enums with visitor pattern support for unknown values
//   instead of traditional Java enum types. Setting this to false restores traditional enum generation.
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// the value if it is explicitly undefined. This means:
// - If a user has explicitly configured this field (even to true), that value is preserved
// - If the field is undefined, it is set to false for backwards compatibility
// - Unknown/custom fields are preserved
export const migration_3_0_0: Migration = {
    version: "3.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Set old default to disable forward-compatible enums
            // Using the nullish coalescing assignment operator (??=) to set only if undefined
            draft["enable-forward-compatible-enums"] ??= false;
        }),

    migrateGeneratorsYml: ({ document }) => document
};
