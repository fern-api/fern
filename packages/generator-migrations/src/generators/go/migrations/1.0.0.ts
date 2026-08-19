import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 1.0.0
//
// Context:
// Version 1.0.0 changes the default retry status codes from `legacy` to `recommended`.
// Under `legacy`, all 5xx status codes (including 500) are retried along with 408 and 429.
// Under `recommended`, only 408, 429, 502, 503, and 504 are retried, avoiding
// idempotency issues when retrying non-transient errors like 500 Internal Server Error.
//
// This migration explicitly sets `retryStatusCodes: "legacy"` for users upgrading from
// pre-1.0.0 versions, preserving their current retry behavior.
export const migration_1_0_0: Migration = {
    version: "1.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.retryStatusCodes ??= "legacy";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
