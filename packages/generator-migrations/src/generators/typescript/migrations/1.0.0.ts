import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 1.0.0
//
// Context:
// Version 1.0.0 introduced new defaults to improve the developer experience and modernize
// the generated SDK. These changes make the SDK more ergonomic and reduce boilerplate,
// but could break existing code that relied on the old defaults.
//
// To ensure backwards compatibility during upgrades, this migration explicitly sets the
// old defaults for users upgrading from pre-1.0.0 versions. This allows their existing
// code to continue working without changes.
//
// Changed Defaults:
// - inlineFileProperties: false → true (File upload properties are now inlined into request types)
// - inlinePathParameters: false → true (Path parameters are now inlined into method signatures)
// - enableInlineTypes: false → true (Type definitions are inlined where beneficial)
// - noSerdeLayer: false → true (Serialization/deserialization layer is removed for simpler types)
// - omitUndefined: false → true (Undefined values are omitted from JSON output)
// - skipResponseValidation: false → true (Response validation is skipped for better performance)
// - useLegacyExports: true → false (Modern ESM exports are used instead of legacy CommonJS)
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
            draft.inlineFileProperties ??= false;
            draft.inlinePathParameters ??= false;
            draft.enableInlineTypes ??= false;
            draft.noSerdeLayer ??= false;
            draft.omitUndefined ??= false;
            draft.skipResponseValidation ??= false;
            draft.useLegacyExports ??= true;
        }),

    migrateGeneratorsYml: ({ document }) => document
};
