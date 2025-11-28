import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options,
    Severity
} from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import {
    convertToPascalCase,
    escapeRustKeyword,
    escapeRustReservedType,
    generateDefaultCrateName,
    getName,
    RustFilenameRegistry,
    validateAndSanitizeCrateName
} from "@fern-api/rust-base";
import { BaseRustCustomConfigSchema } from "@fern-api/rust-codegen";
import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseRustCustomConfigSchema | undefined;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;
    private errorStack: string[] = [];
    private registry: RustFilenameRegistry;
    private declarationToTypeId: Map<string, string> = new Map();
    private endpointDeclarationToQueryRequestName: Map<string, string> = new Map();

    constructor({
        ir,
        config,
        options
    }: {
        ir: FernIr.dynamic.DynamicIntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        options?: Options;
    }) {
        super({ ir, config, options });
        this.ir = ir;
        this.customConfig = config.customConfig as BaseRustCustomConfigSchema | undefined;
        this.registry = RustFilenameRegistry.create();

        // Pre-register all type names from IR to match model generator naming
        this.preregisterTypeNames();

        // Pre-register query request names to match SDK generator naming
        this.preregisterQueryRequestNames();

        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });
    }

    private preregisterTypeNames(): void {
        // Register all IR types to ensure consistent naming with model generator
        for (const [typeId, type] of Object.entries(this.ir.types)) {
            const baseName = type.declaration.name.pascalCase.safeName;
            this.registry.registerSchemaTypeTypeName(typeId, baseName);

            // Create a lookup key for this declaration
            const key = this.getDeclarationKey(type.declaration);
            this.declarationToTypeId.set(key, typeId);
        }
    }

    /**
     * Pre-register query request type names to ensure consistent naming with SDK generator.
     * Query requests are synthetic types generated for endpoints with query parameters but no body.
     */
    private preregisterQueryRequestNames(): void {
        // Loop through all endpoints in the dynamic IR
        for (const [endpointId, endpoint] of Object.entries(this.ir.endpoints)) {
            // Check if this is a query-only endpoint (has query parameters but no body)
            const request = endpoint.request;
            if (request.type !== "inlined") {
                continue;
            }

            const hasQueryParams = (request.queryParameters ?? []).length > 0;
            const hasBody = request.body != null;

            if (hasQueryParams && !hasBody) {
                // This is a query-only endpoint - register its query request type
                const methodName = endpoint.declaration.name.pascalCase.safeName;
                const baseQueryRequestName = `${methodName}QueryRequest`;

                // Register the name in the type registry to handle deduplication
                // We use a synthetic ID for query requests: "query_request:<endpointId>"
                const syntheticTypeId = `query_request:${endpointId}`;
                const deduplicatedName = this.registry.registerSchemaTypeTypeName(
                    syntheticTypeId,
                    baseQueryRequestName
                );

                // Store the mapping from endpoint declaration to deduplicated name
                const key = this.getEndpointDeclarationKey(endpoint.declaration);
                this.endpointDeclarationToQueryRequestName.set(key, deduplicatedName);
            }
        }
    }

    /**
     * Create a unique key for a type declaration based on its file path and name.
     * This helps us look up the typeId when we only have the declaration.
     */
    private getDeclarationKey(declaration: FernIr.dynamic.Declaration): string {
        const fernFilepath = declaration.fernFilepath.packagePath.join("/");
        const name = declaration.name.pascalCase.safeName;
        return `${fernFilepath}::${name}`;
    }

    /**
     * Create a unique key for an endpoint declaration based on its file path and name.
     * This helps us look up the query request name when we only have the endpoint declaration.
     */
    private getEndpointDeclarationKey(declaration: FernIr.dynamic.Declaration): string {
        // Use the same format as getDeclarationKey for consistency
        const fernFilepath = declaration.fernFilepath.packagePath.join("/");
        const name = declaration.name.pascalCase.safeName;
        return `${fernFilepath}::${name}`;
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }

    public getStructName(name: FernIr.Name): string {
        return this.getTypeName(name);
    }

    /**
     * Get the generated struct name for a type by its declaration.
     * This returns the deduplicated name (e.g., "Metadata2" instead of "Metadata")
     * when there are naming collisions.
     */
    public getStructNameByDeclaration(declaration: FernIr.dynamic.Declaration): string {
        const key = this.getDeclarationKey(declaration);
        const typeId = this.declarationToTypeId.get(key);
        if (typeId) {
            return this.registry.getSchemaTypeTypeNameOrThrow(typeId);
        }
        // Fallback to basic name if not found in registry
        return getName(declaration.name.pascalCase.safeName);
    }

    /**
     * Get the deduplicated query request type name for an endpoint.
     * This returns the name that was pre-registered during initialization,
     * accounting for any naming collisions (e.g., "ListUsersQueryRequest2" instead of "ListUsersQueryRequest").
     */
    public getQueryRequestNameByEndpoint(endpointDeclaration: FernIr.dynamic.Declaration): string | undefined {
        const key = this.getEndpointDeclarationKey(endpointDeclaration);
        return this.endpointDeclarationToQueryRequestName.get(key);
    }

    public getEnumName(name: FernIr.Name): string {
        return this.getTypeName(name);
    }

    /**
     * Get the generated type name for a type by its ID.
     * This ensures we get the deduplicated name (e.g., "Metadata2" instead of "Metadata")
     */
    public getTypeNameById(typeId: string): string {
        return this.registry.getSchemaTypeTypeNameOrThrow(typeId);
    }

    private getTypeName(name: FernIr.Name): string {
        return getName(name.pascalCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        // For struct fields, use raw identifier syntax for reserved keywords
        const input = name.snakeCase.safeName;
        // If the field name ends with "_", check if it's a Rust keyword that was escaped
        // Convert it back to raw identifier syntax (e.g., "type_" -> "r#type")
        if (input.endsWith("_")) {
            const baseKeyword = input.slice(0, -1); // Remove the trailing "_"
            return escapeRustKeyword(baseKeyword);
        }

        return escapeRustKeyword(input);
    }

    public getMethodName(name: FernIr.Name): string {
        return getName(name.snakeCase.safeName);
    }

    /**
     * Escapes Rust reserved types by prefixing them with 'r#'
     */
    public escapeRustReservedType(name: string): string {
        return escapeRustReservedType(name);
    }

    /**
     * Get the crate name with fallback to generated default
     */
    public getCrateName(): string {
        const orgName = this.config.organization;
        const workspaceName = this.config.workspaceName;

        let createName = this.customConfig?.crateName ?? generateDefaultCrateName(orgName, workspaceName);
        return validateAndSanitizeCrateName(createName);
    }

    // Client methods
    public getClientStructName(): string {
        return this.customConfig?.clientClassName ?? `${convertToPascalCase(this.config.workspaceName)}Client`;
    }

    // Environment resolution stub
    public resolveEnvironmentName(_environmentID: string): FernIr.Name | undefined {
        return undefined; // TODO: Implement proper environment resolution
    }

    // Enhanced error handling methods
    public scopeError(scope: string): void {
        this.errorStack.push(scope);
    }

    public unscopeError(): void {
        this.errorStack.pop();
    }

    public addScopedError(message: string, severity: (typeof Severity)[keyof typeof Severity]): void {
        const fullScope = this.errorStack.length > 0 ? this.errorStack.join(".") : "root";
        this.errors.add({
            severity,
            message: `[${fullScope}] ${message}`
        });
    }

    public getCurrentScope(): string {
        return this.errorStack.join(".");
    }

    // Value validation helpers matching Swift's pattern
    public getValueAsNumber({ value }: { value: unknown }): number | undefined {
        if (typeof value === "number" && !isNaN(value)) {
            return value;
        }
        if (typeof value === "string") {
            const num = Number(value);
            if (!isNaN(num)) {
                return num;
            }
        }
        this.addScopedError(`Expected number but got: ${typeof value}`, Severity.Critical);
        return undefined;
    }

    public getValueAsBoolean({ value }: { value: unknown }): boolean | undefined {
        if (typeof value === "boolean") {
            return value;
        }
        if (typeof value === "string") {
            if (value === "true") {
                return true;
            }
            if (value === "false") {
                return false;
            }
        }
        this.addScopedError(`Expected boolean but got: ${typeof value}`, Severity.Critical);
        return undefined;
    }

    public getValueAsString({ value }: { value: unknown }): string | undefined {
        if (typeof value === "string") {
            return value;
        }
        this.addScopedError(`Expected string but got: ${typeof value}`, Severity.Critical);
        return undefined;
    }

    // Comprehensive type validation methods
    public validateTypeReference(typeRef: FernIr.dynamic.TypeReference, value: unknown): boolean {
        switch (typeRef.type) {
            case "primitive":
                return this.validatePrimitive(typeRef.value, value);
            case "list":
                return Array.isArray(value);
            case "named":
                return this.validateNamedType(typeRef.value, value);
            case "optional":
            case "nullable":
                return value == null || this.validateTypeReference(typeRef.value, value);
            case "map":
                return typeof value === "object" && value != null && !Array.isArray(value);
            case "set":
                return Array.isArray(value);
            case "literal":
                return this.validateLiteral(typeRef.value, value);
            case "unknown":
                return true; // Unknown types accept any value
            default:
                return false;
        }
    }

    private validatePrimitive(primitive: FernIr.PrimitiveTypeV1, value: unknown): boolean {
        switch (primitive) {
            case "STRING":
            case "UUID":
            case "DATE":
            case "DATE_TIME":
            case "BASE_64":
            case "BIG_INTEGER":
                return typeof value === "string";
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return typeof value === "number" && Number.isInteger(value);
            case "FLOAT":
            case "DOUBLE":
                return typeof value === "number";
            case "BOOLEAN":
                return typeof value === "boolean";
            default:
                return false;
        }
    }

    private validateNamedType(typeId: FernIr.TypeId, value: unknown): boolean {
        const namedType = this.ir.types[typeId];
        if (!namedType) {
            return false;
        }

        switch (namedType.type) {
            case "object":
                return typeof value === "object" && value != null && !Array.isArray(value);
            case "enum":
                return typeof value === "string" && namedType.values.some((v) => v.wireValue === value);
            case "alias":
                return this.validateTypeReference(namedType.typeReference, value);
            case "discriminatedUnion":
                return this.validateDiscriminatedUnion(namedType, value);
            case "undiscriminatedUnion":
                return this.validateUndiscriminatedUnion(namedType, value);
            default:
                return false;
        }
    }

    private validateLiteral(literal: FernIr.dynamic.LiteralType, value: unknown): boolean {
        switch (literal.type) {
            case "string":
                return typeof value === "string" && value === literal.value;
            case "boolean":
                return typeof value === "boolean" && value === literal.value;
            default:
                return false;
        }
    }

    private validateDiscriminatedUnion(union: FernIr.dynamic.DiscriminatedUnionType, value: unknown): boolean {
        if (typeof value !== "object" || value == null) {
            return false;
        }

        const record = value as Record<string, unknown>;
        const discriminantValue = record[union.discriminant.wireValue];

        return typeof discriminantValue === "string" && Object.keys(union.types).includes(discriminantValue);
    }

    private validateUndiscriminatedUnion(union: FernIr.dynamic.UndiscriminatedUnionType, value: unknown): boolean {
        // At least one of the union types should validate
        return union.types.some((typeRef) => this.validateTypeReference(typeRef, value));
    }

    // Enhanced nullable checking
    public isNullable(typeRef: FernIr.dynamic.TypeReference): boolean {
        return typeRef.type === "nullable" || typeRef.type === "optional";
    }

    /**
     * Check if a type reference is optional or nullable.
     * This is the dynamic IR equivalent of the model generator's isOptionalType.
     */
    public isOptionalType(typeRef: FernIr.dynamic.TypeReference): boolean {
        return typeRef.type === "optional" || typeRef.type === "nullable";
    }

    /**
     * Check if all parameters in a list are optional.
     * This determines whether a request type can have Default derived.
     *
     * In the Rust model generator, Default is only derived when ALL properties are optional
     * and there are no extended properties (inheritance).
     */
    public allParametersAreOptional(parameters: FernIr.dynamic.NamedParameter[]): boolean {
        return parameters.every((param) => this.isOptionalType(param.typeReference));
    }

    /**
     * Check if an inlined request can use ..Default::default() pattern.
     * This checks if the generated request struct will have Default derived.
     *
     * According to the model generator logic:
     * - Default is derived only when all properties are optional
     * - Extended properties (inheritance) prevent Default derivation
     */
    public canRequestUseDefault(request: FernIr.dynamic.InlinedRequest): boolean {
        const queryParams = request.queryParameters ?? [];

        // Collect all properties that will be in the request struct
        const allProperties: FernIr.dynamic.NamedParameter[] = [...queryParams];

        // Add body properties if present
        if (request.body != null) {
            if (request.body.type === "properties") {
                allProperties.push(...request.body.value);
            } else if (request.body.type === "referenced") {
                // For referenced body, check if the body type itself is optional
                const bodyTypeRef =
                    request.body.bodyType.type === "typeReference"
                        ? request.body.bodyType.value
                        : ({ type: "primitive", value: "STRING" } as FernIr.dynamic.TypeReference);

                // If the referenced body type is not optional, the request doesn't have all optional fields
                if (!this.isOptionalType(bodyTypeRef)) {
                    return false;
                }
            }
            // Note: file upload requests have complex structure, be conservative
            else if (request.body.type === "fileUpload") {
                // File upload requests may have required file fields
                // Be conservative and don't use Default for these
                return false;
            }
        }

        // Headers are handled separately via RequestOptions, not in the request struct
        // So we don't need to check them

        // Check if all collected properties are optional
        return this.allParametersAreOptional(allProperties);
    }
}
