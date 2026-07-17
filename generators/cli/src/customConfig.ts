import { GeneratorConfig } from "@fern-api/base-generator";

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
    return result;
}
