import { AbstractGeneratorContext, FernGeneratorExec, GeneratorNotificationService } from "@fern-api/base-generator";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { HttpEndpoint, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import { AsIsFileDefinition } from "../AsIs";
import { RustProject } from "../project";
import {
    convertPascalToSnakeCase,
    convertToSnakeCase,
    escapeRustKeyword,
    escapeRustReservedType,
    generateDefaultCrateName,
    validateAndSanitizeCrateName
} from "../utils";

export abstract class AbstractRustGeneratorContext<
    CustomConfig extends BaseRustCustomConfigSchema
> extends AbstractGeneratorContext {
    public readonly project: RustProject;

    // Global tracking of generated type names to prevent conflicts
    private readonly generatedTypeNames = new Map<string, string>();

    public constructor(
        public readonly ir: IntermediateRepresentation,
        public readonly config: FernGeneratorExec.config.GeneratorConfig,
        public readonly customConfig: CustomConfig,
        public readonly generatorNotificationService: GeneratorNotificationService
    ) {
        super(config, generatorNotificationService);
        this.project = new RustProject({
            context: this,
            crateName: this.getCrateName(),
            crateVersion: this.getCrateVersion(),
            clientClassName: this.getClientName()
        });

        // Pre-register ALL filenames before any generation
        this.registerAllFilenames(ir);
    }

    /**
     * Pre-registers all filenames to prevent collisions.
     * This is called once during context construction, before any file generation.
     * Follows Swift's priority-based registration pattern.
     *
     * Registration Priority:
     * 1. IR schema types (Enum, Alias, Struct, Union, UndiscriminatedUnion)
     * 2. Inline request body types
     * 3. Query request types
     */
    private registerAllFilenames(ir: IntermediateRepresentation): void {
        this.logger.debug("=== Pre-registering all filenames ===");

        // Priority 1: All IR types (covers Enum, Alias, Struct, Union, UndiscriminatedUnion)
        let schemaTypeCount = 0;
        for (const [typeId, typeDeclaration] of Object.entries(ir.types)) {
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            const typeName = typeDeclaration.name.name.snakeCase.safeName;
            const fullPath = [...pathParts, typeName];
            const baseFilename = convertToSnakeCase(fullPath.join("_"));

            const registeredFilename = this.project.filenameRegistry.registerSchemaTypeFilename(typeId, baseFilename);

            // Log if collision was resolved
            if (registeredFilename !== baseFilename) {
                this.logger.debug(
                    `Filename collision resolved: ${baseFilename}.rs → ${registeredFilename}.rs ` +
                        `(Type: ${typeDeclaration.name.name.pascalCase.safeName})`
                );
            }
            schemaTypeCount++;
        }
        this.logger.debug(`Registered ${schemaTypeCount} schema type filenames`);

        // Priority 2: Inline request bodies from ALL services
        let inlineRequestCount = 0;
        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                if (endpoint.requestBody?.type === "inlinedRequestBody") {
                    const requestName = endpoint.requestBody.name.pascalCase.unsafeName;
                    const baseFilename = convertPascalToSnakeCase(requestName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerInlineRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerInlineRequestTypeName(
                        endpoint.id,
                        requestName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== requestName) {
                        this.logger.debug(
                            `Inline request collision resolved: ` +
                                `${requestName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    inlineRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${inlineRequestCount} inline request filenames and type names`);

        // Priority 3: Query request types from ALL services
        let queryRequestCount = 0;
        for (const [serviceId, service] of Object.entries(ir.services)) {
            for (const endpoint of service.endpoints) {
                // Only endpoints with query params and no request body
                if (endpoint.queryParameters.length > 0 && !endpoint.requestBody) {
                    const queryTypeName = this.getQueryRequestTypeName(endpoint, serviceId);
                    const baseFilename = convertPascalToSnakeCase(queryTypeName);

                    // Register both filename and type name
                    const registeredFilename = this.project.filenameRegistry.registerQueryRequestFilename(
                        endpoint.id,
                        baseFilename
                    );
                    const registeredTypeName = this.project.filenameRegistry.registerQueryRequestTypeName(
                        endpoint.id,
                        queryTypeName
                    );

                    // Log if collision was resolved
                    if (registeredFilename !== baseFilename || registeredTypeName !== queryTypeName) {
                        this.logger.debug(
                            `Query request collision resolved: ` +
                                `${queryTypeName} → ${registeredTypeName}, ` +
                                `${baseFilename}.rs → ${registeredFilename}.rs`
                        );
                    }
                    queryRequestCount++;
                }
            }
        }
        this.logger.debug(`Registered ${queryRequestCount} query request filenames and type names`);

        this.logger.debug(
            `=== Pre-registration complete: ${schemaTypeCount + inlineRequestCount + queryRequestCount} total filenames ===`
        );
    }

    // =====================================
    // Configuration Management Methods
    // =====================================

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
     * Get the crate name with fallback to generated default
     */
    public getCrateName(): string {
        const crateName = this.customConfig.crateName ?? this.generateDefaultCrateName();
        return validateAndSanitizeCrateName(crateName);
    }

    /**
     * Get the crate version with fallback to default
     */
    public getCrateVersion(): string {
        return this.customConfig.crateVersion ?? "0.1.0";
    }

    /**
     * Get the client class name with fallback to generated default
     */
    public getClientName(): string {
        return this.customConfig.clientClassName ?? `${this.ir.apiName.pascalCase.safeName}Client`;
    }

    /**
     * Escapes Rust keywords by prefixing them with 'r#'
     */
    public escapeRustKeyword(name: string): string {
        return escapeRustKeyword(name);
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
     */
    public escapeRustReservedType(name: string): string {
        return escapeRustReservedType(name);
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
                // Join with underscore and then apply snake_case conversion to ensure proper formatting
                // This handles cases like "union__key" -> "union_key"
                const rawName = fullPath.join("_");
                return convertToSnakeCase(rawName);
            }
        }

        // Fallback to old behavior if type not found (for backward compatibility)
        return typeNameSnake;
    }

    // TODO: @iamnamananand996 simplify collisions detection more

    /**
     * Get the module path for a type reference with full fernFilepath information.
     * This ensures we get the correct module path when there are name collisions.
     *
     * @param declaredTypeName The declared type name from a type reference
     * @returns The unique module path (fernFilepath parts + type name joined with underscores)
     */
    public getModulePathForDeclaredType(declaredTypeName: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        name: { pascalCase?: { safeName: string }; snakeCase?: { unsafeName: string }; originalName?: string };
    }): string {
        // Extract the type name - can be from pascalCase or snakeCase
        const typeName =
            declaredTypeName.name.snakeCase?.unsafeName ||
            declaredTypeName.name.originalName ||
            declaredTypeName.name.pascalCase?.safeName ||
            "";

        // Try to find the exact type declaration in IR that matches both name and fernFilepath
        const typeDeclaration = Object.values(this.ir.types).find((type) => {
            // Match by name (try different formats)
            const nameMatches =
                type.name.name.snakeCase.unsafeName === typeName ||
                type.name.name.pascalCase.safeName === typeName ||
                type.name.name.originalName === typeName;

            // Match by fernFilepath
            const pathMatches =
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        part.pascalCase.safeName === declaredTypeName.fernFilepath.allParts[idx]?.pascalCase.safeName
                );

            return nameMatches && pathMatches;
        });

        if (typeDeclaration) {
            // Use fernFilepath + type name for unique module names
            const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.snakeCase.safeName);
            const typeNameSnake = typeDeclaration.name.name.snakeCase.safeName;
            const fullPath = [...pathParts, typeNameSnake];
            const rawName = fullPath.join("_");
            return convertToSnakeCase(rawName);
        }

        // Fallback to base name if not found in IR
        return convertToSnakeCase(typeName);
    }

    /**
     * Get the unique filename for a type declaration using pre-registered names.
     * This replaces the old collision detection logic that used a Set.
     *
     * @param typeDeclaration The type declaration to generate a filename for
     * @returns The unique filename (e.g., "foo_importing_type.rs")
     */
    public getUniqueFilenameForType(typeDeclaration: {
        name: {
            fernFilepath: { allParts: Array<{ snakeCase: { safeName: string } }> };
            name: { snakeCase: { safeName: string }; pascalCase: { safeName: string } };
        };
    }): string {
        // Find typeId in IR by matching the typeDeclaration reference
        const typeId = Object.entries(this.ir.types).find(([_, type]) => type === typeDeclaration)?.[0];

        if (!typeId) {
            throw new Error(
                `Type not found in IR: ${typeDeclaration.name.name.pascalCase.safeName}. ` +
                    `This should never happen - all types should be pre-registered.`
            );
        }

        return this.project.filenameRegistry.getSchemaTypeFilenameOrThrow(typeId);
    }

    // TODO: @iamnamananand996 simplify collisions detection more

    /**
     * Get a unique type name for a type declaration, using fernFilepath prefix
     * when there would be a name collision.
     *
     * @param typeDeclaration The type declaration to generate a type name for
     * @returns The unique type name (e.g., "AuthAnalyticsResponse" vs "ChartsAnalyticsResponse")
     */
    public getUniqueTypeNameForDeclaration(typeDeclaration: {
        name: {
            fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
            name: { pascalCase: { safeName: string } };
        };
    }): string {
        const baseTypeName = typeDeclaration.name.name.pascalCase.safeName;
        const currentPath = typeDeclaration.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join("");

        // Build the unique name using fernFilepath prefix
        const pathParts = typeDeclaration.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
        const uniqueName = pathParts.length > 0 ? pathParts.join("") + baseTypeName : baseTypeName;

        // Check if we've already decided on a unique name for this exact type (path + name)
        const existingEntry = this.generatedTypeNames.get(uniqueName);
        if (existingEntry !== undefined && existingEntry === currentPath) {
            // We've already generated this exact type before - return the unique name
            return uniqueName;
        }

        // Check if this base type name has been used from a different path
        const existingPath = this.generatedTypeNames.get(baseTypeName);

        if (existingPath === undefined) {
            // First time seeing this type name - check if there are other types with same base name in IR
            const hasCollision = Object.values(this.ir.types).some(
                (type) =>
                    type.name.name.pascalCase.safeName === baseTypeName &&
                    type.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join("") !== currentPath
            );

            if (hasCollision) {
                // There will be a collision - use unique name from the start
                // Store both the unique name AND mark the base name as having a collision
                this.generatedTypeNames.set(uniqueName, currentPath);
                this.generatedTypeNames.set(baseTypeName, "COLLISION_DETECTED");
                return uniqueName;
            } else {
                // No collision - can use base name
                this.generatedTypeNames.set(baseTypeName, currentPath);
                return baseTypeName;
            }
        } else if (existingPath === "COLLISION_DETECTED") {
            // We've already detected a collision for this base name
            // Return the unique name for this specific path
            this.generatedTypeNames.set(uniqueName, currentPath);
            return uniqueName;
        } else if (existingPath === currentPath) {
            // Same type from same path - return base name
            return baseTypeName;
        } else {
            // Collision detected! Use fernFilepath prefix to make it unique
            // E.g., "auth/AnalyticsResponse" becomes "AuthAnalyticsResponse"
            // E.g., "charts/AnalyticsResponse" becomes "ChartsAnalyticsResponse"
            this.generatedTypeNames.set(uniqueName, currentPath);
            this.generatedTypeNames.set(baseTypeName, "COLLISION_DETECTED");
            return uniqueName;
        }
    }

    /**
     * Get the unique type name for a DeclaredTypeName (used in type references).
     * This looks up the type in IR and returns its unique name.
     *
     * @param declaredTypeName The declared type name from a type reference
     * @returns The unique type name, or the base name if not found in IR
     */
    public getUniqueTypeNameForReference(declaredTypeName: {
        fernFilepath: { allParts: Array<{ pascalCase: { safeName: string } }> };
        name: { pascalCase: { safeName: string } };
    }): string {
        const baseTypeName = declaredTypeName.name.pascalCase.safeName;

        // Try to find the type declaration in IR
        const typeDeclaration = Object.values(this.ir.types).find(
            (type) =>
                type.name.name.pascalCase.safeName === baseTypeName &&
                type.name.fernFilepath.allParts.length === declaredTypeName.fernFilepath.allParts.length &&
                type.name.fernFilepath.allParts.every(
                    (part, idx) =>
                        part.pascalCase.safeName === declaredTypeName.fernFilepath.allParts[idx]?.pascalCase.safeName
                )
        );

        if (typeDeclaration) {
            // Use the same logic as getUniqueTypeNameForDeclaration to get the unique name
            return this.getUniqueTypeNameForDeclaration(typeDeclaration);
        }

        // Fallback: return base name if not found in IR (could be external type or error type)
        return baseTypeName;
    }

    // TODO: @iamnamananand996 simplify collisions detection more

    /**
     * Get the unique query type name (used in type references).
     * This looks up the type in IR and endpoind and returns its unique name.
     *
     * @param endpoint
     * @param serviceId
     * @returns The unique type name, or the base name if not found in IR
     */

    public getQueryRequestTypeName(endpoint: HttpEndpoint, serviceId: string): string {
        // Generate query-specific request type name with service context to prevent collisions
        const methodName = endpoint.name.pascalCase.safeName;
        const baseTypeName = `${methodName}QueryRequest`;

        // Find the subpackage that owns this service to get naming context
        const subpackage = Object.values(this.ir.subpackages).find((subpkg) => subpkg.service === serviceId);

        if (!subpackage) {
            // No subpackage found - use base name
            return baseTypeName;
        }

        // Check if there are other services with endpoints of the same name
        const hasCollision = Object.entries(this.ir.services).some(([otherServiceId, otherService]) => {
            if (otherServiceId === serviceId) {
                return false; // Skip the current service
            }

            // Check if this other service has an endpoint with the same name
            return otherService.endpoints.some(
                (otherEndpoint) =>
                    otherEndpoint.name.pascalCase.safeName === methodName &&
                    otherEndpoint.queryParameters.length > 0 &&
                    !otherEndpoint.requestBody
            );
        });

        if (hasCollision) {
            // Include full subpackage path to make it unique (e.g., auth/analytics → AuthAnalytics)
            const pathParts = subpackage.fernFilepath.allParts.map((part) => part.pascalCase.safeName);
            const subpackagePrefix = pathParts.join("");
            return `${subpackagePrefix}${baseTypeName}`;
        }

        // No collision - use base name
        return baseTypeName;
    }

    /**
     * Get filename for inlined request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR (NOT the request name string)
     */
    public getFilenameForInlinedRequestBody(endpointId: string): string {
        return this.project.filenameRegistry.getInlineRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for inlined request body from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForInlinedRequestBody(endpointId: string): string {
        const filename = this.getFilenameForInlinedRequestBody(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get filename for query request using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR (NOT the request type name string)
     */
    public getFilenameForQueryRequest(endpointId: string): string {
        return this.project.filenameRegistry.getQueryRequestFilenameOrThrow(endpointId);
    }

    /**
     * Get module name for query request from filename.
     * This extracts the module name by removing the .rs extension from the filename.
     */
    public getModuleNameForQueryRequest(endpointId: string): string {
        const filename = this.getFilenameForQueryRequest(endpointId);
        return filename.replace(".rs", "");
    }

    /**
     * Get unique type name for inline request body using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., ListUsersRequest2 if there's a collision)
     */
    public getInlineRequestTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getInlineRequestTypeNameOrThrow(endpointId);
    }

    /**
     * Get unique type name for query request using endpoint ID.
     * @param endpointId - The unique endpoint ID from IR
     * @returns The unique type name (e.g., ListUsersQuery2 if there's a collision)
     */
    public getQueryRequestUniqueTypeName(endpointId: string): string {
        return this.project.filenameRegistry.getQueryRequestTypeNameOrThrow(endpointId);
    }

    /**
     * Converts PascalCase to snake_case consistently across the generator
     */
    private convertPascalToSnakeCase(pascalCase: string): string {
        return convertPascalToSnakeCase(pascalCase);
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
    private generateDefaultCrateName(): string {
        const orgName = this.config.organization;
        const apiName = this.ir.apiName.snakeCase.unsafeName;
        return generateDefaultCrateName(orgName, apiName);
    }
}
