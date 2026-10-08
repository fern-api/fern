/**
 * The CLI-snippet catalog is the source of truth for CLI command names and flags.
 *
 * It is NOT recomputed at publish time: a one-off generation script runs fern's CLI SDK
 * generator runtime against the target CLI's own input specs, then commits the result next
 * to the customer's docs config (see PR 3). Publish-time injection only *consumes* this file,
 * so the catalog shape below is the stable contract between the generator and the assembler.
 *
 * Everything here is lifted verbatim from the runtime's `--schema` output — it is NOT re-derived:
 *  - command name + `httpMethod` + `path` come from the root `--schema` listing;
 *  - each input's `flag` is the runtime's own `resolve_param_flag_name` result (which accounts for
 *    `x-fern-parameter-name` renames, header casing, and the `-param` suffix added on collisions
 *    with a built-in flag), so re-deriving it with a kebab rule would silently diverge.
 * An input with no `flag` is one the runtime can only accept through the command's catch-all
 * `--params` flag (deep nesting, arrays-of-objects, free-form objects); the assembler routes those
 * into a single `--params '<json>'` payload.
 */

import { AbsoluteFilePath } from "@fern-api/fs-utils";

export type CliCatalogInputLocation = "path" | "query" | "header" | "body";

export interface CliCatalogInput {
    /** OpenAPI parameter / schema-property name, e.g. "AccountSid", "To". The join key to the FDR example field. */
    wireName: string;
    /** Where the value is read from in the FDR example. */
    location: CliCatalogInputLocation;
    /**
     * Literal CLI flag taken verbatim from `--schema` (e.g. "--account-sid", "--address.city").
     * Absent when the runtime exposes this input only via the command's `--params` catch-all — the
     * assembler then emits its value inside the `--params` payload instead of as a flag.
     */
    flag?: string;
    /**
     * Key path into the value container to read this input's value. Defaults to `[wireName]`.
     *
     * Set ONLY for genuinely nested body fields the runtime flattened into a dotted flag, e.g. the
     * flag `--address.city` carries `path: ["address", "city"]`. A body wire name that contains a dot
     * but is itself a top-level spec property (a *literal* dotted key such as `Parameter1.Name`) is
     * left with no `path`. The assembler relies on exactly this distinction: a dotted wire name with
     * no `path` means the whole body must be sent via `--json` (the runtime mis-nests the dot
     * otherwise — see assembleCliCommand's JSON_BODY_FLAG).
     */
    path?: string[];
    /** Whether the input is required (informational; the assembler emits whatever the example provides). */
    required?: boolean;
    /** Array-valued inputs repeat the flag once per element. */
    repeated?: boolean;
}

export interface CliCatalogCommand {
    /**
     * Full invocation tokens, e.g. ["twilio", "oauth", "v2", "token", "create"].
     * The assembler joins these with spaces and appends flags.
     */
    command: string[];
    /** The runtime `--schema` operation id (e.g. "oauth.v2.token.create"), kept for traceability. */
    operation?: string;
    /** Mapped namespace (catalog-side), e.g. "core". Used only to scope the join. */
    namespace?: string;
    /** HTTP method, e.g. "POST". */
    httpMethod: string;
    /** OpenAPI path string with the catalog's casing, e.g. "/2010-04-01/Accounts/{AccountSid}/Messages.json". */
    path: string;
    /** Inputs the command declares, in the order they should be emitted. */
    inputs: CliCatalogInput[];
}

export interface CliCatalogSource {
    /** Commit of the source spec repo the catalog was generated from (staleness diagnostics). */
    specCommit?: string;
    /** Version of the CLI SDK runtime used to generate the catalog (e.g. "fern-cli-sdk 0.18.1"). */
    runtimeVersion?: string;
    /** Free-form note about the generator invocation. */
    generatedWith?: string;
}

export interface CliCatalog {
    /** Catalog format version. Bump when the shape changes incompatibly. */
    version: 1;
    source?: CliCatalogSource;
    commands: CliCatalogCommand[];
}

/**
 * Per-API configuration that enables CLI-snippet injection for one API. Mirrors the
 * `cli-snippets` block the customer adds under their API entry (see PR 3). Default: disabled.
 */
export interface CliSnippetsConfig {
    /** Absolute path to the committed catalog JSON. */
    catalogAbsolutePath: AbsoluteFilePath;
    /**
     * Optional map from the API's own subpackage/namespace name to the catalog namespace it
     * corresponds to. Omitting it falls back to matching on method+path alone (the common case).
     */
    namespaces?: Record<string, string>;
}
