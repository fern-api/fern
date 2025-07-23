import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";

import {
    TypeDeclaration,
    UndiscriminatedUnionMember,
    UndiscriminatedUnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import { isCollectionType, isDateTimeType, isUnknownType, isUuidType } from "../utils/primitiveTypeUtils";

export class UndiscriminatedUnionGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration;

    public constructor(
        typeDeclaration: TypeDeclaration,
        undiscriminatedUnionTypeDeclaration: UndiscriminatedUnionTypeDeclaration
    ) {
        this.typeDeclaration = typeDeclaration;
        this.undiscriminatedUnionTypeDeclaration = undiscriminatedUnionTypeDeclaration;
    }

    public generate(): RustFile {
        const filename = `${this.typeDeclaration.name.name.snakeCase.unsafeName}.rs`;

        const writer = new rust.Writer();

        // Write use statements
        this.writeUseStatements(writer);
        writer.newLine();

        // Generate the undiscriminated union enum
        this.generateUndiscriminatedUnionEnum(writer);

        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }

    private writeUseStatements(writer: rust.Writer): void {
        writer.writeLine("use serde::{Deserialize, Serialize};");

        // Add chrono if we have datetime fields
        if (this.hasDateTimeFields()) {
            writer.writeLine("use chrono::{DateTime, Utc};");
        }

        // Add std::collections if we have maps or sets
        if (this.hasCollectionFields()) {
            writer.writeLine("use std::collections::HashMap;");
        }

        // Add uuid if we have UUID fields
        if (this.hasUuidFields()) {
            writer.writeLine("use uuid::Uuid;");
        }

        // Add serde_json if we have unknown/Value fields
        if (this.hasJsonValueFields()) {
            writer.writeLine("use serde_json::Value;");
        }
    }

    private generateUndiscriminatedUnionEnum(writer: rust.Writer): void {
        const typeName = this.typeDeclaration.name.name.pascalCase.unsafeName;

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
    }

    private generateUnionAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];
        attributes.push(Attribute.derive(derives));

        // Serde untagged attribute for undiscriminated union
        attributes.push(Attribute.serde.untagged());

        return attributes;
    }

    private generateUnionMember(writer: rust.Writer, member: UndiscriminatedUnionMember, index: number): void {
        const memberType = generateRustTypeForTypeReference(member.type);

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
            // Handle container types
            const containerType = memberType.container.type;
            switch (containerType) {
                case "list":
                    return "List";
                case "map":
                    return "Map";
                case "set":
                    return "Set";
                case "optional":
                    return "Optional";
                case "nullable":
                    return "Nullable";
                case "literal":
                    return "Literal";
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
        this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
            const variantName = this.getVariantNameForMember(member, index);
            const methodName = `is_${variantName.toLowerCase()}`;

            writer.writeBlock(`pub fn ${methodName}(&self) -> bool`, () => {
                writer.writeLine(`matches!(self, Self::${variantName}(_))`);
            });
            writer.newLine();
        });
    }

    private generateConversionMethods(writer: rust.Writer): void {
        this.undiscriminatedUnionTypeDeclaration.members.forEach((member, index) => {
            const variantName = this.getVariantNameForMember(member, index);
            const memberType = generateRustTypeForTypeReference(member.type);
            const methodName = `as_${variantName.toLowerCase()}`;

            writer.writeBlock(`pub fn ${methodName}(&self) -> Option<&${memberType.toString()}>`, () => {
                writer.writeLine("match self {");
                writer.writeLine(`            Self::${variantName}(value) => Some(value),`);
                writer.writeLine("            _ => None,");
                writer.writeLine("        }");
            });
            writer.newLine();

            // Also generate owned conversion
            const ownedMethodName = `into_${variantName.toLowerCase()}`;
            writer.writeBlock(`pub fn ${ownedMethodName}(self) -> Option<${memberType.toString()}>`, () => {
                writer.writeLine("match self {");
                writer.writeLine(`            Self::${variantName}(value) => Some(value),`);
                writer.writeLine("            _ => None,");
                writer.writeLine("        }");
            });
            writer.newLine();
        });
    }

    // Helper methods to detect field types for imports
    private hasDateTimeFields(): boolean {
        return this.hasFieldsOfType(isDateTimeType);
    }

    private hasUuidFields(): boolean {
        return this.hasFieldsOfType(isUuidType);
    }

    private hasCollectionFields(): boolean {
        return this.hasFieldsOfType(isCollectionType);
    }

    private hasJsonValueFields(): boolean {
        return this.hasFieldsOfType(isUnknownType);
    }

    private hasFieldsOfType(predicate: (typeRef: any) => boolean): boolean {
        return this.undiscriminatedUnionTypeDeclaration.members.some((member) => predicate(member.type));
    }
}
