import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 1.0.0
//
// Context:
// Version 1.0.0 changes the default retry behavior to only retry on transient
// HTTP status codes (408, 429, 502, 503, 504), instead of all >= 500.
//
// This migration explicitly pins the old default ("legacy") for users upgrading
// from pre-1.0.0 versions, so their retry behavior remains unchanged.
//
// Changed Defaults:
// - retryStatusCodes: "legacy" → "recommended"
//   legacy: 408, 429, >= 500
//   recommended: 408, 429, 502, 503, 504
export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.retryStatusCodes ??= "legacy";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
