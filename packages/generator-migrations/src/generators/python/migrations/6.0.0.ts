import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Migration for version 6.0.0
//
// Context:
// Version 6.0.0 changes the default retry behavior. Previously, all 5xx status codes
// (>= 500) were retried. The new default only retries transient status codes:
// 408, 409, 429, 502, 503, 504. This avoids retrying 500 Internal Server Error,
// which is typically not transient and retrying can cause idempotency issues.
//
// Changed Default:
// - retryStatusCodes: "recommended" → "legacy" (when migrating from pre-6.0.0)
//   In v6, the recommended mode is the default. Setting this to "legacy" restores
//   the pre-6.0.0 behavior of retrying all >= 500 status codes.
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// the value if it is explicitly undefined. This means:
// - If a user has explicitly configured this field, that value is preserved
// - If the field is undefined, it is set to "legacy" for backwards compatibility
//
// This migration only applies to the SDK generator (`fernapi/fern-python-sdk`).
// The `retryStatusCodes` option does not exist on the pydantic-model or fastapi-server
// generators, so those configurations are passed through unchanged.
export const migration_6_0_0: Migration = {
    version: "6.0.0",

    migrateGeneratorConfig: ({ config }) => {
        const generatorName = "name" in config ? config.name : undefined;
        if (generatorName !== "fernapi/fern-python-sdk") {
            return config;
        }

        return migrateConfig(config, (draft) => {
            draft.retryStatusCodes ??= "legacy";
        });
    },

    migrateGeneratorsYml: ({ document }) => document
};
