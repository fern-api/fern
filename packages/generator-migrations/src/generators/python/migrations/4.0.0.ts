import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 4.0.0
//
// Context:
// Version 4.0.0 introduced a breaking change by removing Pydantic field aliases and replacing
// them with an internal representation. This allows for more robust handling of field aliases
// and prevents issues with Pydantic V2 and mypy.
//
// Previously, Pydantic field aliases were used to map Python snake_case field names to API
// camelCase field names. In v4, this was removed in favor of an internal representation that
// handles the mapping without relying on Pydantic's alias system.
//
// To ensure backwards compatibility during upgrades, this migration explicitly enables
// Pydantic field aliases for users upgrading from pre-4.0.0 versions. This allows their
// existing code to continue using the old Pydantic alias behavior.
//
// Changed Default:
// - pydantic_config.use_pydantic_field_aliases: false → true (when migrating from v3 to v4)
//   In v4, Pydantic field aliases are removed by default. Setting this to true restores
//   the v3 behavior with Pydantic field aliases.
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// the value if it is explicitly undefined. This means:
// - If a user has explicitly configured this field (even to false), that value is preserved
// - If the field is undefined, it is set to true for backwards compatibility
// - Unknown/custom fields are preserved
// - The migration creates the pydantic_config object if it doesn't exist
export const migration_4_0_0: Migration = {
    version: "4.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Ensure pydantic_config object exists (handle undefined and null)
            if (draft.pydantic_config === undefined || draft.pydantic_config === null) {
                draft.pydantic_config = {};
            }

            // Set old default to enable Pydantic field aliases
            // Using the nullish coalescing assignment operator (??=) to set only if undefined
            if (typeof draft.pydantic_config === "object" && draft.pydantic_config !== null) {
                // TypeScript doesn't know about the structure, so we use bracket notation
                (draft.pydantic_config as Record<string, unknown>).use_pydantic_field_aliases ??= true;
            }
        }),

    migrateGeneratorsYml: ({ document }) => document
};
