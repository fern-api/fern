import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { isDateTimeOnlyType, typeSupportsHashAndEq, typeSupportsPartialEq } from "../utils/primitiveTypeUtils.js";
import { isFieldRecursive } from "../utils/recursiveTypeUtils.js";

/**
 * Represents a deduplicated variant in an undiscriminated union enum.
 * Each variant is uniquely determined by its type.
 */
interface ResolvedVariant {
    /** PascalCase name for the enum variant */
    variantName: string;
    /** snake_case name for method names (is_, as_, into_) */
    methodSuffix: string;
    /** The type reference used for the enum variant definition (preserves Option wrapping for serde) */
    typeRef: FernIr.TypeReference;
    /** The innermost type reference (with optional/nullable stripped) for conversion method return types */
    innerTypeRef: FernIr.TypeReference;
}

export class UndiscriminatedUnionGenerator {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly undiscriminatedUnionTypeDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    private get typeId(): string {
        return this.typeDeclaration.name.typeId;
    }

    public constructor(
        typeDeclaration: FernIr.TypeDeclaration,
        undiscriminatedUnionTypeDeclaration: FernIr.UndiscriminatedUnionTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.undiscriminatedUnionTypeDeclaration = undiscriminatedUnionTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const filename = this.context.getUniqueFilenameForType(this.typeDeclaration);

        const writer = new rust.Writer();

        // Write use statements
        writer.writeLine("pub use crate::prelude::*;");
        writer.newLine();

        // Generate the undiscriminated union enum
        this.generateUndiscriminatedUnionEnum(writer);

        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }

    /**
     * Resolves all union members into deduplicated variants.
     * Members with the same type are collapsed into a single variant.
     */
    private resolveVariants(): ResolvedVariant[] {
        const seen = new Set<string>();
        const variants: ResolvedVariant[] = [];

        for (const member of this.undiscriminatedUnionTypeDeclaration.members) {
            const names = this.getNamesForTypeReference(member.type);
            if (names == null) {
                continue;
            }
            if (seen.has(names.variantName)) {
                continue;
            }
            seen.add(names.variantName);
            // For the enum variant, use the original member type (preserves Option wrapping for serde).
            // For conversion method return types, use the fully unwrapped type to avoid double-Option.
            const innerTypeRef = unwrapOptional(member.type);
            variants.push({
                variantName: names.variantName,
                methodSuffix: names.methodSuffix,
                typeRef: member.type,
                innerTypeRef
            });
        }

        return variants;
    }

    private generateUndiscriminatedUnionEnum(writer: rust.Writer): void {
        const typeName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);
        const variants = this.resolveVariants();

        // Generate union attributes
        const attributes = this.generateUnionAttributes();
        attributes.forEach((attr) => {
            attr.write(writer);
            writer.newLine();
        });

        // Start enum definition
        writer.writeBlock(`pub enum ${typeName}`, () => {
            variants.forEach((variant, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                this.generateUnionMember(writer, variant);
            });
        });

        // Generate helper methods
        this.generateImplementationBlock(writer, typeName, variants);

