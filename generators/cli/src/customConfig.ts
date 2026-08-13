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

    /**
     * Opt-in binary distribution channels layered on top of the GitHub
     * Release archives every generated CLI already ships.
     *
     * Absent by default — output is byte-identical to a generation
     * without the block, so enabling a channel is never a breaking
     * change for an existing consumer.
     *
     * Only honored for `output.location: github`; both channels publish
     * *from* a tagged GitHub Release, so there is nothing to wire up
     * when the generator writes to local files.
     */
    distribution?: FernCliDistributionConfig;
}

/**
 * Package-manager channels the generated CLI publishes to on each
 * `vX.Y.Z` tag. Both are independently optional.
 */
export interface FernCliDistributionConfig {
    /**
     * Publish a Homebrew formula to a tap repository. Handled natively
     * by cargo-dist: enabling this flips `installers`/`publish-jobs` in
     * `dist-workspace.toml` and adds a `publish-homebrew-formula` job to
     * the cargo-dist `release.yml`.
     */
    homebrew?: FernCliHomebrewConfig;

    /**
     * Publish a Scoop manifest to a bucket repository. cargo-dist has no
     * Scoop support, so the generator emits its own `publish-scoop` job
     * into `ci.yml` that renders the manifest from the released Windows
     * archive.
     */
    scoop?: FernCliScoopConfig;
}

export interface FernCliHomebrewConfig {
    /**
     * The tap repository, as `<owner>/<repo>` — e.g.
     * `acme/homebrew-tap`. Must already exist and be public.
     */
    tap: string;

    /**
     * Formula name, which is also the `.rb` filename Homebrew resolves
     * `brew install <tap>/<formula>` against. Defaults to the binary
     * name.
     */
    formula?: string;

    /**
     * GitHub Actions secret holding a token with write access to the tap
     * repo. Defaults to `HOMEBREW_TAP_TOKEN`.
     */
    tokenEnvironmentVariable?: string;
}

export interface FernCliScoopConfig {
    /**
     * The bucket repository, as `<owner>/<repo>` — e.g.
     * `acme/scoop-bucket`. Must already exist and be public.
     */
    bucket: string;

    /**
     * GitHub Actions secret holding a token with write access to the
     * bucket repo. Defaults to `SCOOP_BUCKET_TOKEN`.
     */
    tokenEnvironmentVariable?: string;
}

export const DEFAULT_HOMEBREW_TOKEN_ENV_VAR = "HOMEBREW_TAP_TOKEN";
export const DEFAULT_SCOOP_TOKEN_ENV_VAR = "SCOOP_BUCKET_TOKEN";

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
    if ("packageIdentity" in obj && obj.packageIdentity !== undefined) {
        result.packageIdentity = validatePackageIdentity(obj.packageIdentity);
    }
    if ("distribution" in obj && obj.distribution !== undefined) {
        result.distribution = validateDistribution(obj.distribution);
    }
    return result;
}

/**
 * `<owner>/<repo>`. Both channels interpolate this straight into a
 * workflow's `repository:` field, so a malformed value would produce a
 * pipeline that only fails at release time.
 */
const GITHUB_REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

/**
 * A GitHub Actions secret name. We interpolate this into
 * `secrets.<NAME>`, so anything outside SCREAMING_SNAKE_CASE would emit
 * syntactically broken YAML rather than a clear error.
 */
const SECRET_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

/** Homebrew formula filenames are kebab-case. */
const FORMULA_NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

function validateDistribution(raw: unknown): FernCliDistributionConfig {
    const obj = asConfigObject(raw, "customConfig.distribution");
    const result: FernCliDistributionConfig = {};
    if (obj.homebrew !== undefined) {
        result.homebrew = validateHomebrew(obj.homebrew);
    }
    if (obj.scoop !== undefined) {
        result.scoop = validateScoop(obj.scoop);
    }
    return result;
}

function validateHomebrew(raw: unknown): FernCliHomebrewConfig {
    const path = "customConfig.distribution.homebrew";
    const obj = asConfigObject(raw, path);
    const result: FernCliHomebrewConfig = {
        tap: requireRepoSlug(obj.tap, `${path}.tap`, "acme/homebrew-tap")
    };
    if (obj.formula !== undefined) {
        if (typeof obj.formula !== "string" || !FORMULA_NAME_PATTERN.test(obj.formula)) {
            throw new Error(
                `Invalid ${path}.formula: ${JSON.stringify(obj.formula)} is not a valid Homebrew formula name. ` +
                    "It must start with a lowercase letter and contain only [a-z0-9-]."
            );
        }
        result.formula = obj.formula;
    }
    const token = optionalSecretName(obj.tokenEnvironmentVariable, `${path}.tokenEnvironmentVariable`);
    if (token != null) {
        result.tokenEnvironmentVariable = token;
    }
    return result;
}

function validateScoop(raw: unknown): FernCliScoopConfig {
    const path = "customConfig.distribution.scoop";
    const obj = asConfigObject(raw, path);
    const result: FernCliScoopConfig = {
        bucket: requireRepoSlug(obj.bucket, `${path}.bucket`, "acme/scoop-bucket")
    };
    const token = optionalSecretName(obj.tokenEnvironmentVariable, `${path}.tokenEnvironmentVariable`);
    if (token != null) {
        result.tokenEnvironmentVariable = token;
    }
    return result;
}

function asConfigObject(raw: unknown, path: string): Record<string, unknown> {
    if (typeof raw !== "object" || raw == null || Array.isArray(raw)) {
        throw new Error(`Invalid ${path}: expected an object, got ${Array.isArray(raw) ? "array" : typeof raw}.`);
    }
    return raw as Record<string, unknown>;
}

function requireRepoSlug(value: unknown, path: string, example: string): string {
    if (typeof value !== "string" || !GITHUB_REPO_PATTERN.test(value)) {
        throw new Error(
            `Invalid ${path}: ${JSON.stringify(value)} is not a GitHub repository. ` +
                `Provide it as "<owner>/<repo>" (e.g. "${example}").`
        );
    }
    return value;
}

function optionalSecretName(value: unknown, path: string): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "string" || !SECRET_NAME_PATTERN.test(value)) {
        throw new Error(
            `Invalid ${path}: ${JSON.stringify(value)} is not a valid GitHub Actions secret name. ` +
                "It must start with an uppercase letter and contain only [A-Z0-9_]."
        );
    }
    if (value === "GITHUB_TOKEN") {
        throw new Error(
            `Invalid ${path}: GITHUB_TOKEN cannot be used here. The workflow's built-in token is scoped to ` +
                "this repository and cannot push to the tap/bucket repository. Create a personal access " +
                "token (or GitHub App token) with write access to that repository and store it under a " +
                "different secret name."
        );
    }
    return value;
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
