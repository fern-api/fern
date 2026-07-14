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
     * OAuth flows wired into the generated CLI runtime. Each `scheme` must
     * match an auth scheme key in the Fern IR.
     */
    oauth?: OAuthConfig[];
}

interface OAuthConfigBase {
    scheme: string;
    scopes?: string[];
}

export interface OAuthClientCredentialsConfig extends OAuthConfigBase {
    flow: "client-credentials";
    tokenUrl: string;
    clientIdEnv?: string;
    clientSecretEnv?: string;
}

export interface OAuthPkceConfig extends OAuthConfigBase {
    flow: "pkce";
    authorizationUrl: string;
    tokenUrl: string;
    clientId: string;
    redirectPort?: number;
    tokenPasteUrl?: string;
}

export interface OAuthDeviceCodeConfig extends OAuthConfigBase {
    flow: "device-code";
    deviceAuthorizationUrl: string;
    tokenUrl: string;
    clientId: string;
    tokenPasteUrl?: string;
}

export type OAuthConfig = OAuthClientCredentialsConfig | OAuthPkceConfig | OAuthDeviceCodeConfig;

const DEFAULT_FERN_CLI_CUSTOM_CONFIG: FernCliCustomConfig = { customCommands: true };

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
    if ("oauth" in obj && obj.oauth !== undefined) {
        if (!Array.isArray(obj.oauth)) {
            throw new Error(`Invalid customConfig.oauth: expected an array.`);
        }
        result.oauth = obj.oauth.map((value, index) => validateOAuthConfig(value, index));
        const schemes = new Set<string>();
        for (const oauth of result.oauth) {
            if (schemes.has(oauth.scheme)) {
                throw new Error(`Invalid customConfig.oauth: duplicate scheme "${oauth.scheme}".`);
            }
            schemes.add(oauth.scheme);
        }
    }
    return result;
}

function validateOAuthConfig(raw: unknown, index: number): OAuthConfig {
    const field = `customConfig.oauth[${index}]`;
    const obj = requireRecord(raw, field);
    const scheme = requireString(obj.scheme, `${field}.scheme`);
    const flow = requireString(obj.flow, `${field}.flow`);
    const scopes = optionalStringArray(obj.scopes, `${field}.scopes`);
    switch (flow) {
        case "client-credentials":
            return {
                flow,
                scheme,
                tokenUrl: requireUrl(obj.tokenUrl, `${field}.tokenUrl`),
                clientIdEnv: optionalString(obj.clientIdEnv, `${field}.clientIdEnv`),
                clientSecretEnv: optionalString(obj.clientSecretEnv, `${field}.clientSecretEnv`),
                scopes
            };
        case "pkce":
            return {
                flow,
                scheme,
                authorizationUrl: requireUrl(obj.authorizationUrl, `${field}.authorizationUrl`),
                tokenUrl: requireUrl(obj.tokenUrl, `${field}.tokenUrl`),
                clientId: requireString(obj.clientId, `${field}.clientId`),
                redirectPort: optionalPort(obj.redirectPort, `${field}.redirectPort`),
                scopes,
                tokenPasteUrl: optionalUrl(obj.tokenPasteUrl, `${field}.tokenPasteUrl`)
            };
        case "device-code":
            return {
                flow,
                scheme,
                deviceAuthorizationUrl: requireUrl(obj.deviceAuthorizationUrl, `${field}.deviceAuthorizationUrl`),
                tokenUrl: requireUrl(obj.tokenUrl, `${field}.tokenUrl`),
                clientId: requireString(obj.clientId, `${field}.clientId`),
                scopes,
                tokenPasteUrl: optionalUrl(obj.tokenPasteUrl, `${field}.tokenPasteUrl`)
            };
        default:
            throw new Error(
                `Invalid ${field}.flow: expected "client-credentials", "pkce", or "device-code", got "${flow}".`
            );
    }
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Invalid ${field}: expected an object.`);
    }
    return value as Record<string, unknown>;
}

function requireString(value: unknown, field: string): string {
    const result = optionalString(value, field);
    if (result == null) {
        throw new Error(`Invalid ${field}: expected a non-empty string.`);
    }
    return result;
}

function optionalString(value: unknown, field: string): string | undefined {
    if (value == null) {
        return undefined;
    }
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`Invalid ${field}: expected a non-empty string.`);
    }
    return value;
}

function requireUrl(value: unknown, field: string): string {
    const result = requireString(value, field);
    validateUrl(result, field);
    return result;
}

function optionalUrl(value: unknown, field: string): string | undefined {
    const result = optionalString(value, field);
    if (result != null) {
        validateUrl(result, field);
    }
    return result;
}

function validateUrl(value: string, field: string): void {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new Error(`Invalid ${field}: expected an absolute HTTP(S) URL.`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`Invalid ${field}: expected an absolute HTTP(S) URL.`);
    }
}

function optionalStringArray(value: unknown, field: string): string[] | undefined {
    if (value == null) {
        return undefined;
    }
    if (!Array.isArray(value)) {
        throw new Error(`Invalid ${field}: expected an array of strings.`);
    }
    return value.map((item, index) => requireString(item, `${field}[${index}]`));
}

function optionalPort(value: unknown, field: string): number | undefined {
    if (value == null) {
        return undefined;
    }
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 65_535) {
        throw new Error(`Invalid ${field}: expected an integer between 1 and 65535.`);
    }
    return value;
}
