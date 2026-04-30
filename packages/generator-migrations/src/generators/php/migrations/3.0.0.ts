import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 3.0.0
//
// Context:
// Version 3.0.0 changes the default retry behavior to only retry on transient
// 5xx status codes (408, 429, 502, 503, 504), excluding 500 Internal Server Error.
//
// Changed Defaults:
// - retryStatusCodes: undefined (legacy behavior: 408, 429, >= 500) → "recommended" (408, 429, 502, 503, 504)
//
// Migration Strategy:
// This migration pins existing users to "legacy" so their retry behavior
// does not change on upgrade. New users get "recommended" by default.
export const migration_3_0_0: Migration = {
    version: "3.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.retryStatusCodes ??= "legacy";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
