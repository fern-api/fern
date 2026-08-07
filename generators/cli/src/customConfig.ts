import { GeneratorConfig } from "@fern-api/base-generator";
import type { CargoPackageIdentity } from "./patchCargoToml.js";

/**
 * User-supplied configuration the CLI generator reads from
 * `generators.yml`'s `config:` block. All fields are optional — defaults
 * come from the mounted spec's `info.*` whenever an override is absent.
 */
export interface FernCliCustomConfig {
    /**
     * Overrides the binary's name. When omitted, the generator derives
     * the name from a single mounted OpenAPI spec's `info.title`
     * (kebab-cased). Multi-spec workspaces *must* set this field — there
     * is no sensible auto-derivation when multiple specs are present.
     */
    binaryName?: string;

    /**
     * When true (the default), the generator produces the full custom
     * command infrastructure alongside the CLI binary:
     *   - `<binaryName>-types` library crate (typed serde structs)
     *   - `<binaryName>-sdk` library crate (HTTP client with `ctx.client()`)
     *   - `sdk.rs` (bridges CLI's AppContext to the SDK client)
     *   - `custom.rs` scaffold (user-authored command handlers)
     *
     * Set to `false` to produce a spec-only CLI with no custom command
     * support.
     */
    customCommands?: boolean;

    /**
     * Mount all spec-derived commands under a namespace prefix.
     *
     * Without `rootGroup`, generated commands are top-level:
     *   `cli users list`, `cli files get`
     *
     * With `rootGroup: "api"`, they nest one level:
     *   `cli api users list`, `cli api files get`
     *
     * Custom commands grafted at root (`command_under(&["recipes"], …)`)
     * sit beside the namespace node.
     */
    rootGroup?: string;

    /**
     * Name of the global flag (and, by derivation, the environment
     * variable) a downstream consumer uses to append a product token to
     * the generated CLI's `User-Agent`.
     *
     * The value is the flag's long name *without* the leading `--`. It
     * must be a clap-safe kebab identifier (`^[a-z][a-z0-9-]*$`).
     *
     * When omitted, defaults to `user-agent-suffix`, so the CLI exposes
     * `--user-agent-suffix` and `<NAME>_USER_AGENT_SUFFIX`. Setting
     * `userAgentSuffixFlag: "via"` instead exposes `--via` and
     * `<NAME>_VIA` (the env var is `<NAME>_` + the flag uppercased with
     * hyphens converted to underscores).
     */
    userAgentSuffixFlag?: string;

    /**
     * When true, the generator emits an automated wire-test suite alongside
     * the CLI: `wiremock/wire-test-cases.json` (one case per endpoint
     * example) and `tests/wire_test.rs` (a generic harness that stands up an
     * in-process mock server, drives the compiled binary, and asserts the
     * request/response). `seed`'s `cargo test --all-features` runs these
     * automatically — no docker, no network.
     *
     * Defaults to `false` so existing generations are unaffected until a
     * consumer opts in.
     */
    generateWireTests?: boolean;

    /**
     * Command-backed login flows, keyed by auth-scheme name (the `key` in
     * `generators.yml`'s `auth-schemes`). When a scheme is listed here, the
     * generated CLI's `<bin> auth login` runs the configured command to mint
     * a token, parses the JWT `exp` claim, caches the token in the OS keyring,
     * and re-mints automatically when it's about to expire — so the CLI owns
     * the token lifecycle instead of a wrapper script.
     *
     * This is the native path for tokens produced by a command rather than an
     * OAuth token endpoint (e.g. Google service-account impersonation via
     * `gcloud auth print-identity-token …`). The command runs through the
     * platform shell; its stdout (trimmed) is the token.
     *
     * `header`/`prefix` default from the scheme itself — a `header` scheme
     * contributes its literal header name and prefix, a `bearer` scheme
     * contributes `Authorization` + `Bearer` — and may be overridden here.
     */
    tokenCommands?: Record<string, TokenCommandConfig>;

    /**
     * Overrides the generated crate's `[package]` identity — the metadata
     * cargo (and cargo-dist's installers) publish under.
     *
     * When omitted, the crate keeps the SDK template's Fern-owned
     * identity (`fern-cli-sdk`, `github.com/fern-api/cli-sdk`), which is
     * what every existing generation ships today.
     *
     * The `[lib]` name (`fern_cli_sdk`) is deliberately not configurable:
     * every `use fern_cli_sdk::...` in the vendored `src/` tree depends
     * on it. Only `[package]` metadata is templated.
     */
    packageIdentity?: CargoPackageIdentity;
}

