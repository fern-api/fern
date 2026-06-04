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
     * When true (the default), the generator invokes `@fern-api/rust-model`
     * to produce a `<binaryName>-types` library crate alongside the CLI
     * crate. Custom command handlers can import typed serde structs from
     * the types crate for serialization / deserialization while all HTTP
     * execution stays on the native CLI executor (`ctx.invoke()`).
     *
     * Set to `false` to disable types generation.
     */
    embedTypes?: boolean;
}

const DEFAULT_FERN_CLI_CUSTOM_CONFIG: FernCliCustomConfig = { embedTypes: true };

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
    if ("embedTypes" in obj && obj.embedTypes !== undefined) {
        if (typeof obj.embedTypes !== "boolean") {
            throw new Error(`Invalid customConfig.embedTypes: expected a boolean, got ${typeof obj.embedTypes}.`);
        }
        result.embedTypes = obj.embedTypes;
    }
    return result;
}
