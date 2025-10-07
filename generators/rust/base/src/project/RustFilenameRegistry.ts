import { assertDefined, SymbolRegistry } from "@fern-api/core-utils";

const FILENAME_ID_PREFIX = "filename_id:";
const TYPENAME_ID_PREFIX = "typename_id:";

/**
 * Registry for managing unique filenames and type names across all Rust generated files.
 * Prevents filename and type name collisions by pre-registering all names before generation.
 * Follows the pattern used by Swift generator (ProjectSymbolRegistry).
 */
export class RustFilenameRegistry {
    // Reserved filenames that cannot be used for generated types
    private static readonly reservedFilenames = [
        "lib",
        "mod",
        "main",
        "test",
        "prelude",
        "error",
        "environment",
        "client",
        "config",
        "core"
    ];

    public static create(): RustFilenameRegistry {
        return new RustFilenameRegistry(RustFilenameRegistry.reservedFilenames);
    }

    private readonly filenameRegistry: SymbolRegistry;
    private readonly typenameRegistry: SymbolRegistry;

    private constructor(reservedFilenames: string[]) {
        // Use underscore-suffix strategy: collision → file_type → file_type_ → file_type__
        this.filenameRegistry = new SymbolRegistry({
            reservedSymbolNames: reservedFilenames,
            conflictResolutionStrategy: "underscore-suffix"
        });

        // Type names use numbered-suffix strategy: ListUsersRequest → ListUsersRequest2 → ListUsersRequest3
        this.typenameRegistry = new SymbolRegistry({
            reservedSymbolNames: [],
            conflictResolutionStrategy: "numbered-suffix"
        });
    }

    // =====================================
    // Registration Methods (called during pre-registration phase)
    // =====================================

    /**
     * Register filename for IR schema types (Enum, Alias, Struct, Union, UndiscriminatedUnion)
     * @param typeId - Unique type ID from IR
     * @param baseFilename - Base filename in snake_case (without .rs extension)
     * @returns The registered unique filename (without .rs extension)
     */
    public registerSchemaTypeFilename(typeId: string, baseFilename: string): string {
        return this.filenameRegistry.registerSymbol(this.getSchemaTypeFilenameId(typeId), [
            baseFilename,
            `${baseFilename}_type`,
            `${baseFilename}_model`
        ]);
    }

    /**
     * Register type name for IR schema types (Enum, Alias, Struct, Union, UndiscriminatedUnion)
     * @param typeId - Unique type ID from IR
     * @param baseTypeName - Base type name in PascalCase
     * @returns The registered unique type name
     */
    public registerSchemaTypeTypeName(typeId: string, baseTypeName: string): string {
        return this.typenameRegistry.registerSymbol(this.getSchemaTypeTypeNameId(typeId), [baseTypeName]);
    }

    /**
     * Register filename for inline request body types
     * @param endpointId - Unique endpoint ID from IR
     * @param baseFilename - Base filename in snake_case (without .rs extension)
     * @returns The registered unique filename (without .rs extension)
     */
    public registerInlineRequestFilename(endpointId: string, baseFilename: string): string {
        return this.filenameRegistry.registerSymbol(this.getInlineRequestFilenameId(endpointId), [
            baseFilename,
            `${baseFilename}_request`,
            `${baseFilename}_body`
        ]);
    }

    /**
     * Register filename for query request types
     * @param endpointId - Unique endpoint ID from IR
     * @param baseFilename - Base filename in snake_case (without .rs extension)
     * @returns The registered unique filename (without .rs extension)
     */
    public registerQueryRequestFilename(endpointId: string, baseFilename: string): string {
        return this.filenameRegistry.registerSymbol(this.getQueryRequestFilenameId(endpointId), [
            baseFilename,
            `${baseFilename}_query`,
            `${baseFilename}_params`
        ]);
    }

    /**
     * Register type name for inline request body
     * @param endpointId - Unique endpoint ID from IR
     * @param baseTypeName - Base type name in PascalCase
     * @returns The registered unique type name
     */
    public registerInlineRequestTypeName(endpointId: string, baseTypeName: string): string {
        return this.typenameRegistry.registerSymbol(this.getInlineRequestTypeNameId(endpointId), [baseTypeName]);
    }