        // Generate Display implementation if all variants support Display
        if (this.allVariantsSupportDisplay(variants)) {
            writer.newLine();
            this.generateDisplayImplementation(writer, typeName, variants);
        }
    }

    private generateUnionAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Basic derives - start with essential ones
        const derives = ["Debug", "Clone", "Serialize", "Deserialize"];

        // PartialEq - for equality comparisons
        if (this.canDerivePartialEq()) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all variant types support them
        if (this.canDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        // Serde untagged attribute for undiscriminated union
        attributes.push(Attribute.serde.untagged());

        return attributes;
    }

    private generateUnionMember(writer: rust.Writer, variant: ResolvedVariant): void {
        const isRecursive =
            variant.typeRef.type === "named"
                ? isFieldRecursive(this.typeId, variant.typeRef, this.context.ir)
                : false;

        const memberType = generateRustTypeForTypeReference(variant.typeRef, this.context, isRecursive);

        if (isDateTimeOnlyType(variant.typeRef)) {
            const dateTimeType = this.context.getDateTimeType();
            const modulePath =
                dateTimeType === "utc"
                    ? "crate::core::flexible_datetime::utc"
                    : "crate::core::flexible_datetime::offset";
            writer.writeLine(`    ${variant.variantName}(`);
            writer.writeLine(`        #[serde(with = "${modulePath}")]`);
            writer.writeLine(`        ${memberType.toString()}`);
            writer.writeLine(`    ),`);
        } else {
            writer.writeLine(`    ${variant.variantName}(${memberType.toString()}),`);
        }
    }

    /**
     * Derives variant and method names from a type reference.
     * Every type maps to a unique name — no index-based fallbacks.
     */
    private getNamesForTypeReference(
        typeRef: FernIr.TypeReference
    ): { variantName: string; methodSuffix: string } | undefined {
        switch (typeRef.type) {
            case "named":
                return {
                    variantName: this.context.case.pascalUnsafe(typeRef.name),
                    methodSuffix: this.context.case.snakeUnsafe(typeRef.name)
                };
            case "primitive":
                return this.getPrimitiveNames(typeRef.primitive.v1);
            case "container":
                return this.getContainerNames(typeRef.container);
            case "unknown":
                return { variantName: "Value", methodSuffix: "value" };
            default:
                return undefined;
        }
    }

    private getPrimitiveNames(
        primitiveType: string
    ): { variantName: string; methodSuffix: string } | undefined {
        switch (primitiveType) {
            case "STRING":
                return { variantName: "String", methodSuffix: "string" };
            case "BOOLEAN":
                return { variantName: "Boolean", methodSuffix: "boolean" };
            case "INTEGER":
                return { variantName: "Integer", methodSuffix: "integer" };
            case "LONG":
                return { variantName: "Long", methodSuffix: "long" };
            case "DOUBLE":
                return { variantName: "Double", methodSuffix: "double" };
            case "FLOAT":
                return { variantName: "Float", methodSuffix: "float" };
            case "DATE_TIME":
                return { variantName: "DateTime", methodSuffix: "date_time" };
            case "DATE":
                return { variantName: "Date", methodSuffix: "date" };
            case "UUID":
                return { variantName: "Uuid", methodSuffix: "uuid" };
            case "BASE_64":
                return { variantName: "Base64", methodSuffix: "base_64" };
            case "BIG_INTEGER":
                return { variantName: "BigInteger", methodSuffix: "big_integer" };
            case "UINT":
                return { variantName: "Uint", methodSuffix: "uint" };
            case "UINT_64":
                return { variantName: "Uint64", methodSuffix: "uint_64" };
            default:
                return undefined;
        }
    }

    private getContainerNames(
        container: FernIr.ContainerType
    ): { variantName: string; methodSuffix: string } | undefined {
        switch (container.type) {
            case "list": {
                const inner = this.getNamesForTypeReference(container.list);
                return inner != null
                    ? { variantName: `${inner.variantName}List`, methodSuffix: `${inner.methodSuffix}_list` }
                    : undefined;
            }
            case "set": {
                const inner = this.getNamesForTypeReference(container.set);
                return inner != null
                    ? { variantName: `${inner.variantName}Set`, methodSuffix: `${inner.methodSuffix}_set` }
                    : undefined;
            }
            case "map": {
                const key = this.getNamesForTypeReference(container.keyType);
                const value = this.getNamesForTypeReference(container.valueType);
                return key != null && value != null
                    ? {
                          variantName: `${key.variantName}To${value.variantName}Map`,
                          methodSuffix: `${key.methodSuffix}_to_${value.methodSuffix}_map`
                      }
                    : undefined;
            }
            case "optional": {
                const unwrapped = unwrapOptional(container.optional);
                const inner = this.getNamesForTypeReference(unwrapped);
                return inner != null
                    ? { variantName: `Optional${inner.variantName}`, methodSuffix: `optional_${inner.methodSuffix}` }
                    : undefined;
            }
            case "nullable": {
                const unwrapped = unwrapOptional(container.nullable);
                const inner = this.getNamesForTypeReference(unwrapped);
                return inner != null
                    ? { variantName: `Optional${inner.variantName}`, methodSuffix: `optional_${inner.methodSuffix}` }
                    : undefined;
            }
            case "literal": {
                if (container.literal.type === "string") {
                    return { variantName: "String", methodSuffix: "string" };
                }
                return { variantName: "Boolean", methodSuffix: "boolean" };
            }
            default:
                return undefined;
        }
    }

    private generateImplementationBlock(
        writer: rust.Writer,
        typeName: string,
        variants: ResolvedVariant[]
    ): void {
        writer.newLine();
        writer.writeBlock(`impl ${typeName}`, () => {
            // Generate helper methods to check variant types
            this.generateVariantCheckers(writer, variants);
            writer.newLine();

            // Generate conversion methods
            this.generateConversionMethods(writer, variants);
        });
    }

    private generateVariantCheckers(writer: rust.Writer, variants: ResolvedVariant[]): void {
        variants.forEach((variant, index) => {
            if (index > 0) {
                writer.newLine();
            }
            writer.writeBlock(`pub fn is_${variant.methodSuffix}(&self) -> bool`, () => {
                writer.writeLine(`matches!(self, Self::${variant.variantName}(_))`);
            });
        });
    }

    private generateConversionMethods(writer: rust.Writer, variants: ResolvedVariant[]): void {
        variants.forEach((variant) => {
            // Use innerTypeRef (optional/nullable stripped) for return types to avoid double-Option
            const isRecursive =
                variant.innerTypeRef.type === "named"
                    ? isFieldRecursive(this.typeId, variant.innerTypeRef, this.context.ir)
                    : false;
            const returnType = generateRustTypeForTypeReference(variant.innerTypeRef, this.context, isRecursive);
            const unboxedReturnType = generateRustTypeForTypeReference(variant.innerTypeRef, this.context, false);

            // When the variant wraps an Option (e.g. OptionalString(Option<String>)),
            // the match arm extracts an Option<T>, so we need different accessor logic
            // than for non-optional variants where we extract T directly.
            const isOptionalVariant = variant.typeRef !== variant.innerTypeRef;

            // Use &str instead of &String for idiomatic Rust
            const borrowedType = returnType.toString() === "String" ? "&str" : `&${returnType.toString()}`;

            writer.newLine();
            if (isOptionalVariant) {
                // value is Option<T>, need to convert to Option<&T> via as_ref() / as_deref()
                const asRefExpr = returnType.toString() === "String" ? "value.as_deref()" : "value.as_ref()";
                writer.writeBlock(
                    `pub fn as_${variant.methodSuffix}(&self) -> Option<${borrowedType}>`,
                    () => {
                        writer.writeLine("match self {");
                        writer.writeLine(`            Self::${variant.variantName}(value) => ${asRefExpr},`);
                        writer.writeLine("            _ => None,");
                        writer.writeLine("        }");
                    }
                );
            } else {
                writer.writeBlock(
                    `pub fn as_${variant.methodSuffix}(&self) -> Option<${borrowedType}>`,
                    () => {
                        writer.writeLine("match self {");
                        writer.writeLine(`            Self::${variant.variantName}(value) => Some(value),`);
                        writer.writeLine("            _ => None,");
                        writer.writeLine("        }");
                    }
                );
            }

            writer.newLine();
            if (isOptionalVariant) {
                // value is already Option<T>, just return it directly
                const returnValue = isRecursive ? "value.map(|v| *v)" : "value";
                writer.writeBlock(
                    `pub fn into_${variant.methodSuffix}(self) -> Option<${unboxedReturnType.toString()}>`,
                    () => {
                        writer.writeLine("match self {");
                        writer.writeLine(`            Self::${variant.variantName}(value) => ${returnValue},`);
                        writer.writeLine("            _ => None,");
                        writer.writeLine("        }");
                    }
                );
            } else {
                const returnValue = isRecursive ? "Some(*value)" : "Some(value)";
                writer.writeBlock(
                    `pub fn into_${variant.methodSuffix}(self) -> Option<${unboxedReturnType.toString()}>`,
                    () => {
                        writer.writeLine("match self {");
                        writer.writeLine(`            Self::${variant.variantName}(value) => ${returnValue},`);
                        writer.writeLine("            _ => None,");
                        writer.writeLine("        }");
                    }
                );
            }
        });
    }

    private canDerivePartialEq(): boolean {
        return this.undiscriminatedUnionTypeDeclaration.members.every((member) => {
            return typeSupportsPartialEq(member.type, this.context);
        });
    }

    private canDeriveHashAndEq(): boolean {
        return this.undiscriminatedUnionTypeDeclaration.members.every((member) => {
            return typeSupportsHashAndEq(member.type, this.context);
        });
    }

    private allVariantsSupportDisplay(variants: ResolvedVariant[]): boolean {
        return variants.every((variant) => {
            const typeRef = variant.typeRef;
            return typeRef.type === "named" || typeRef.type === "primitive";
        });
    }

    private generateDisplayImplementation(
        writer: rust.Writer,
        typeName: string,
        variants: ResolvedVariant[]
    ): void {
        writer.writeLine(`impl fmt::Display for ${typeName} {`);
        writer.indent();
        writer.writeLine("fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {");
        writer.indent();
        writer.writeLine("match self {");
        writer.indent();

        for (const variant of variants) {
            const typeRef = variant.typeRef;
            if (typeRef.type === "primitive") {
                writer.writeLine(`Self::${variant.variantName}(value) => write!(f, "{}", value),`);
            } else if (
                typeRef.type === "container" &&
                (typeRef.container.type === "list" ||
                    typeRef.container.type === "set" ||
                    typeRef.container.type === "map")
            ) {
                writer.writeLine(`Self::${variant.variantName}(value) => write!(f, "{:?}", value),`);
            } else if (typeRef.type === "named") {
                writer.writeLine(
                    `Self::${variant.variantName}(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),`
                );
            } else {
                writer.writeLine(`Self::${variant.variantName}(value) => write!(f, "{:?}", value),`);
            }
        }

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }
}

/**
 * Strips all nested optional/nullable wrappers from a type reference,
 * matching the AST layer's `isAlreadyOptional` flattening behavior.
 * e.g. optional<nullable<integer>> → integer (the caller adds the single Optional prefix).
 */
function unwrapOptional(typeRef: FernIr.TypeReference): FernIr.TypeReference {
    if (typeRef.type === "container") {
        if (typeRef.container.type === "optional") {
            return unwrapOptional(typeRef.container.optional);
        }
        if (typeRef.container.type === "nullable") {
            return unwrapOptional(typeRef.container.nullable);
        }
    }
    return typeRef;
}
