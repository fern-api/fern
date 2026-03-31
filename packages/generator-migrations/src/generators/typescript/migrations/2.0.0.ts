import type { Migration } from "@fern-api/migrations-base";
import { migrateConfig } from "@fern-api/migrations-base";

// Note: This is not a JSDoc comment because we want this to be stripped from the compiled output

// Migration for version 2.0.0
//
// Context:
// Version 2.0.0 introduced zero-dependency SDKs by default, using native browser and
// Node.js APIs instead of external packages. This significantly reduces bundle size
// and eliminates dependency management issues, but requires Node.js 18+ and modern
// browsers with native fetch/streams support.
//
// For users upgrading from pre-2.0.0 versions who need to maintain compatibility with
// older runtimes, this migration explicitly sets the old defaults that use polyfills
// and wrapper libraries.
//
// Changed Defaults:
// - streamType: "wrapper" → "web" (Uses native Web Streams API instead of wrapper library)
// - fileResponseType: "stream" → "binary-response" (Returns binary response instead of stream wrapper)
// - formDataSupport: "Node16" → "Node18" (Uses native FormData (Node 18+) instead of polyfill)
// - fetchSupport: "node-fetch" → "native" (Uses native fetch (Node 18+/browsers) instead of node-fetch)
//
// Migration Strategy:
// This migration uses the nullish coalescing assignment operator (??=) to only set
// values that are explicitly undefined. This means:
// - If a user has explicitly configured a field, that value is preserved
// - If a field is undefined, the old default (with dependencies) is set
// - Users can opt into zero-dependency mode by removing these fields later
export const migration_2_0_0: Migration = {
    version: "2.0.0",

    migrateGeneratorConfig: ({ config }) =>
        migrateConfig(config, (draft) => {
            // Only set old defaults if the fields are not already explicitly configured
            draft.streamType ??= "wrapper";
            draft.fileResponseType ??= "stream";
            draft.formDataSupport ??= "Node16";
            draft.fetchSupport ??= "node-fetch";
        }),

    migrateGeneratorsYml: ({ document }) => document
};
