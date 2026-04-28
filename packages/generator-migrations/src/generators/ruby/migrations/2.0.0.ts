import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 2.0.0
//
// Context:
// Version 2.0.0 changes the default retry behavior to only retry on transient
// HTTP status codes (408, 429, 502, 503, 504), excluding 500 Internal Server Error
// and Cloudflare-specific codes (521, 522, 524) that were previously retried.
//
// This migration explicitly pins the old default ("legacy") for users upgrading
// from pre-2.0.0 versions, so their retry behavior remains unchanged.
//
// Changed Defaults:
// - retryStatusCodes: "legacy" → "recommended"
//   legacy: [408, 429, 500, 502, 503, 504, 521, 522, 524]
//   recommended: [408, 429, 502, 503, 504]
//
// Migration Strategy:
// Uses nullish coalescing assignment to only set the value if not already configured.
export const migration_2_0_0: Migration = {
    version: "2.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.retryStatusCodes ??= "legacy";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
