import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 6.0.0
//
// Context:
// Version 6.0.0 changes the default retry status codes from `legacy` to `recommended`.
// Under `legacy`, all 5xx status codes (including 500) are retried along with 408, 409, and 429.
// Under `recommended`, only 408, 409, 429, 502, 503, and 504 are retried, avoiding
// idempotency issues when retrying non-transient errors like 500 Internal Server Error.
//
// This migration explicitly sets `retry_status_codes: "legacy"` for users upgrading from
// pre-6.0.0 versions, preserving their current retry behavior. Users can opt into the
// new defaults by removing the field or setting `retry_status_codes: "recommended"`.
export const migration_6_0_0: Migration = {
    version: "6.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            draft.retry_status_codes ??= "legacy";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