/**
 * A single command-backed login flow. `command` is required; `header` and
 * `prefix` override the header placement derived from the auth scheme.
 */
export interface TokenCommandConfig {
    /** Shell command whose trimmed stdout is the minted token. */
    command: string;
    /** Header the token is applied to. Defaults from the scheme. */
    header?: string;
    /** Prefix prepended to the token (e.g. `Bearer`). Defaults from the scheme. */
    prefix?: string;
}

const DEFAULT_FERN_CLI_CUSTOM_CONFIG: FernCliCustomConfig = { customCommands: true };

/**
 * Built-in global flag long names the generated CLI always registers. A
 * `userAgentSuffixFlag` that matches one of these would register a second
 * clap arg with the same `.long(...)` and panic on every invocation, so we
 * reject it at the boundary.
 *
 * Mirrors `BUILTIN_FLAG_NAMES` in
 * `generators/cli/sdk/src/openapi/commands.rs`, minus `user-agent-suffix` —
 * that is the suffix flag's own default slot and must stay selectable.
 * `help` is included because clap always auto-registers `--help`. Keep in
 * sync if the SDK's reserved list changes.
 */
const RESERVED_SUFFIX_FLAG_NAMES: ReadonlySet<string> = new Set([
    "params",
    "output",
    "json",
    "format",
    "dry-run",
    "base-url",
    "page-all",
    "page-limit",
    "page-delay",
    "no-pager",
    "no-extract",
    "no-retry",
    "no-stream",
    "quiet",
    "query",
    "help",
    "debug",
    "schema"
]);

export function getCustomConfig(generatorConfig: GeneratorConfig): FernCliCustomConfig {
    if (generatorConfig.customConfig == null) {
        return DEFAULT_FERN_CLI_CUSTOM_CONFIG;
    }
    return validateCustomConfig(generatorConfig.customConfig);
}

/**
 * Boundary validation for user-supplied `customConfig`. Replaces the
 * old `as unknown as FernCliCustomConfig` cast so a `binaryName: 42`
 * surfaces a clear error here, instead of crashing inside
 * `toKebabCase` with a "trim is not a function" stack trace.
 */
export function validateCustomConfig(raw: unknown): FernCliCustomConfig {
    if (raw == null) {
        return DEFAULT_FERN_CLI_CUSTOM_CONFIG;
    }
    if (typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error(
            `Invalid customConfig: expected an object, got ${typeof raw === "object" ? "array" : typeof raw}.`
        );
    }
    const obj = raw as Record<string, unknown>;
    const result: FernCliCustomConfig = {};
    if ("binaryName" in obj && obj.binaryName !== undefined) {
        if (typeof obj.binaryName !== "string") {
            throw new Error(`Invalid customConfig.binaryName: expected a string, got ${typeof obj.binaryName}.`);
        }
        result.binaryName = obj.binaryName;
    }
    if ("customCommands" in obj && obj.customCommands !== undefined) {
        if (typeof obj.customCommands !== "boolean") {
            throw new Error(
                `Invalid customConfig.customCommands: expected a boolean, got ${typeof obj.customCommands}.`
            );
        }
        result.customCommands = obj.customCommands;
    }
    if ("rootGroup" in obj && obj.rootGroup !== undefined) {
        if (typeof obj.rootGroup !== "string") {
            throw new Error(`Invalid customConfig.rootGroup: expected a string, got ${typeof obj.rootGroup}.`);
        }
        if (!/^[a-z][a-z0-9_-]*$/.test(obj.rootGroup)) {
            throw new Error(
                `Invalid customConfig.rootGroup: "${obj.rootGroup}" contains invalid characters. ` +
                    "Must start with a lowercase letter and contain only [a-z0-9_-]."
            );
        }
        result.rootGroup = obj.rootGroup;
    }
    if ("userAgentSuffixFlag" in obj && obj.userAgentSuffixFlag !== undefined) {
        if (typeof obj.userAgentSuffixFlag !== "string") {
            throw new Error(
                `Invalid customConfig.userAgentSuffixFlag: expected a string, got ${typeof obj.userAgentSuffixFlag}.`
            );
        }
        if (!/^[a-z][a-z0-9-]*$/.test(obj.userAgentSuffixFlag)) {
            throw new Error(
                `Invalid customConfig.userAgentSuffixFlag: "${obj.userAgentSuffixFlag}" is not a valid flag name. ` +
                    'Provide the long flag name without the leading "--": it must start with a lowercase ' +
                    'letter and contain only [a-z0-9-] (e.g. "via" or "user-agent-suffix").'
            );
        }
        if (RESERVED_SUFFIX_FLAG_NAMES.has(obj.userAgentSuffixFlag)) {
            throw new Error(
                `Invalid customConfig.userAgentSuffixFlag: "${obj.userAgentSuffixFlag}" is a built-in flag name ` +
                    "and would collide with the CLI's own global flags. Choose a different name " +
                    '(e.g. "via" or "app-info").'
            );
        }
        result.userAgentSuffixFlag = obj.userAgentSuffixFlag;
    }
    if ("generateWireTests" in obj && obj.generateWireTests !== undefined) {
        if (typeof obj.generateWireTests !== "boolean") {
            throw new Error(
                `Invalid customConfig.generateWireTests: expected a boolean, got ${typeof obj.generateWireTests}.`
            );
        }
        result.generateWireTests = obj.generateWireTests;
    }
    if ("tokenCommands" in obj && obj.tokenCommands !== undefined) {
        result.tokenCommands = validateTokenCommands(obj.tokenCommands);
    }
    if ("packageIdentity" in obj && obj.packageIdentity !== undefined) {
        result.packageIdentity = validatePackageIdentity(obj.packageIdentity);
    }
    return result;
}

