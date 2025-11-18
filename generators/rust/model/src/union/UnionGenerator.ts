import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";
import { SingleUnionType, TypeDeclaration, TypeReference, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import {
    isCollectionType,
    isDateTimeOnlyType,
    isDateTimeType,
    isDateType,
    isOptionalType,
    isUnknownType,
    isUuidType,
    namedTypeSupportsHashAndEq,
    namedTypeSupportsPartialEq,
    typeSupportsHashAndEq,
    typeSupportsPartialEq
} from "../utils/primitiveTypeUtils";
import { canDeriveHashAndEq, canDerivePartialEq, hasHashMapFields, hasHashSetFields } from "../utils/structUtils";

export class UnionGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly unionTypeDeclaration: UnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        unionTypeDeclaration: UnionTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.unionTypeDeclaration = unionTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const typeName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);
        const filename = this.context.getUniqueFilenameForType(this.typeDeclaration);

        const writer = new rust.Writer();

        // Write use statements
        writer.writeLine("pub use crate::prelude::*;");
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
            const modulePath = this.context.getModulePathForType(typeName.snakeCase.unsafeName);
            const moduleNameEscaped = this.context.escapeRustKeyword(modulePath);
            writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
        });

        // Add chrono imports based on specific types needed
        const hasDateOnly = this.hasDateFields();
        const hasDateTimeOnly = this.hasDateTimeOnlyFields();

        // TODO: @iamnamananand996 - use AST mechanism for all imports
        if (hasDateOnly && hasDateTimeOnly) {
            // Both date and datetime types present
            writer.writeLine("use chrono::{DateTime, NaiveDate, Utc};");
        } else if (hasDateOnly) {
            // Only date type present, import NaiveDate only
            writer.writeLine("use chrono::NaiveDate;");
        } else if (hasDateTimeOnly) {
            // Only datetime type present, import DateTime and Utc only
            writer.writeLine("use chrono::{DateTime, Utc};");
        }

        // Add std::collections imports based on specific collection types used
        const needsHashMap = hasHashMapFields(this.unionTypeDeclaration.baseProperties);
        const needsHashSet = hasHashSetFields(this.unionTypeDeclaration.baseProperties);

        if (needsHashMap && needsHashSet) {
            writer.writeLine("use std::collections::{HashMap, HashSet};");
        } else if (needsHashMap) {
            writer.writeLine("use std::collections::HashMap;");
        } else if (needsHashSet) {
            writer.writeLine("use std::collections::HashSet;");
        }

        // TODO: @iamnamananand996 build to use serde_json::Value ---> Value directly
        // if (hasJsonValueFields(properties)) {
        //     writer.writeLine("use serde_json::Value;");
        // }

        // Add uuid if we have UUID fields
        if (this.hasUuidFields()) {
            writer.writeLine("use uuid::Uuid;");
        }

        // Add serde imports LAST
        writer.writeLine("use serde::{Deserialize, Serialize};");
    }

    private generateUnionEnum(writer: rust.Writer): void {
        const typeName = this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration);
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

        // Build derives conditionally based on actual needs
        const derives: string[] = ["Debug", "Clone", "Serialize", "Deserialize"];

        // PartialEq - for equality comparisons
        if (this.needsPartialEq()) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all variant types support them
        if (this.needsDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        // Serde tag attribute for discriminated union
        const discriminantField = this.unionTypeDeclaration.discriminant.wireValue;
        attributes.push(Attribute.serde.tag(discriminantField));

        return attributes;
    }

    private needsPartialEq(): boolean {
        // PartialEq is useful for testing and comparisons
        // Include it only if all variant types and base properties can support it

        const isTypeSupportsPartialEq = canDerivePartialEq(this.unionTypeDeclaration.baseProperties, this.context);

        // Check variant properties
        const isNamedTypeSupportsPartialEq = this.unionTypeDeclaration.types.every((unionType) => {
            return unionType.shape._visit({
                noProperties: () => true, // Unit variants always support PartialEq
                samePropertiesAsObject: (declaredTypeName) =>
                    namedTypeSupportsPartialEq(
                        {
                            name: declaredTypeName.name,
                            typeId: declaredTypeName.typeId,
                            default: undefined,
                            inline: undefined,
                            fernFilepath: declaredTypeName.fernFilepath,
                            displayName: declaredTypeName.name.originalName
                        },
                        this.context
                    ),
                singleProperty: (property) => typeSupportsPartialEq(property.type, this.context),
                _other: () => true // serde_json::Value does support PartialEq
            });
        });

        return isTypeSupportsPartialEq && isNamedTypeSupportsPartialEq;
    }

    private needsDeriveHashAndEq(): boolean {
        // Check if all variant types and base properties can support Hash and Eq derives

        const isTypeSupportsHashAndEq = canDeriveHashAndEq(this.unionTypeDeclaration.baseProperties, this.context);
        // Check variant properties
        const isNamedTypeSupportsHashAndEq = this.unionTypeDeclaration.types.every((unionType) => {
            return unionType.shape._visit({
                noProperties: () => true, // Unit variants always support Hash and Eq
                samePropertiesAsObject: (declaredTypeName) =>
                    namedTypeSupportsHashAndEq(
                        {
                            name: declaredTypeName.name,
                            typeId: declaredTypeName.typeId,
                            default: undefined,
                            inline: undefined,
                            fernFilepath: declaredTypeName.fernFilepath,
                            displayName: declaredTypeName.name.originalName
                        },
                        this.context
                    ),
                singleProperty: (property) => typeSupportsHashAndEq(property.type, this.context),
                _other: () => false // serde_json::Value doesn't support Hash or Eq
            });
        });

        return isNamedTypeSupportsHashAndEq && isTypeSupportsHashAndEq;
    }

    private generateUnionVariant(writer: rust.Writer, unionType: SingleUnionType): void {
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;
        const variantName = this.context.escapeRustReservedType(rawVariantName); // Escape reserved types with r#
        const discriminantValue = unionType.discriminantValue.wireValue;

        // Generate variant attributes
        const variantAttributes = this.generateVariantAttributes(unionType, variantName);
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
                const fieldType = generateRustTypeForTypeReference(singleProperty.type, this.context);
                const fieldName = singleProperty.name.name.snakeCase.unsafeName;
                const wireValue = singleProperty.name.wireValue;

                writer.writeLine(`    ${variantName} {`);

                // Add serde rename if field name differs from wire value
                if (fieldName !== wireValue) {
                    writer.writeLine(`        #[serde(rename = "${wireValue}")]`);
                }

                writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);

                // Add base properties if they exist
                this.generateBaseProperties(writer);

                writer.writeLine(`    },`);
            },
            samePropertiesAsObject: (declaredTypeName) => {
                const objectTypeName = this.context.getUniqueTypeNameForReference(declaredTypeName);

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

    private generateVariantAttributes(unionType: SingleUnionType, escapedVariantName: string): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];
        const discriminantValue = unionType.discriminantValue.wireValue;
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;

        // Add serde rename if:
        // 1. The variant name was escaped (e.g., String -> r#String), OR
        // 2. The variant name differs from discriminant value (case-insensitive)
        const wasEscaped = escapedVariantName !== rawVariantName;
        const namesDiffer = rawVariantName.toLowerCase() !== discriminantValue.toLowerCase();

        if (wasEscaped || namesDiffer) {
            attributes.push(Attribute.serde.rename(discriminantValue));
        }

        return attributes;
    }

    private generateBaseProperties(writer: rust.Writer): void {
        // Generate base properties that are common to all variants
        this.unionTypeDeclaration.baseProperties.forEach((property) => {
            const fieldName = property.name.name.snakeCase.unsafeName;
            const fieldType = generateRustTypeForTypeReference(property.valueType, this.context);
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
                const fieldType = generateRustTypeForTypeReference(property.valueType, this.context);
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

    private hasDateFields(): boolean {
        return this.hasFieldsOfType(isDateType);
    }

    private hasDateTimeOnlyFields(): boolean {
        return this.hasFieldsOfType(isDateTimeOnlyType);
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

    private getVariantTypesUsedInUnion(): {
        snakeCase: { unsafeName: string };
        pascalCase: { unsafeName: string };
    }[] {
        const variantTypeNames: {
            snakeCase: { unsafeName: string };
            pascalCase: { unsafeName: string };
        }[] = [];
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
                                snakeCase: {
                                    unsafeName: singleProperty.type.name.snakeCase.unsafeName
                                },
                                pascalCase: {
                                    unsafeName: singleProperty.type.name.pascalCase.unsafeName
                                }
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
                            snakeCase: {
                                unsafeName: declaredTypeName.name.snakeCase.unsafeName
                            },
                            pascalCase: {
                                unsafeName: declaredTypeName.name.pascalCase.unsafeName
                            }
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
}
