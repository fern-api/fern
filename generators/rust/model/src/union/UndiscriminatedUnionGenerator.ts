import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";
import {
    TypeDeclaration,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { typeSupportsHashAndEq, typeSupportsPartialEq } from "../utils/primitiveTypeUtils";
import { isFieldRecursive } from "../utils/recursiveTypeUtils";

export class UndiscriminatedUnionGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration,
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

    private generateUndiscriminatedUnionEnum(writer: rust.Writer): void {
        const typeName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);

        // Generate union attributes
        const attributes = this.generateUnionAttributes();
        attributes.forEach((attr) => {
            attr.write(writer);
            writer.newLine();
        });

        // Start enum definition
        writer.writeBlock(`pub enum ${typeName}`, () => {
            // Generate variants for each member
            this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                this.generateUnionMember(writer, member, index);
            });
        });

        // Generate helper methods
        this.generateImplementationBlock(writer, typeName);

        // Generate Display implementation if all variants support Display
        if (this.canImplementDisplay()) {
            writer.newLine();
            this.generateDisplayImplementation(writer, typeName);
        }
    }

    private generateUnionAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Basic derives - start with essential ones
        let derives = ["Debug", "Clone", "Serialize", "Deserialize"];

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

    private generateUnionMember(writer: rust.Writer, member: UndiscriminatedUnionMember, index: number): void {
        // Find the typeId for this union to detect recursive fields
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        // Check if this member creates a recursive reference
        // Only apply Box wrapping for named types, not containers (Vec, HashMap are already heap-allocated)
        const isRecursive =
            member.type.type === "named" && typeId ? isFieldRecursive(typeId, member.type, this.context.ir) : false;

        const memberType = generateRustTypeForTypeReference(member.type, this.context, isRecursive);

        // Generate variant name based on the type or index
        const variantName = this.getVariantNameForMember(member, index);

        // Generate the variant as a tuple variant
        writer.writeLine(`    ${variantName}(${memberType.toString()}),`);
    }

    private getVariantNameForMember(member: UndiscriminatedUnionMember, index: number): string {
        // Try to extract a meaningful name from the type reference
        const memberType = member.type;

        if (memberType.type === "named") {
            return memberType.name.pascalCase.unsafeName;
        } else if (memberType.type === "primitive") {
            // Handle primitive types
            const primitiveType = memberType.primitive.v1;
            switch (primitiveType) {
                case "STRING":
                    return "String";
                case "BOOLEAN":
                    return "Boolean";
                case "INTEGER":
                    return "Integer";
                case "LONG":
                    return "Long";
                case "DOUBLE":
                    return "Double";
                case "DATE_TIME":
                    return "DateTime";
                case "DATE":
                    return "Date";
                case "UUID":
                    return "Uuid";
                case "BASE_64":
                    return "Base64";
                default:
                    return `Variant${index}`;
            }
        } else if (memberType.type === "container") {
            // Handle container types - include inner type information to avoid conflicts
            const containerType = memberType.container.type;
            switch (containerType) {
                case "list": {
                    // Try to get the inner type name to make it unique
                    const listInnerType = memberType.container.list;
                    if (listInnerType.type === "named") {
                        return `${listInnerType.name.pascalCase.unsafeName}List`;
                    }
                    return `List${index}`;
                }
                case "map":
                    return `Map${index}`;
                case "set":
                    return `Set${index}`;
                case "optional":
                    return `Optional${index}`;
                case "nullable":
                    return `Nullable${index}`;
                case "literal":
                    return `Literal${index}`;
                default:
                    return `Container${index}`;
            }
        } else if (memberType.type === "unknown") {
            return "Unknown";
        } else {
            // Fallback to indexed variant name
            return `Variant${index}`;
        }
    }

    private generateImplementationBlock(writer: rust.Writer, typeName: string): void {
        writer.newLine();
        writer.writeBlock(`impl ${typeName}`, () => {
            // Generate helper methods to check variant types
            this.generateVariantCheckers(writer);
            writer.newLine();

            // Generate conversion methods
            this.generateConversionMethods(writer);
        });
    }

    private generateVariantCheckers(writer: rust.Writer): void {
        const generatedMethods = new Set<string>();

        this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
            const variantName = this.getVariantNameForMember(member, index);
            const methodName = `is_${variantName.toLowerCase()}`;

            // Only generate if we haven't already generated this method name
            if (!generatedMethods.has(methodName)) {
                generatedMethods.add(methodName);

                writer.writeBlock(`pub fn ${methodName}(&self) -> bool`, () => {
                    writer.writeLine(`matches!(self, Self::${variantName}(_))`);
                });
                writer.newLine();
            }
        });
    }

    private generateConversionMethods(writer: rust.Writer): void {
        const generatedMethods = new Set<string>();
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
            const variantName = this.getVariantNameForMember(member, index);
            // Only apply Box wrapping for named types, not containers
            const isRecursive =
                member.type.type === "named" && typeId ? isFieldRecursive(typeId, member.type, this.context.ir) : false;
            const memberType = generateRustTypeForTypeReference(member.type, this.context, isRecursive);

            // For the return type of into_*, use the unboxed type
            const unboxedMemberType = generateRustTypeForTypeReference(member.type, this.context, false);

            const methodName = `as_${variantName.toLowerCase()}`;
            const ownedMethodName = `into_${variantName.toLowerCase()}`;

            // Only generate if we haven't already generated these method names
            if (!generatedMethods.has(methodName)) {
                generatedMethods.add(methodName);
                generatedMethods.add(ownedMethodName);

                writer.writeBlock(`pub fn ${methodName}(&self) -> Option<&${memberType.toString()}>`, () => {
                    writer.writeLine("match self {");
                    writer.writeLine(`            Self::${variantName}(value) => Some(value),`);
                    writer.writeLine("            _ => None,");
                    writer.writeLine("        }");
                });
                writer.newLine();

                // Also generate owned conversion
                // For boxed named types, return unboxed type and dereference: Some(*value)
                // For containers (Vec, HashMap), just return the value as-is
                const returnValue = isRecursive ? "Some(*value)" : "Some(value)";
                writer.writeBlock(`pub fn ${ownedMethodName}(self) -> Option<${unboxedMemberType.toString()}>`, () => {
                    writer.writeLine("match self {");
                    writer.writeLine(`            Self::${variantName}(value) => ${returnValue},`);
                    writer.writeLine("            _ => None,");
                    writer.writeLine("        }");
                });
                writer.newLine();
            }
        });
    }

    private canDerivePartialEq(): boolean {
        // Check if all variant types can support PartialEq derive
        return this.undiscriminatedUnionTypeDeclaration.members.every((member) => {
            return typeSupportsPartialEq(member.type, this.context);
        });
    }

    private canDeriveHashAndEq(): boolean {
        // Check if all variant types can support Hash and Eq derives
        return this.undiscriminatedUnionTypeDeclaration.members.every((member) => {
            return typeSupportsHashAndEq(member.type, this.context);
        });
    }

    private canImplementDisplay(): boolean {
        // Check if all variant types support Display
        // For now, we'll implement Display if all variants are named types
        return this.undiscriminatedUnionTypeDeclaration.members.every((member) => {
            // Named types (enums, objects, etc.) should have Display implementations
            if (member.type.type === "named") {
                return true;
            }
            // Primitive types all support Display
            if (member.type.type === "primitive") {
                return true;
            }
            return false;
        });
    }

    private generateDisplayImplementation(writer: rust.Writer, typeName: string): void {
        writer.writeLine(`impl fmt::Display for ${typeName} {`);
        writer.indent();
        writer.writeLine("fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {");
        writer.indent();
        writer.writeLine("match self {");
        writer.indent();

        // Generate match arms for each variant
        this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
            const variantName = this.getVariantNameForMember(member, index);

            // Check if the type likely supports Display
            if (member.type.type === "primitive") {
                // Primitive types all support Display
                writer.writeLine(`Self::${variantName}(value) => write!(f, "{}", value),`);
            } else if (
                member.type.type === "container" &&
                (member.type.container.type === "list" ||
                    member.type.container.type === "set" ||
                    member.type.container.type === "map")
            ) {
                // Collections should use Debug format
                writer.writeLine(`Self::${variantName}(value) => write!(f, "{:?}", value),`);
            } else if (member.type.type === "named") {
                // For named types, try to serialize to JSON as a fallback
                // This ensures we always have a string representation
                writer.writeLine(
                    `Self::${variantName}(value) => write!(f, "{}", serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))),`
                );
            } else {
                // Default to Debug format for unknown types
                writer.writeLine(`Self::${variantName}(value) => write!(f, "{:?}", value),`);
            }
        });

        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
        writer.dedent();
        writer.writeLine("}");
    }
}