    /**
     * Register type name for query request
     * @param endpointId - Unique endpoint ID from IR
     * @param baseTypeName - Base type name in PascalCase
     * @returns The registered unique type name
     */
    public registerQueryRequestTypeName(endpointId: string, baseTypeName: string): string {
        return this.typenameRegistry.registerSymbol(this.getQueryRequestTypeNameId(endpointId), [baseTypeName]);
    }

    // =====================================
    // Retrieval Methods (called during file generation phase)
    // =====================================

    /**
     * Get registered filename for IR schema type
     * @param typeId - Unique type ID from IR
     * @returns Filename with .rs extension
     * @throws Error if filename not registered
     */
    public getSchemaTypeFilenameOrThrow(typeId: string): string {
        const filename = this.filenameRegistry.getSymbolNameById(this.getSchemaTypeFilenameId(typeId));
        assertDefined(filename, `Filename not found for type ${typeId}`);
        return `${filename}.rs`;
    }

    /**
     * Get registered filename for inline request body
     * @param endpointId - Unique endpoint ID from IR
     * @returns Filename with .rs extension
     * @throws Error if filename not registered
     */
    public getInlineRequestFilenameOrThrow(endpointId: string): string {
        const filename = this.filenameRegistry.getSymbolNameById(this.getInlineRequestFilenameId(endpointId));
        assertDefined(filename, `Filename not found for inline request ${endpointId}`);
        return `${filename}.rs`;
    }

    /**
     * Get registered filename for query request
     * @param endpointId - Unique endpoint ID from IR
     * @returns Filename with .rs extension
     * @throws Error if filename not registered
     */
    public getQueryRequestFilenameOrThrow(endpointId: string): string {
        const filename = this.filenameRegistry.getSymbolNameById(this.getQueryRequestFilenameId(endpointId));
        assertDefined(filename, `Filename not found for query request ${endpointId}`);
        return `${filename}.rs`;
    }

    /**
     * Get registered type name for inline request body
     * @param endpointId - Unique endpoint ID from IR
     * @returns The unique type name
     * @throws Error if type name not registered
     */
    public getInlineRequestTypeNameOrThrow(endpointId: string): string {
        const typename = this.typenameRegistry.getSymbolNameById(this.getInlineRequestTypeNameId(endpointId));
        assertDefined(typename, `Type name not found for inline request ${endpointId}`);
        return typename;
    }

    /**
     * Get registered type name for query request
     * @param endpointId - Unique endpoint ID from IR
     * @returns The unique type name
     * @throws Error if type name not registered
     */
    public getQueryRequestTypeNameOrThrow(endpointId: string): string {
        const typename = this.typenameRegistry.getSymbolNameById(this.getQueryRequestTypeNameId(endpointId));
        assertDefined(typename, `Type name not found for query request ${endpointId}`);
        return typename;
    }

    /**
     * Get registered type name for IR schema type
     * @param typeId - Unique type ID from IR
     * @returns The unique type name
     * @throws Error if type name not registered
     */
    public getSchemaTypeTypeNameOrThrow(typeId: string): string {
        const typename = this.typenameRegistry.getSymbolNameById(this.getSchemaTypeTypeNameId(typeId));
        assertDefined(typename, `Type name not found for schema type ${typeId}`);
        return typename;
    }

    // =====================================
    // Private Helper Methods
    // =====================================

    private getSchemaTypeFilenameId(typeId: string): string {
        return `${FILENAME_ID_PREFIX}schema_type_${typeId}`;
    }

    private getInlineRequestFilenameId(endpointId: string): string {
        return `${FILENAME_ID_PREFIX}inline_request_${endpointId}`;
    }

    private getQueryRequestFilenameId(endpointId: string): string {
        return `${FILENAME_ID_PREFIX}query_request_${endpointId}`;
    }

    private getInlineRequestTypeNameId(endpointId: string): string {
        return `${TYPENAME_ID_PREFIX}inline_request_${endpointId}`;
    }

    private getQueryRequestTypeNameId(endpointId: string): string {
        return `${TYPENAME_ID_PREFIX}query_request_${endpointId}`;
    }

    private getSchemaTypeTypeNameId(typeId: string): string {
        return `${TYPENAME_ID_PREFIX}schema_type_${typeId}`;
    }
}
