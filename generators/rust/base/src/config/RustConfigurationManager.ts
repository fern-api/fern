import { z } from "zod";
import { AbstractRustGeneratorContext, BaseRustCustomConfigSchema } from "../context/AbstractRustGeneratorContext";
import { RUST_KEYWORDS, RUST_RESERVED_TYPES } from "../constants";

/**
 * Centralized configuration manager for Rust generators.
 * Provides type-safe access to configuration options with validation and fallbacks.
 */
export class RustConfigurationManager<T extends BaseRustCustomConfigSchema> {
    constructor(
        private readonly config: T,
        private readonly context: AbstractRustGeneratorContext<T>
    ) {}

    /**
     * Get a configuration value with optional fallback
     */
    public get<K extends keyof T>(key: K): T[K];
    public get<K extends keyof T>(key: K, fallback: NonNullable<T[K]>): NonNullable<T[K]>;
    public get<K extends keyof T>(key: K, fallback?: T[K]): T[K] | NonNullable<T[K]> {
        const value = this.config[key];
        if (value !== undefined) {
            return value;
        }
        if (fallback !== undefined) {
            return fallback;
        }
        return value;
    }

    /**
     * Get the package name with validation and fallback to default
     */
    public getPackageName(): string {
        const packageName = this.config.packageName ?? this.generateDefaultPackageName();
        return this.validateAndSanitizePackageName(packageName);
    }

    /**
     * Get the package version with fallback to default
     */
    public getPackageVersion(): string {
        return this.config.packageVersion ?? "0.1.0";
    }

    /**
     * Get extra dependencies with empty object fallback
     */
    public getExtraDependencies(): Record<string, string> {
        return this.config.extraDependencies ?? {};
    }

    /**
     * Get extra dev dependencies with empty object fallback
     */
    public getExtraDevDependencies(): Record<string, string> {
        return this.config.extraDevDependencies ?? {};
    }

    /**
     * Check if a configuration key exists and has a non-undefined value
     */
    public has<K extends keyof T>(key: K): boolean {
        return this.config[key] !== undefined;
    }

    /**
     * Escape Rust keywords by prefixing with 'r#'
     */
    public escapeRustKeyword(name: string): string {
        return RUST_KEYWORDS.has(name) ? `r#${name}` : name;
    }

    /**
     * Escape Rust reserved types by prefixing with 'r#'
     */
    public escapeRustReservedType(name: string): string {
        return RUST_RESERVED_TYPES.has(name) ? `r#${name}` : name;
    }

    /**
     * Validate that a string is a valid Rust identifier
     */
    public isValidRustIdentifier(name: string): boolean {
        // Rust identifier: starts with letter or underscore, followed by letters, digits, or underscores
        const rustIdentifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        return rustIdentifierRegex.test(name) && !RUST_KEYWORDS.has(name);
    }

    /**
     * Validate semver format
     */
    public isValidSemver(version: string): boolean {
        // Basic semver validation (major.minor.patch)
        const semverRegex = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9\-.]+)?(?:\+[a-zA-Z0-9\-.]+)?$/;
        return semverRegex.test(version);
    }

    /**
     * Generate default package name from organization and API name
     */
    private generateDefaultPackageName(): string {
        const orgName = this.context.config.organization;
        const apiName = this.context.ir.apiName.snakeCase.unsafeName;
        return `${orgName}_${apiName}`.toLowerCase();
    }

    /**
     * Validate and sanitize package name for Rust crate naming conventions
     */
    private validateAndSanitizePackageName(packageName: string): string {
        // Rust crate names must be lowercase alphanumeric with hyphens and underscores
        // Cannot start with numbers
        let sanitized = packageName
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "_") // Replace invalid chars with underscore
            .replace(/^[0-9]/, "_$&"); // Prefix numbers at start with underscore

        // Remove consecutive underscores/hyphens
        sanitized = sanitized.replace(/[_-]+/g, "_");

        // Remove leading/trailing underscores
        sanitized = sanitized.replace(/^_+|_+$/g, "");

        // Ensure we have a valid name
        if (!sanitized || sanitized.length === 0) {
            sanitized = "rust_sdk";
        }

        return sanitized;
    }
}
