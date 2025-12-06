import {
    AbstractDynamicSnippetsGeneratorContext,
    FernGeneratorExec,
    Options,
    TypeInstance
} from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { BaseJavaCustomConfigSchema, java } from "@fern-api/java-ast";
import { camelCase } from "lodash-es";

import { DynamicTypeLiteralMapper } from "./DynamicTypeLiteralMapper";
import { DynamicTypeMapper } from "./DynamicTypeMapper";
import { FilePropertyMapper } from "./FilePropertyMapper";

const RESERVED_NAMES = new Set([
    "enum",
    "extends",
    "package",
    "void",
    "short",
    "class",
    "abstract",
    "return",
    "import",
    "for",
    "assert",
    "switch",
    "getClass"
]);

/**
 * Information about an inline type's location as a nested class.
 */
interface InlineTypeInfo {
    /** The class reference for the owner (top-level) type */
    ownerClassRef: java.ClassReference;
    /** The nested path from the owner to this type (e.g., ["Bar", "Type1", "Bar_"]) */
    nestedPath: string[];
}

export class DynamicSnippetsGeneratorContext extends AbstractDynamicSnippetsGeneratorContext {
    public ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    public customConfig: BaseJavaCustomConfigSchema;
    public dynamicTypeMapper: DynamicTypeMapper;
    public dynamicTypeLiteralMapper: DynamicTypeLiteralMapper;
    public filePropertyMapper: FilePropertyMapper;

    /** Mapping from type ID to inline type info (only populated when enable-inline-types is true) */
    private inlineTypeInfoByTypeId: Map<string, InlineTypeInfo> = new Map();

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
        this.customConfig = BaseJavaCustomConfigSchema.parse(config.customConfig ?? {});
        this.dynamicTypeMapper = new DynamicTypeMapper({ context: this });
        this.dynamicTypeLiteralMapper = new DynamicTypeLiteralMapper({ context: this });
        this.filePropertyMapper = new FilePropertyMapper({ context: this });

