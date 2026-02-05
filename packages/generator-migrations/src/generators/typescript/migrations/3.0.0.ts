import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 3.0.0
//
// Context:
// Version 3.0.0 modernized the generated SDK tooling by switching to pnpm and Vitest,
// which offer better performance, smaller disk usage, and faster test execution compared
// to yarn and Jest. However, teams with existing workflows may prefer to maintain their
// current tooling.
//
// This migration explicitly sets the old defaults for users upgrading from pre-3.0.0
// versions, allowing them to continue using yarn and Jest without any changes to their
// development workflow.
//
// Changed Defaults:
// - packageManager: "yarn" → "pnpm" (Generated package.json uses pnpm for dependency management)
// - testFramework: "jest" → "vitest" (Generated tests use Vitest instead of Jest)
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// values that are explicitly undefined. This means:
// - If a user has explicitly configured a field, that value is preserved
// - If a field is undefined, the old default is set
// - Users can opt into modern tooling by removing these fields later
//
// Compatibility Notes:
// Vitest is not compatible with certain generator configurations:
// - useBigInt: true (Vitest doesn't handle BigInt serialization the same way as Jest)
// - streamType: wrapper (Older stream wrappers may not work with Vitest's ESM mode)
// - packagePath (custom paths) (May have module resolution issues with Vitest)
export const migration_3_0_0: Migration = {
    version: "3.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Only set old defaults if the fields are not already explicitly configured
            draft.packageManager ??= "yarn";
            draft.testFramework ??= "jest";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