function validateTokenCommands(raw: unknown): Record<string, TokenCommandConfig> {
    if (typeof raw !== "object" || raw == null || Array.isArray(raw)) {
        throw new Error(
            `Invalid customConfig.tokenCommands: expected an object, got ${Array.isArray(raw) ? "array" : typeof raw}.`
        );
    }
    const result: Record<string, TokenCommandConfig> = {};
    for (const [scheme, value] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof value !== "object" || value == null || Array.isArray(value)) {
            throw new Error(`Invalid customConfig.tokenCommands.${scheme}: expected an object.`);
        }
        const entry = value as Record<string, unknown>;
        if (typeof entry.command !== "string" || entry.command.trim() === "") {
            throw new Error(`Invalid customConfig.tokenCommands.${scheme}.command: expected a non-empty string.`);
        }
        const config: TokenCommandConfig = { command: entry.command };
        if (entry.header !== undefined) {
            if (typeof entry.header !== "string") {
                throw new Error(
                    `Invalid customConfig.tokenCommands.${scheme}.header: expected a string, got ${typeof entry.header}.`
                );
            }
            config.header = entry.header;
        }
        if (entry.prefix !== undefined) {
            if (typeof entry.prefix !== "string") {
                throw new Error(
                    `Invalid customConfig.tokenCommands.${scheme}.prefix: expected a string, got ${typeof entry.prefix}.`
                );
            }
            config.prefix = entry.prefix;
        }
        result[scheme] = config;
    }
    return result;
}

/**
 * A cargo crate name: lowercase-ish alphanumerics plus `-`/`_`, starting
 * with a letter. Rejecting here keeps a malformed name from reaching
 * `cargo build`, where it surfaces as an opaque manifest-parse error.
 */
const CRATE_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

const PACKAGE_IDENTITY_STRING_FIELDS = ["name", "description", "license", "repository", "homepage"] as const;
const PACKAGE_IDENTITY_ARRAY_FIELDS = ["authors", "keywords"] as const;

function validatePackageIdentity(raw: unknown): CargoPackageIdentity {
    if (typeof raw !== "object" || raw == null || Array.isArray(raw)) {
        throw new Error(
            `Invalid customConfig.packageIdentity: expected an object, got ${Array.isArray(raw) ? "array" : typeof raw}.`
        );
    }
    const obj = raw as Record<string, unknown>;
    const result: CargoPackageIdentity = {};

    for (const field of PACKAGE_IDENTITY_STRING_FIELDS) {
        const value = obj[field];
        if (value === undefined) {
            continue;
        }
        if (typeof value !== "string") {
            throw new Error(`Invalid customConfig.packageIdentity.${field}: expected a string, got ${typeof value}.`);
        }
        result[field] = value;
    }

    for (const field of PACKAGE_IDENTITY_ARRAY_FIELDS) {
        const value = obj[field];
        if (value === undefined) {
            continue;
        }
        if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
            throw new Error(`Invalid customConfig.packageIdentity.${field}: expected an array of strings.`);
        }
        result[field] = value as string[];
    }

    if (result.name != null && !CRATE_NAME_PATTERN.test(result.name)) {
        throw new Error(
            `Invalid customConfig.packageIdentity.name: "${result.name}" is not a valid cargo crate name. ` +
                "It must start with a letter and contain only [A-Za-z0-9_-]."
        );
    }

    return result;
}
