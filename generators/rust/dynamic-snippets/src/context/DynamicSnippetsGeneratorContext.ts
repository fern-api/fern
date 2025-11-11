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
     * Create a unique key for a type declaration based on its file path and name.
     * This helps us look up the typeId when we only have the declaration.
     */
    private getDeclarationKey(declaration: FernIr.dynamic.Declaration): string {
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
}
