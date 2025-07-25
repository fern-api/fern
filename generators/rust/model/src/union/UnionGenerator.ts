import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";
import { SingleUnionType, TypeDeclaration, TypeReference, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import {
    isCollectionType,
    isDateTimeType,
    isOptionalType,
    isUnknownType,
    isUuidType
} from "../utils/primitiveTypeUtils";

export class UnionGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly unionTypeDeclaration: UnionTypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration, unionTypeDeclaration: UnionTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.unionTypeDeclaration = unionTypeDeclaration;
    }

    public generate(): RustFile {
        const typeName = this.typeDeclaration.name.name.pascalCase.unsafeName;
        const filename = `${this.typeDeclaration.name.name.snakeCase.unsafeName}.rs`;

        const writer = new rust.Writer();

        // Write use statements
        this.writeUseStatements(writer);
        writer.newLine();

        // Generate the union enum
        this.generateUnionEnum(writer);

        return new RustFile({
            filename,
            directory: RelativeFilePath.of("src"),
            fileContents: writer.toString()
        });
    }

    private writeUseStatements(writer: rust.Writer): void {
        // Add imports for variant types FIRST
        const variantTypes = this.getVariantTypesUsedInUnion();
        variantTypes.forEach((typeName) => {
            const moduleNameEscaped = this.escapeRustKeyword(typeName.snakeCase.unsafeName);
            writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
        });

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

        // Add serde imports LAST
        writer.writeLine("use serde::{Deserialize, Serialize};");
    }

    private generateUnionEnum(writer: rust.Writer): void {
        const typeName = this.typeDeclaration.name.name.pascalCase.unsafeName;
        const discriminantField = this.unionTypeDeclaration.discriminant.wireValue;

        // Generate union attributes
        const attributes = this.generateUnionAttributes();
        attributes.forEach((attr) => {
            attr.write(writer);
            writer.newLine();
        });

        // Start enum definition
        writer.writeBlock(`pub enum ${typeName}`, () => {
            // Generate variants
            this.unionTypeDeclaration.types.forEach((unionType, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                this.generateUnionVariant(writer, unionType);
            });
        });

        // Generate implementation block if needed
        this.generateImplementationBlock(writer, typeName);
    }

    private generateUnionAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];
        attributes.push(Attribute.derive(derives));

        // Serde tag attribute for discriminated union
        const discriminantField = this.unionTypeDeclaration.discriminant.wireValue;
        attributes.push(Attribute.serde.tag(discriminantField));

        return attributes;
    }

    private generateUnionVariant(writer: rust.Writer, unionType: SingleUnionType): void {
        const variantName = unionType.discriminantValue.name.pascalCase.unsafeName;
        const discriminantValue = unionType.discriminantValue.wireValue;

        // Generate variant attributes
        const variantAttributes = this.generateVariantAttributes(unionType);
        variantAttributes.forEach((attr) => {
            writer.write("    ");
            attr.write(writer);
            writer.newLine();
        });

        // Generate variant based on its shape
        unionType.shape._visit({
            noProperties: () => {
                writer.writeLine(`    ${variantName},`);
            },
            singleProperty: (singleProperty) => {
                const fieldType = generateRustTypeForTypeReference(singleProperty.type);
                const fieldName = singleProperty.name.name.snakeCase.unsafeName;

                writer.writeLine(`    ${variantName} {`);
                writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);

                // Add base properties if they exist
                this.generateBaseProperties(writer);

                writer.writeLine(`    },`);
            },
            samePropertiesAsObject: (declaredTypeName) => {
                const objectTypeName = declaredTypeName.name.pascalCase.unsafeName;

                writer.writeLine(`    ${variantName} {`);
                writer.writeLine(`        #[serde(flatten)]`);
                writer.writeLine(`        data: ${objectTypeName},`);

                // Add base properties if they exist
                this.generateBaseProperties(writer);

                writer.writeLine(`    },`);
            },
            _other: () => {
                // Fallback for unknown variant shapes
                writer.writeLine(`    ${variantName} {`);
                writer.writeLine(`        #[serde(flatten)]`);
                writer.writeLine(`        data: serde_json::Value,`);

                // Add base properties if they exist
                this.generateBaseProperties(writer);

                writer.writeLine(`    },`);
            }
        });
    }

    private generateVariantAttributes(unionType: SingleUnionType): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];
        const discriminantValue = unionType.discriminantValue.wireValue;
        const variantName = unionType.discriminantValue.name.pascalCase.unsafeName;

        // Add serde rename if the variant name differs from discriminant value
        if (variantName.toLowerCase() !== discriminantValue.toLowerCase()) {
            attributes.push(Attribute.serde.rename(discriminantValue));
        }

        return attributes;
    }

    private generateBaseProperties(writer: rust.Writer): void {
        // Generate base properties that are common to all variants
        this.unionTypeDeclaration.baseProperties.forEach((property) => {
            const fieldName = property.name.name.snakeCase.unsafeName;
            const fieldType = generateRustTypeForTypeReference(property.valueType);
            const wireValue = property.name.wireValue;

            if (fieldName !== wireValue) {
                writer.writeLine(`        #[serde(rename = "${wireValue}")]`);
            }

            if (isOptionalType(property.valueType)) {
                writer.writeLine(`        #[serde(skip_serializing_if = "Option::is_none")]`);
            }

            writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);
        });
    }

    private generateImplementationBlock(writer: rust.Writer, typeName: string): void {
        // Only generate implementation if we have base properties or need helper methods
        if (this.unionTypeDeclaration.baseProperties.length === 0) {
            return;
        }

        writer.newLine();
        writer.writeBlock(`impl ${typeName}`, () => {
            // Generate getter methods for base properties
            this.unionTypeDeclaration.baseProperties.forEach((property) => {
                const fieldName = property.name.name.snakeCase.unsafeName;
                const fieldType = generateRustTypeForTypeReference(property.valueType);
                const methodName = `get_${fieldName}`;

                writer.writeBlock(`pub fn ${methodName}(&self) -> &${fieldType.toString()}`, () => {
                    writer.writeLine("match self {");

                    this.unionTypeDeclaration.types.forEach((unionType) => {
                        const variantName = unionType.discriminantValue.name.pascalCase.unsafeName;
                        writer.writeLine(`            Self::${variantName} { ${fieldName}, .. } => ${fieldName},`);
                    });

                    writer.writeLine("        }");
                });
                writer.newLine();
            });
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

    private hasFieldsOfType(predicate: (typeRef: TypeReference) => boolean): boolean {
        // Check base properties
        if (this.unionTypeDeclaration.baseProperties.some((prop) => predicate(prop.valueType))) {
            return true;
        }

        // Check variant properties
        return this.unionTypeDeclaration.types.some((unionType) => {
            return unionType.shape._visit({
                singleProperty: (singleProperty) => predicate(singleProperty.type),
                samePropertiesAsObject: () => false, // Would need to resolve the object type
                noProperties: () => false,
                _other: () => false
            });
        });
    }

    private getVariantTypesUsedInUnion(): { snakeCase: { unsafeName: string }; pascalCase: { unsafeName: string } }[] {
        const variantTypeNames: { snakeCase: { unsafeName: string }; pascalCase: { unsafeName: string } }[] = [];
        const visited = new Set<string>();

        this.unionTypeDeclaration.types.forEach((unionType) => {
            unionType.shape._visit({
                noProperties: () => {
                    // No additional types needed for empty variants
                },
                singleProperty: (singleProperty) => {
                    // Check if the single property type is a named type
                    if (singleProperty.type.type === "named") {
                        const typeName = singleProperty.type.name.originalName;
                        if (!visited.has(typeName)) {
                            visited.add(typeName);
                            variantTypeNames.push({
                                snakeCase: { unsafeName: singleProperty.type.name.snakeCase.unsafeName },
                                pascalCase: { unsafeName: singleProperty.type.name.pascalCase.unsafeName }
                            });
                        }
                    }
                },
                samePropertiesAsObject: (declaredTypeName) => {
                    // This variant references another object type
                    const typeName = declaredTypeName.name.originalName;
                    if (!visited.has(typeName)) {
                        visited.add(typeName);
                        variantTypeNames.push({
                            snakeCase: { unsafeName: declaredTypeName.name.snakeCase.unsafeName },
                            pascalCase: { unsafeName: declaredTypeName.name.pascalCase.unsafeName }
                        });
                    }
                },
                _other: () => {
                    // Unknown shape, skip
                }
            });
        });

        return variantTypeNames;
    }

    private escapeRustKeyword(name: string): string {
        const rustKeywords = new Set([
            "as", "break", "const", "continue", "crate", "else", "enum", "extern",
            "false", "fn", "for", "if", "impl", "in", "let", "loop", "match",
            "mod", "move", "mut", "pub", "ref", "return", "self", "Self", "static",
            "struct", "super", "trait", "true", "type", "unsafe", "use", "where", "while"
        ]);

        return rustKeywords.has(name) ? `r#${name}` : name;
    }
}
