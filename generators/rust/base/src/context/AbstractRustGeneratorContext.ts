import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFileDefinition } from "../AsIs";
import { BaseRustCustomConfigSchema, RustConfigurationManager } from "../config";
import { RustProject } from "../project";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;
    public readonly configManager: RustConfigurationManager<CustomConfig>;

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.configManager = new RustConfigurationManager(customConfig, this);
        this.project = new RustProject({
            context: this,
            packageName: this.configManager.getPackageName(),
            packageVersion: this.configManager.getPackageVersion()
        });
    }

    /**
     * Escapes Rust keywords by prefixing them with 'r#'
     * @deprecated Use configManager.escapeRustKeyword() instead
     */
    public escapeRustKeyword(name: string): string {
        return this.configManager.escapeRustKeyword(name);
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
     * @deprecated Use configManager.escapeRustReservedType() instead
     */
    public escapeRustReservedType(name: string): string {
        return this.configManager.escapeRustReservedType(name);
    }

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
}