        // Build inline type mapping if enable-inline-types is true
        if (this.customConfig["enable-inline-types"]) {
            this.buildInlineTypeMapping();
        }
    }

    /**
     * Builds a mapping from inline type IDs to their nested class locations.
     * This traverses all types in the IR and finds inline types, recording their
     * owner class and nested path.
     */
    private buildInlineTypeMapping(): void {
        // First pass: find all non-inline types (these are the potential owners)
        for (const [typeId, namedType] of Object.entries(this.ir.types)) {
            // Use type assertion to access the inline property (added to dynamic IR but not yet in published SDK)
            const isInline = (namedType.declaration as { inline?: boolean }).inline;
            if (!isInline) {
                // This is a top-level type that can own inline types
                const ownerClassRef = this.getOwnerClassReference(namedType);
                const usedNames = new Map<string, number>();
                this.traverseTypeForInlineChildren({
                    namedType,
                    ownerClassRef,
                    parentPath: [],
                    usedNames
                });
            }
        }
    }

    /**
     * Gets the class reference for a top-level (non-inline) type.
     */
    private getOwnerClassReference(namedType: FernIr.dynamic.NamedType): java.ClassReference {
        const declaration = namedType.declaration;
        // Determine if this is a request type or a regular type
        // Request types go in the requests package, others go in types package
        const packageName = this.getTypesPackageName(declaration.fernFilepath);
        return java.classReference({
            name: this.getClassName(declaration.name),
            packageName
        });
    }

    /**
     * Traverses a type to find inline children and record their locations.
     */
    private traverseTypeForInlineChildren({
        namedType,
        ownerClassRef,
        parentPath,
        usedNames
    }: {
        namedType: FernIr.dynamic.NamedType;
        ownerClassRef: java.ClassReference;
        parentPath: string[];
        usedNames: Map<string, number>;
    }): void {
        switch (namedType.type) {
            case "object":
                this.traverseObjectProperties({
                    properties: namedType.properties,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "discriminatedUnion":
                this.traverseDiscriminatedUnion({
                    union: namedType,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "undiscriminatedUnion":
                this.traverseUndiscriminatedUnion({
                    union: namedType,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "alias":
                this.traverseTypeReference({
                    typeReference: namedType.typeReference,
                    propertyName: namedType.declaration.name,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "enum":
                // Enums don't have nested types
                break;
            default:
                assertNever(namedType);
        }
    }

    /**
     * Traverses object properties to find inline types.
     */
    private traverseObjectProperties({
        properties,
        ownerClassRef,
        parentPath,
        usedNames
    }: {
        properties: FernIr.dynamic.NamedParameter[];
        ownerClassRef: java.ClassReference;
        parentPath: string[];
        usedNames: Map<string, number>;
    }): void {
        for (const property of properties) {
            this.traverseTypeReference({
                typeReference: property.typeReference,
                propertyName: property.name.name,
                ownerClassRef,
                parentPath,
                usedNames
            });
        }
    }

    /**
     * Traverses a discriminated union to find inline types.
     */
    private traverseDiscriminatedUnion({
        union,
        ownerClassRef,
        parentPath,
        usedNames
    }: {
        union: FernIr.dynamic.DiscriminatedUnionType;
        ownerClassRef: java.ClassReference;
        parentPath: string[];
        usedNames: Map<string, number>;
    }): void {
        for (const [, singleUnionType] of Object.entries(union.types)) {
            switch (singleUnionType.type) {
                case "samePropertiesAsObject":
                    // The variant references another type by typeId
                    // Construct the TypeReference object manually (factory function not available in published SDK)
                    this.traverseTypeReference({
                        typeReference: { type: "named", value: singleUnionType.typeId } as FernIr.dynamic.TypeReference,
                        propertyName: singleUnionType.discriminantValue.name,
                        ownerClassRef,
                        parentPath,
                        usedNames
                    });
                    // Also traverse the properties
                    if (singleUnionType.properties) {
                        this.traverseObjectProperties({
                            properties: singleUnionType.properties,
                            ownerClassRef,
                            parentPath,
                            usedNames
                        });
                    }
                    break;
                case "singleProperty":
                    this.traverseTypeReference({
                        typeReference: singleUnionType.typeReference,
                        propertyName: singleUnionType.discriminantValue.name,
                        ownerClassRef,
                        parentPath,
                        usedNames
                    });
                    if (singleUnionType.properties) {
                        this.traverseObjectProperties({
                            properties: singleUnionType.properties,
                            ownerClassRef,
                            parentPath,
                            usedNames
                        });
                    }
                    break;
                case "noProperties":
                    if (singleUnionType.properties) {
                        this.traverseObjectProperties({
                            properties: singleUnionType.properties,
                            ownerClassRef,
                            parentPath,
                            usedNames
                        });
                    }
                    break;
                default:
                    assertNever(singleUnionType);
            }
        }
    }

    /**
     * Traverses an undiscriminated union to find inline types.
     */
    private traverseUndiscriminatedUnion({
        union,
        ownerClassRef,
        parentPath,
        usedNames
    }: {
        union: FernIr.dynamic.UndiscriminatedUnionType;
        ownerClassRef: java.ClassReference;
        parentPath: string[];
        usedNames: Map<string, number>;
    }): void {
        for (let i = 0; i < union.types.length; i++) {
            const typeRef = union.types[i];
            // For undiscriminated unions, we use a synthetic name based on index
            const syntheticName: FernIr.dynamic.Name = {
                originalName: `variant${i}`,
                camelCase: { safeName: `variant${i}`, unsafeName: `variant${i}` },
                pascalCase: { safeName: `Variant${i}`, unsafeName: `Variant${i}` },
                snakeCase: { safeName: `variant_${i}`, unsafeName: `variant_${i}` },
                screamingSnakeCase: { safeName: `VARIANT_${i}`, unsafeName: `VARIANT_${i}` }
            };
            if (typeRef != null) {
                this.traverseTypeReference({
                    typeReference: typeRef,
                    propertyName: syntheticName,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
            }
        }
    }

    /**
     * Traverses a type reference to find inline types.
     */
    private traverseTypeReference({
        typeReference,
        propertyName,
        ownerClassRef,
        parentPath,
        usedNames
    }: {
        typeReference: FernIr.dynamic.TypeReference;
        propertyName: FernIr.dynamic.Name;
        ownerClassRef: java.ClassReference;
        parentPath: string[];
        usedNames: Map<string, number>;
    }): void {
        switch (typeReference.type) {
            case "named": {
                const childTypeId = typeReference.value;
                const childNamed = this.resolveNamedType({ typeId: childTypeId });
                if (childNamed == null) {
                    return;
                }
                // Use type assertion to access the inline property (added to dynamic IR but not yet in published SDK)
                const isChildInline = (childNamed.declaration as { inline?: boolean }).inline;
                if (isChildInline) {
                    // This is an inline type - record its location
                    const baseName = this.getClassName(propertyName);
                    const nestedName = this.getUniqueNestedName(baseName, usedNames);
                    const childPath = [...parentPath, nestedName];

                    this.inlineTypeInfoByTypeId.set(childTypeId, {
                        ownerClassRef,
                        nestedPath: childPath
                    });

                    // Recursively traverse the inline type's children
                    const childUsedNames = new Map<string, number>();
                    this.traverseTypeForInlineChildren({
                        namedType: childNamed,
                        ownerClassRef,
                        parentPath: childPath,
                        usedNames: childUsedNames
                    });
                }
                break;
            }
            case "list":
            case "set":
                this.traverseTypeReference({
                    typeReference: typeReference.value,
                    propertyName,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "map": {
                // Use type assertion to access key and value properties of map type
                const mapType = typeReference as FernIr.dynamic.TypeReference.Map;
                this.traverseTypeReference({
                    typeReference: mapType.key,
                    propertyName,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                this.traverseTypeReference({
                    typeReference: mapType.value,
                    propertyName,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            }
            case "optional":
            case "nullable":
                this.traverseTypeReference({
                    typeReference: typeReference.value,
                    propertyName,
                    ownerClassRef,
                    parentPath,
                    usedNames
                });
                break;
            case "primitive":
            case "literal":
            case "unknown":
                // These don't contain nested types
                break;
            default:
                assertNever(typeReference);
        }
    }

    /**
     * Gets a unique nested class name, handling collisions by appending underscores.
     */
    private getUniqueNestedName(baseName: string, usedNames: Map<string, number>): string {
        const count = usedNames.get(baseName) ?? 0;
        usedNames.set(baseName, count + 1);
        if (count === 0) {
            return baseName;
        }
        return baseName + "_".repeat(count);
    }

    /**
     * Gets the class reference for an inline type, constructing the nested class name.
     */
    private getInlineClassReference(typeId: string): java.ClassReference | undefined {
        const info = this.inlineTypeInfoByTypeId.get(typeId);
        if (info == null) {
            return undefined;
        }
        // Construct the nested class name (e.g., "GetDiscriminatedUnionRequest.Bar.Type1")
        const nestedName = [info.ownerClassRef.name, ...info.nestedPath].join(".");
        return java.classReference({
            name: nestedName,
            packageName: info.ownerClassRef.packageName
        });
    }

    public clone(): DynamicSnippetsGeneratorContext {
        return new DynamicSnippetsGeneratorContext({
            ir: this.ir,
            config: this.config,
            options: this.options
        });
    }

    public getClassName(name: FernIr.Name): string {
        return this.getName(name.pascalCase.safeName);
    }

    public getEnumName(name: FernIr.Name): string {
        return this.getName(name.screamingSnakeCase.safeName);
    }

    public getPropertyName(name: FernIr.Name): string {
        return this.getName(name.camelCase.safeName);
    }

    public getMethodName(name: FernIr.Name): string {
        return this.getName(name.camelCase.safeName);
    }

    public getRootClientClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getRootClientClassName(),
            packageName: this.getRootPackageName()
        });
    }

    public getRootClientClassName(): string {
        return this.customConfig?.["client-class-name"] ?? `${this.getBaseNamePrefix()}Client`;
    }

    public getEnvironmentClassName(): string {
        return "Environment";
    }

    public getEnvironmentTypeReferenceFromID(environmentID: string): java.AstNode | undefined {
        const environmentName = this.resolveEnvironmentName(environmentID);
        if (environmentName == null) {
            return undefined;
        }
        return java.codeblock((writer) => {
            writer.writeNode(this.getEnvironmentClassReference());
            writer.write(".");
            writer.write(this.getEnumName(environmentName));
        });
    }

    public getEnvironmentClassReference(): java.ClassReference {
        return java.classReference({
            name: this.getEnvironmentClassName(),
            packageName: this.getCorePackageName()
        });
    }

    public getJavaClassReferenceFromDeclaration({
        declaration
    }: {
        declaration: FernIr.dynamic.Declaration;
    }): java.ClassReference {
        return java.classReference({
            name: declaration.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(declaration.fernFilepath)
        });
    }

    /**
     * Gets the Java class reference for a named type, handling inline types correctly.
     * For inline types, this returns a nested class reference (e.g., "GetDiscriminatedUnionRequest.Bar").
     * For non-inline types, this returns a regular class reference.
     */
    public getJavaClassReferenceForNamedType({
        typeId,
        declaration
    }: {
        typeId: string;
        declaration: FernIr.dynamic.Declaration;
    }): java.ClassReference {
        // Check if this is an inline type and we have inline types enabled
        // Use type assertion to access the inline property (added to dynamic IR but not yet in published SDK)
        const isInline = (declaration as { inline?: boolean }).inline;
        if (this.customConfig["enable-inline-types"] && isInline) {
            const inlineRef = this.getInlineClassReference(typeId);
            if (inlineRef != null) {
                return inlineRef;
            }
        }

        // Fallback to regular class reference
        return java.classReference({
            name: declaration.name.pascalCase.unsafeName,
            packageName: this.getTypesPackageName(declaration.fernFilepath)
        });
    }

    public getNullableClassReference(): java.ClassReference {
        return java.classReference({
            name: "Nullable",
            packageName: this.getCorePackageName()
        });
    }

    public getNullableOfNull(): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.getNullableClassReference(),
                method: "ofNull",
                arguments_: []
            })
        );
    }

    public getOptionalNullableClassReference(): java.ClassReference {
        return java.classReference({
            name: "OptionalNullable",
            packageName: this.getCorePackageName()
        });
    }

    public getOptionalNullableAbsent(): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.getOptionalNullableClassReference(),
                method: "absent",
                arguments_: []
            })
        );
    }

    public getOptionalNullableOf(value: java.TypeLiteral): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.invokeMethod({
                on: this.getOptionalNullableClassReference(),
                method: "of",
                arguments_: [value]
            })
        );
    }

    public getFileStreamFromString(content: string): java.TypeLiteral {
        return java.TypeLiteral.reference(
            java.codeblock((writer) => {
                writer.write("new ");
                writer.writeNode(this.getFileStreamClassReference());
                writer.write("(");
                writer.writeNode(this.getByteArrayInputStreamClassReference());
                writer.write("(");
                writer.writeNode(java.TypeLiteral.string(content));
                writer.write(".getBytes(");
                writer.writeNode(this.getStandardCharsetsClassReference());
                writer.write(".UTF_8)))");
            })
        );
    }

    public getFileStreamClassReference(): java.ClassReference {
        return java.classReference({
            name: "FileStream",
            packageName: this.getCorePackageName()
        });
    }

    public getByteArrayInputStreamClassReference(): java.ClassReference {
        return java.classReference({
            name: "ByteArrayInputStream",
            packageName: "java.io"
        });
    }

    public getStandardCharsetsClassReference(): java.ClassReference {
        return java.classReference({
            name: "StandardCharsets",
            packageName: "java.nio.charset"
        });
    }

    public isPrimitive(typeReference: FernIr.dynamic.TypeReference): boolean {
        switch (typeReference.type) {
            case "primitive":
                return true;
            case "optional":
            case "nullable":
                return this.isPrimitive(typeReference.value);
            case "named": {
                const named = this.resolveNamedType({ typeId: typeReference.value });
                if (named == null) {
                    return false;
                }
                switch (named.type) {
                    case "alias":
                        return this.isPrimitive(named.typeReference);
                    case "discriminatedUnion":
                    case "undiscriminatedUnion":
                    case "object":
                    case "enum":
                        return false;
                    default:
                        assertNever(named);
                }
                break;
            }
            case "list":
            case "set":
            case "map":
            case "literal":
            case "unknown":
                return false;
            default:
                assertNever(typeReference);
        }
    }

    public isDirectLiteral(typeReference: FernIr.dynamic.TypeReference): boolean {
        return typeReference.type === "literal";
    }

    public sortTypeInstancesByRequiredFirst(
        instances: Array<{
            name: FernIr.dynamic.NameAndWireValue;
            typeReference: FernIr.dynamic.TypeReference;
            value: unknown;
        }>,
        parameters: FernIr.dynamic.NamedParameter[]
    ): Array<{ name: FernIr.dynamic.NameAndWireValue; typeReference: FernIr.dynamic.TypeReference; value: unknown }> {
        const indexMap = new Map<string, number>();
        parameters.forEach((param, index) => {
            indexMap.set(param.name.wireValue, index);
        });

        const required: Array<{
            name: FernIr.dynamic.NameAndWireValue;
            typeReference: FernIr.dynamic.TypeReference;
            value: unknown;
        }> = [];
        const optional: Array<{
            name: FernIr.dynamic.NameAndWireValue;
            typeReference: FernIr.dynamic.TypeReference;
            value: unknown;
        }> = [];

        for (const instance of instances) {
            if (this.isOptional(instance.typeReference)) {
                optional.push(instance);
            } else {
                required.push(instance);
            }
        }

        required.sort((a, b) => (indexMap.get(a.name.wireValue) ?? 0) - (indexMap.get(b.name.wireValue) ?? 0));

        return [...required, ...optional];
    }

    /**
     * Override to preserve parameter order for Java staged builders.
     *
     * Java uses type-state staged builders where method call order is enforced at compile time.
     * Unlike Python/TypeScript/Go which use keyword arguments or object literals (order-independent),
     * Java requires fields to be set in the exact order they appear in the schema definition.
     *
     * This override calls the base implementation to preserve all error handling semantics,
     * then reorders the results to match schema parameter order.
     */
    public override associateByWireValue({
        parameters,
        values,
        ignoreMissingParameters
    }: {
        parameters: FernIr.dynamic.NamedParameter[];
        values: FernIr.dynamic.Values;
        ignoreMissingParameters?: boolean;
    }): TypeInstance[] {
        // Call base implementation to preserve all error handling semantics
        const instances = super.associateByWireValue({ parameters, values, ignoreMissingParameters });

        // Build a map of wire value -> TypeInstance for efficient lookup
        const byWireValue = new Map<string, TypeInstance>();
        for (const instance of instances) {
            byWireValue.set(instance.name.wireValue, instance);
        }

        // Reorder instances to match schema parameter order
        const ordered: TypeInstance[] = [];
        for (const parameter of parameters) {
            const instance = byWireValue.get(parameter.name.wireValue);
            if (instance != null) {
                ordered.push(instance);
            }
        }

        return ordered;
    }

    public getRootPackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        return this.joinPackageTokens(tokens);
    }

    public getCorePackageName(): string {
        const tokens = this.getPackagePrefixTokens();
        tokens.push("core");
        return this.joinPackageTokens(tokens);
    }

    public getTypesPackageName(fernFilepath: FernIr.dynamic.FernFilepath): string {
        return this.getResourcesPackage(fernFilepath, "types");
    }

    public getRequestsPackageName(fernFilepath: FernIr.dynamic.FernFilepath): string {
        if (this.getPackageLayout() === "flat") {
            return this.getTypesPackageName(fernFilepath);
        }
        return this.getResourcesPackage(fernFilepath, "requests");
    }

    protected getResourcesPackage(fernFilepath: FernIr.dynamic.FernFilepath, suffix?: string): string {
        const tokens = this.getPackagePrefixTokens();
        switch (this.getPackageLayout()) {
            case "flat":
                if (fernFilepath != null) {
                    tokens.push(
                        ...fernFilepath.packagePath.map((name: FernIr.dynamic.Name) => this.getPackageNameSegment(name))
                    );
                }
                break;
            case "nested":
            default:
                if (fernFilepath != null && fernFilepath.allParts.length > 0) {
                    tokens.push("resources");
                }
                if (fernFilepath != null) {
                    tokens.push(
                        ...fernFilepath.allParts.map((name: FernIr.dynamic.Name) => this.getPackageNameSegment(name))
                    );
                }
        }
        if (suffix != null) {
            tokens.push(suffix);
        }
        return this.joinPackageTokens(tokens);
    }

    public getPackageName(fernFilepath: FernIr.dynamic.FernFilepath, suffix?: string): string {
        let parts = this.getPackageNameSegments(fernFilepath);
        parts = suffix != null ? [...parts, suffix] : parts;
        return [...this.getPackagePrefixTokens(), ...parts].join(".");
    }

    public getPackageLayout(): string {
        return this.customConfig?.["package-layout"] ?? "nested";
    }

    public shouldInlinePathParameters(): boolean {
        return this.customConfig?.["inline-path-parameters"] ?? false;
    }

    public shouldInlineFileProperties(): boolean {
        return this.customConfig?.["inline-file-properties"] ?? false;
    }

    private getPackageNameSegments(fernFilepath: FernIr.dynamic.FernFilepath): string[] {
        return fernFilepath.packagePath.map((segment: FernIr.dynamic.Name) => this.getPackageNameSegment(segment));
    }

    private getPackageNameSegment(name: FernIr.dynamic.Name): string {
        return name.camelCase.safeName.toLowerCase();
    }

    private getPackagePrefixTokens(): string[] {
        if (this.customConfig?.["package-prefix"] != null) {
            return this.customConfig["package-prefix"].split(".");
        }
        const prefix: string[] = [];
        prefix.push("com");
        prefix.push(...this.splitOnNonAlphaNumericChar(this.config.organization));
        prefix.push(...this.splitOnNonAlphaNumericChar(this.getApiName()));
        return prefix;
    }

    private getBaseNamePrefix(): string {
        return (
            this.convertKebabCaseToUpperCamelCase(this.config.organization) +
            this.convertKebabCaseToUpperCamelCase(this.getApiName())
        );
    }

    private getApiName(): string {
        return camelCase(this.config.workspaceName);
    }

    private startsWithNumber(token: string): boolean {
        return /^\d/.test(token);
    }

    private splitOnNonAlphaNumericChar(value: string): string[] {
        return value.split(/[^a-zA-Z0-9]/);
    }

    private convertKebabCaseToUpperCamelCase(kebab: string): string {
        return kebab.replace(/-([a-z])/g, (_, char) => char.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
    }

    private joinPackageTokens(tokens: string[]): string {
        const sanitizedTokens = tokens.map((token) => {
            return this.startsWithNumber(token) ? "_" + token : token;
        });
        return sanitizedTokens.join(".");
    }

    private getName(name: string): string {
        if (this.isReservedName(name)) {
            return "_" + name;
        }
        return name;
    }

    private isReservedName(name: string): boolean {
        return RESERVED_NAMES.has(name);
    }
}
