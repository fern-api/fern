import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 4.54.4
//
// Context:
// Version 4.54.4 changed the behavior of `pydantic_config.use_provided_defaults`. Previously,
// enabling this flag applied OpenAPI/IR-provided defaults to query params, headers, request
// body parameters, and pydantic model fields. As of 4.54.4 the flag no longer applies defaults
// to inlined request body properties or pydantic model fields — effectively narrowing its scope
// to query params and headers only.
//
// The 4.54.4 generator also introduces a new top-level `use_request_defaults` option that
// supersedes `pydantic_config.use_provided_defaults` and has three modes:
//   - "none": no defaults applied anywhere
//   - "parameters": defaults on query params and headers only
//   - "all": defaults on query params, headers, request body params, and pydantic model fields
//
// `use_request_defaults: all` reproduces the pre-4.54.4 behavior of
// `pydantic_config.use_provided_defaults: true`.
//
// Migration Strategy:
// To preserve the previous generator output for users who opted into applied defaults
// (i.e. had `pydantic_config.use_provided_defaults: true`), set `use_request_defaults: "all"`
// at the top level when:
//   - `pydantic_config.use_provided_defaults` is explicitly `true`, AND
//   - `use_request_defaults` is not already configured.
//
// Users who did not have `use_provided_defaults: true` are unaffected by this change and
// require no migration.
//
// This migration only applies to the SDK generator (`fernapi/fern-python-sdk`). The
// `use_request_defaults` option does not exist on the pydantic-model or fastapi-server
// generators, so those configurations are passed through unchanged.
export const migration_4_54_4: Migration = {
    version: "4.54.4",

    migrateGeneratorConfig: ({ config }) => {
        // use_request_defaults only exists on the Python SDK generator's config schema.
        // Custom-image generators (which use `image` instead of `name`) are user-managed
        // and are passed through unchanged.
        const generatorName = "name" in config ? config.name : undefined;
        if (generatorName !== "fernapi/fern-python-sdk") {
            return config;
        }

        return migrateConfig(config, (draft) => {
            const pydanticConfig = draft.pydantic_config;
            const hadUseProvidedDefaultsTrue =
                typeof pydanticConfig === "object" &&
                pydanticConfig !== null &&
                (pydanticConfig as Record<string, unknown>).use_provided_defaults === true;

            if (hadUseProvidedDefaultsTrue) {
                // Only set if not already explicitly configured so user overrides are preserved.
                draft.use_request_defaults ??= "all";
            }
        });
    },

    migrateGeneratorsYml: ({ document }) => document
};
