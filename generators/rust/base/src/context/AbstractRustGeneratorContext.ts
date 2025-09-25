import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFileDefinition } from "../AsIs";
import { RUST_KEYWORDS, RUST_RESERVED_TYPES } from "../constants";
import { RustProject } from "../project";

// TODO: @iamnamananand996 Remove the utils function which are not used.
export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new RustProject({
            context: this,
            packageName: this.getCrateName(),
            packageVersion: this.getCrateVersion(),
            clientClassName: this.getClientClassName(this.ir.apiName.pascalCase.safeName)
        });
    }

    // =====================================
    // Configuration Management Methods
    // =====================================

    /**
     * Get a configuration value with optional fallback
     */
    public getConfigValue<K extends keyof CustomConfig>(key: K): CustomConfig[K];
    public getConfigValue<K extends keyof CustomConfig>(
        key: K,
        fallback: NonNullable<CustomConfig[K]>
    ): NonNullable<CustomConfig[K]>;
    public getConfigValue<K extends keyof CustomConfig>(
        key: K,
        fallback?: CustomConfig[K]
    ): CustomConfig[K] | NonNullable<CustomConfig[K]> {
        const value = this.customConfig[key];
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
        const packageName = this.customConfig.packageName ?? this.generateDefaultPackageName();
        return this.validateAndSanitizePackageName(packageName);
    }

    /**
     * Get the package version with fallback to default
     */
    public getPackageVersion(): string {
        return this.customConfig.packageVersion ?? "0.1.0";
    }

    /**
     * Get extra dependencies with empty object fallback
     */
    public getExtraDependencies(): Record<string, string> {
        return this.customConfig.extraDependencies ?? {};
    }

    /**
     * Get extra dev dependencies with empty object fallback
     */
    public getExtraDevDependencies(): Record<string, string> {
        return this.customConfig.extraDevDependencies ?? {};
    }

    /**
     * Get the crate name with fallback to packageName or generated default
     */
    public getCrateName(): string {
        const crateName =
            this.customConfig.crateName ?? this.customConfig.packageName ?? this.generateDefaultPackageName();
        return this.validateAndSanitizePackageName(crateName);
    }

    /**
     * Get the crate version with fallback to packageVersion or default
     */
    public getCrateVersion(): string {
        return this.customConfig.crateVersion ?? this.customConfig.packageVersion ?? "0.1.0";
    }

    /**
     * Get the client class name with fallback to generated default
     */
    public getClientClassName(apiName: string): string {
        return this.customConfig.clientClassName ?? `${apiName}Client`;
    }

    /**
     * Check if a configuration key exists and has a non-undefined value
     */
    public hasConfigValue<K extends keyof CustomConfig>(key: K): boolean {
        return this.customConfig[key] !== undefined;
    }

    /**
     * Escapes Rust keywords by prefixing them with 'r#'
     */
    public escapeRustKeyword(name: string): string {
        return RUST_KEYWORDS.has(name) ? `r#${name}` : name;
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
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

    // =====================================
    // Type and Module Path Methods
    // =====================================

    /**
     * Get the correct module path for a type using fernFilepath + type name
     * to create unique filenames and import paths that prevent collisions.
     *
     * This method should be used whenever generating:
     * - Type filenames (e.g., "foo_importing_type.rs")
     * - Module declarations (e.g., "pub mod foo_importing_type;")
     * - Import paths (e.g., "use crate::foo_importing_type::ImportingType;")
     *
     * @param typeNameSnake The snake_case name of the type to look up
     * @returns The unique module path (fernFilepath parts + type name joined with underscores)
     */
    public getModulePathForType(typeNameSnake: string): string {
        // Find the type declaration in the IR
        for (const typeDeclaration of Object.values(this.ir.types)) {
            if (typeDeclaration.name.name.snakeCase.unsafeName === typeNameSnake) {
                // Use fernFilepath + type name for unique module names to prevent collisions
                // E.g., "folder-a/Response" becomes "folder_a_response"
                // E.g., "foo/ImportingType" becomes "foo_importing_type"
                const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
                const typeName = typeDeclaration.name.name.snakeCase.safeName;
                const fullPath = [...pathParts, typeName];
                return fullPath.join("_");
            }
        }

        // Fallback to old behavior if type not found (for backward compatibility)
        return typeNameSnake;
    }

    /**
     * Get the unique filename for a type declaration using fernFilepath + type name
     * to prevent filename collisions between types with the same name in different paths.
     *
     * @param typeDeclaration The type declaration to generate a filename for
     * @returns The unique filename (e.g., "foo_importing_type.rs")
     */
    public getUniqueFilenameForType(typeDeclaration: {
        name: {
            fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
            name: { snakeCase: { safeName: string } };
        };
    }): string {
        // Use the full fernFilepath and type name to create unique filenames to prevent collisions
        // E.g., "folder-a/Response" becomes "folder_a_response.rs"
        // E.g., "foo/ImportingType" becomes "foo_importing_type.rs"
        const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        const typeName = typeDeclaration.name.name.snakeCase.safeName;
        const fullPath = [...pathParts, typeName];
        return `${fullPath.join("_")}.rs`;
    }

    /**
     * Converts inlined request body names to consistent snake_case filenames
     * This should be used for all inlined request body naming to ensure consistency
     */
    public getFilenameForInlinedRequestBody(requestBodyName: string): string {
        return this.convertPascalToSnakeCase(requestBodyName) + ".rs";
    }

    /**
     * Converts inlined request body names to consistent snake_case module names
     * This should be used for module declarations and imports
     */
    public getModuleNameForInlinedRequestBody(requestBodyName: string): string {
        return this.convertPascalToSnakeCase(requestBodyName);
    }

    /**
     * Converts query request type names to consistent snake_case filenames
     * This should be used for all query request type naming to ensure consistency
     */
    public getFilenameForQueryRequest(queryRequestTypeName: string): string {
        return this.convertPascalToSnakeCase(queryRequestTypeName) + ".rs";
    }

    /**
     * Converts query request type names to consistent snake_case module names
     * This should be used for module declarations and imports
     */
    public getModuleNameForQueryRequest(queryRequestTypeName: string): string {
        return this.convertPascalToSnakeCase(queryRequestTypeName);
    }

    /**
     * Converts PascalCase to snake_case consistently across the generator
     */
    private convertPascalToSnakeCase(pascalCase: string): string {
        return pascalCase
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase()
            .replace(/^_/, "");
    }

    /**
     * Get the unique filename for a subpackage using its fernFilepath
     * to prevent filename collisions between subpackages with the same name in different paths.
     *
     * @param subpackage The subpackage to generate a filename for
     * @returns The unique filename (e.g., "nested_no_auth_api.rs")
     */
    public getUniqueFilenameForSubpackage(subpackage: {
        fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
    }): string {
        // Use the full fernFilepath to create unique filenames to prevent collisions
        // E.g., "nested-no-auth/api" becomes "nested_no_auth_api.rs"
        const pathParts = subpackage.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
        return `${pathParts.join("_")}.rs`;
    }

    /**
     * Get the unique client name for a subpackage using its fernFilepath
     * to prevent name collisions between clients with the same name in different paths.
     *
     * @param subpackage The subpackage to generate a client name for
     * @returns The unique client name (e.g., "NestedNoAuthApiClient")
     */
    public getUniqueClientNameForSubpackage(subpackage: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
    }): string {
        // Use the full fernFilepath to create unique client names to prevent collisions
        // E.g., "nested-no-auth/api" becomes "NestedNoAuthApiClient"
        const pathParts = subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
        return pathParts.join("") + "Client";
    }

    /**
     * Get the core AsIs template files for this generator type
     */
    public abstract getCoreAsIsFiles(): AsIsFileDefinition[];

    // =====================================
    // Private Helper Methods
    // =====================================

    /**
     * Generate default package name from organization and API name
     */
    private generateDefaultPackageName(): string {
        const orgName = this.config.organization;
        const apiName = this.ir.apiName.snakeCase.unsafeName;
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
