import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, rust } from "@fern-api/rust-codegen";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import {
    getInnerTypeFromOptional,
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
} from "../utils/primitiveTypeUtils.js";
import { isFieldRecursive } from "../utils/recursiveTypeUtils.js";
import { canDeriveHashAndEq, canDerivePartialEq, generateFieldAttributes, hasHashMapFields, hasHashSetFields } from "../utils/structUtils.js";

export class UnionGenerator {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly unionTypeDeclaration: FernIr.UnionTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: FernIr.TypeDeclaration,
        unionTypeDeclaration: FernIr.UnionTypeDeclaration,
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
        const useUtc = this.context.getDateTimeType() === "utc";

        // TODO: @iamnamananand996 - use AST mechanism for all imports
        if (hasDateOnly && hasDateTimeOnly) {
            // Both date and datetime types present
            if (useUtc) {
                writer.writeLine("use chrono::{DateTime, NaiveDate, Utc};");
            } else {
                // Default: DateTime<FixedOffset>
                writer.writeLine("use chrono::{DateTime, FixedOffset, NaiveDate};");
            }
        } else if (hasDateOnly) {
            // Only date type present, import NaiveDate only
            writer.writeLine("use chrono::NaiveDate;");
        } else if (hasDateTimeOnly) {
            // Only datetime type present
            if (useUtc) {
                writer.writeLine("use chrono::{DateTime, Utc};");
            } else {
                // Default: DateTime<FixedOffset>
                writer.writeLine("use chrono::{DateTime, FixedOffset};");
            }
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

    private generateUnionVariant(writer: rust.Writer, unionType: FernIr.SingleUnionType): void {
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;
        const variantName = this.context.escapeRustReservedType(rawVariantName); // Escape reserved types with r#
        const discriminantValue = unionType.discriminantValue.wireValue;

        // Find the typeId for this union to detect recursive fields
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

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
                // Use empty struct variant {} instead of unit variant for forward compatibility
                // with #[non_exhaustive], fields can be added later without breaking changes
                writer.writeLine(`    ${variantName} {},`);
            },
            singleProperty: (singleProperty) => {
                // Check if this field creates a recursive reference
                const isRecursive = typeId ? isFieldRecursive(typeId, singleProperty.type, this.context.ir) : false;

                const fieldType = generateRustTypeForTypeReference(singleProperty.type, this.context, isRecursive);
                const fieldName = singleProperty.name.name.snakeCase.unsafeName;
                const wireValue = singleProperty.name.wireValue;
                const isOptional = isOptionalType(singleProperty.type);

                writer.writeLine(`    ${variantName} {`);

                // Add serde rename if field name differs from wire value
                if (fieldName !== wireValue) {
                    writer.writeLine(`        #[serde(rename = "${wireValue}")]`);
                }

                // Add flexible datetime serde attribute - both "offset" (default) and "utc" use flexible parsing
                // "offset" uses flexible_datetime::offset module (DateTime<FixedOffset>)
                // "utc" uses flexible_datetime::utc module (DateTime<Utc>)
                const dateTimeType = this.context.getDateTimeType();
                const typeRef = isOptional ? getInnerTypeFromOptional(singleProperty.type) : singleProperty.type;
                if (isDateTimeOnlyType(typeRef)) {
                    const modulePath = dateTimeType === "utc" 
                        ? "crate::core::flexible_datetime::utc" 
                        : "crate::core::flexible_datetime::offset";
                    if (isOptional) {
                        // For optional datetime fields with custom deserializer, we need serde(default)
                        // to handle missing fields in JSON (otherwise serde expects the field to be present)
                        writer.writeLine(`        #[serde(default)]`);
                        writer.writeLine(`        #[serde(with = "${modulePath}::option")]`);
                    } else {
                        writer.writeLine(`        #[serde(with = "${modulePath}")]`);
                    }
                }

                writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);

                // Add base properties if they exist
                this.generateBaseProperties(writer);

                writer.writeLine(`    },`);
            },
            samePropertiesAsObject: (declaredTypeName) => {
                // Check if this type can be inlined (only referenced by this variant)
                const canInline = this.context.inlinedUnionVariantTypeIds.has(declaredTypeName.typeId);

                if (canInline) {
                    // Inline the object's fields directly into the variant
                    const referencedType = this.context.ir.types[declaredTypeName.typeId];
                    if (referencedType?.shape.type === "object") {
                        const properties = referencedType.shape.properties;
                        if (properties.length === 0) {
                            // Empty type: generate empty struct variant
                            writer.writeLine(`    ${variantName} {},`);
                        } else {
                            // Inline fields directly into the variant
                            writer.writeLine(`    ${variantName} {`);
                            this.generateInlinedProperties(writer, properties, typeId);
                            // Add base properties if they exist
                            this.generateBaseProperties(writer);
                            writer.writeLine(`    },`);
                        }
                    } else {
                        // Fallback: shouldn't happen since we only inline object types
                        writer.writeLine(`    ${variantName} {},`);
                    }
                } else {
                    // Shared type: keep data wrapper with #[serde(flatten)]
                    // Check if this referenced type creates a recursive reference
                    const isDirectRecursion = typeId && declaredTypeName.typeId === typeId;
                    let isRecursive = isDirectRecursion;
                    if (!isRecursive && typeId) {
                        const referencedType = this.context.ir.types[declaredTypeName.typeId];
                        if (referencedType?.shape.type === "object") {
                            isRecursive = referencedType.shape.properties.some((prop) =>
                                isFieldRecursive(typeId, prop.valueType, this.context.ir)
                            );
                        }
                    }

                    const objectTypeName = this.context.getUniqueTypeNameForReference(declaredTypeName);
                    const fieldTypeName = isRecursive ? `Box<${objectTypeName}>` : objectTypeName;

                    writer.writeLine(`    ${variantName} {`);
                    writer.writeLine(`        #[serde(flatten)]`);
                    writer.writeLine(`        data: ${fieldTypeName},`);

                    // Add base properties if they exist
                    this.generateBaseProperties(writer);

                    writer.writeLine(`    },`);
                }
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

    private generateVariantAttributes(unionType: FernIr.SingleUnionType, escapedVariantName: string): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];
        const discriminantValue = unionType.discriminantValue.wireValue;
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;

        // Add serde rename if:
        // 1. The variant name was escaped (e.g., String -> r#String), OR
        // 2. The variant name differs from discriminant value (case-sensitive, since serde is case-sensitive)
        const wasEscaped = escapedVariantName !== rawVariantName;
        const namesDiffer = rawVariantName !== discriminantValue;

        if (wasEscaped || namesDiffer) {
            attributes.push(Attribute.serde.rename(discriminantValue));
        }

        // Add #[non_exhaustive] on all variants to ensure adding fields later is non-breaking
        attributes.push(Attribute.nonExhaustive());

        return attributes;
    }

    private generateInlinedProperties(
        writer: rust.Writer,
        properties: FernIr.ObjectProperty[],
        unionTypeId: string | undefined
    ): void {
        properties.forEach((property) => {
            const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);
            const isRecursive = unionTypeId ? isFieldRecursive(unionTypeId, property.valueType, this.context.ir) : false;
            const fieldType = generateRustTypeForTypeReference(property.valueType, this.context, isRecursive);

            // Generate field-level serde attributes (rename, skip_serializing_if, datetime, etc.)
            const fieldAttributes = generateFieldAttributes(property, this.context);
            fieldAttributes.forEach((attr) => {
                writer.write("        ");
                attr.write(writer);
                writer.newLine();
            });

            writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);
        });
    }

    private generateBaseProperties(writer: rust.Writer): void {
        // Find the typeId for this union to detect recursive fields
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        // Generate base properties that are common to all variants
        this.unionTypeDeclaration.baseProperties.forEach((property) => {
            const fieldName = property.name.name.snakeCase.unsafeName;

            // Check if this field creates a recursive reference
            const isRecursive = typeId ? isFieldRecursive(typeId, property.valueType, this.context.ir) : false;

            const fieldType = generateRustTypeForTypeReference(property.valueType, this.context, isRecursive);
            const wireValue = property.name.wireValue;
            const isOptional = isOptionalType(property.valueType);

            if (fieldName !== wireValue) {
                writer.writeLine(`        #[serde(rename = "${wireValue}")]`);
            }

            if (isOptional) {
                writer.writeLine(`        #[serde(skip_serializing_if = "Option::is_none")]`);
            }

            // Add flexible datetime serde attribute - both "offset" (default) and "utc" use flexible parsing
            // "offset" uses flexible_datetime::offset module (DateTime<FixedOffset>)
            // "utc" uses flexible_datetime::utc module (DateTime<Utc>)
            const dateTimeType = this.context.getDateTimeType();
            const typeRef = isOptional ? getInnerTypeFromOptional(property.valueType) : property.valueType;
            if (isDateTimeOnlyType(typeRef)) {
                const modulePath = dateTimeType === "utc" 
                    ? "crate::core::flexible_datetime::utc" 
                    : "crate::core::flexible_datetime::offset";
                if (isOptional) {
                    // For optional datetime fields with custom deserializer, we need serde(default)
                    // to handle missing fields in JSON (otherwise serde expects the field to be present)
                    writer.writeLine(`        #[serde(default)]`);
                    writer.writeLine(`        #[serde(with = "${modulePath}::option")]`);
                } else {
                    writer.writeLine(`        #[serde(with = "${modulePath}")]`);
                }
            }

            writer.writeLine(`        ${fieldName}: ${fieldType.toString()},`);
        });
    }

    private generateImplementationBlock(writer: rust.Writer, typeName: string): void {
        writer.newLine();
        writer.writeBlock(`impl ${typeName}`, () => {
            // Generate constructor methods for all variants
            // Since #[non_exhaustive] prevents direct construction from outside the crate,
            // these constructors provide the way to create variant instances.
            let needsNewline = false;
            this.unionTypeDeclaration.types.forEach((unionType, index) => {
                if (index > 0) {
                    writer.newLine();
                }
                this.generateVariantConstructor(writer, unionType);
                needsNewline = true;
            });

            // Generate convenience constructors for inlined variants with optional fields.
            // For each optional field in an inlined variant, generate a `{variant}_with_{field}`
            // constructor that takes the field as a required parameter (unwrapped from Option)
            // alongside any required fields, defaulting all other optional fields to None.
            this.unionTypeDeclaration.types.forEach((unionType) => {
                const convenienceConstructors = this.getConvenienceConstructorsForVariant(unionType);
                convenienceConstructors.forEach((gen) => {
                    if (needsNewline) {
                        writer.newLine();
                    }
                    gen(writer);
                    needsNewline = true;
                });
            });

            // Generate getter methods for base properties
            if (this.unionTypeDeclaration.baseProperties.length > 0) {
                this.unionTypeDeclaration.baseProperties.forEach((property) => {
                    writer.newLine();
                    const fieldName = property.name.name.snakeCase.unsafeName;
                    const fieldType = generateRustTypeForTypeReference(property.valueType, this.context);
                    const methodName = `get_${fieldName}`;

                    // Use &str instead of &String for idiomatic Rust (more flexible, accepts both &String and literals)
                    const returnType = fieldType.toString() === "String" ? "&str" : `&${fieldType.toString()}`;

                    writer.writeBlock(`pub fn ${methodName}(&self) -> ${returnType}`, () => {
                        writer.writeLine("match self {");

                        this.unionTypeDeclaration.types.forEach((unionType) => {
                            const variantName = unionType.discriminantValue.name.pascalCase.unsafeName;
                            writer.writeLine(`            Self::${variantName} { ${fieldName}, .. } => ${fieldName},`);
                        });

                        writer.writeLine("        }");
                    });
                });
            }
        });
    }

    private generateVariantConstructor(writer: rust.Writer, unionType: FernIr.SingleUnionType): void {
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;
        const variantName = this.context.escapeRustReservedType(rawVariantName);
        const constructorName = unionType.discriminantValue.name.snakeCase.unsafeName;
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        unionType.shape._visit({
            noProperties: () => {
                // Empty constructor: pub fn variant_name() -> Self { Self::VariantName {} }
                writer.writeBlock(`pub fn ${constructorName}() -> Self`, () => {
                    writer.writeLine(`Self::${variantName} {}`);
                });
            },
            singleProperty: (singleProperty) => {
                const isRecursive = typeId ? isFieldRecursive(typeId, singleProperty.type, this.context.ir) : false;
                const fieldType = generateRustTypeForTypeReference(singleProperty.type, this.context, isRecursive);
                const fieldName = singleProperty.name.name.snakeCase.unsafeName;
                const isOptional = isOptionalType(singleProperty.type);

                const fieldTypeStr = isOptional
                    ? `Option<${generateRustTypeForTypeReference(getInnerTypeFromOptional(singleProperty.type), this.context, isRecursive).toString()}>`
                    : fieldType.toString();

                // Constructor takes all fields as parameters
                const baseParams = this.getBasePropertyParams();
                const allParams = [`${fieldName}: ${fieldTypeStr}`, ...baseParams];
                writer.writeBlock(`pub fn ${constructorName}(${allParams.join(", ")}) -> Self`, () => {
                    const baseFields = this.getBasePropertyFieldAssignments();
                    const allFields = [fieldName, ...baseFields];
                    writer.writeLine(`Self::${variantName} { ${allFields.join(", ")} }`);
                });
            },
            samePropertiesAsObject: (declaredTypeName) => {
                const canInline = this.context.inlinedUnionVariantTypeIds.has(declaredTypeName.typeId);

                if (canInline) {
                    const referencedType = this.context.ir.types[declaredTypeName.typeId];
                    if (referencedType?.shape.type === "object") {
                        const properties = referencedType.shape.properties;
                        if (properties.length === 0) {
                            // Empty inlined type: no parameters needed
                            const baseParams = this.getBasePropertyParams();
                            if (baseParams.length > 0) {
                                writer.writeBlock(`pub fn ${constructorName}(${baseParams.join(", ")}) -> Self`, () => {
                                    const baseFields = this.getBasePropertyFieldAssignments();
                                    writer.writeLine(`Self::${variantName} { ${baseFields.join(", ")} }`);
                                });
                            } else {
                                writer.writeBlock(`pub fn ${constructorName}() -> Self`, () => {
                                    writer.writeLine(`Self::${variantName} {}`);
                                });
                            }
                        } else {
                            // Constructor takes required fields as parameters, optional fields default to None
                            const requiredParams: string[] = [];
                            const fieldAssignments: string[] = [];

                            properties.forEach((property) => {
                                const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);
                                const isRecursive = typeId ? isFieldRecursive(typeId, property.valueType, this.context.ir) : false;
                                const isOptional = isOptionalType(property.valueType);

                                if (isOptional) {
                                    // Optional fields default to None
                                    fieldAssignments.push(`${fieldName}: None`);
                                } else {
                                    const fieldType = generateRustTypeForTypeReference(property.valueType, this.context, isRecursive);
                                    requiredParams.push(`${fieldName}: ${fieldType.toString()}`);
                                    fieldAssignments.push(fieldName);
                                }
                            });

                            const baseParams = this.getBasePropertyParams();
                            const allParams = [...requiredParams, ...baseParams];
                            const baseFields = this.getBasePropertyFieldAssignments();
                            const allFields = [...fieldAssignments, ...baseFields];

                            writer.writeBlock(`pub fn ${constructorName}(${allParams.join(", ")}) -> Self`, () => {
                                writer.writeLine(`Self::${variantName} { ${allFields.join(", ")} }`);
                            });
                        }
                    } else {
                        writer.writeBlock(`pub fn ${constructorName}() -> Self`, () => {
                            writer.writeLine(`Self::${variantName} {}`);
                        });
                    }
                } else {
                    // Shared type: constructor takes the data wrapper
                    const isDirectRecursion = typeId && declaredTypeName.typeId === typeId;
                    let isRecursive = isDirectRecursion;
                    if (!isRecursive && typeId) {
                        const referencedType = this.context.ir.types[declaredTypeName.typeId];
                        if (referencedType?.shape.type === "object") {
                            isRecursive = referencedType.shape.properties.some((prop) =>
                                isFieldRecursive(typeId, prop.valueType, this.context.ir)
                            );
                        }
                    }

                    const objectTypeName = this.context.getUniqueTypeNameForReference(declaredTypeName);
                    const fieldTypeName = isRecursive ? `Box<${objectTypeName}>` : objectTypeName;

                    const baseParams = this.getBasePropertyParams();
                    const allParams = [`data: ${fieldTypeName}`, ...baseParams];
                    const baseFields = this.getBasePropertyFieldAssignments();
                    const allFields = ["data", ...baseFields];

                    writer.writeBlock(`pub fn ${constructorName}(${allParams.join(", ")}) -> Self`, () => {
                        writer.writeLine(`Self::${variantName} { ${allFields.join(", ")} }`);
                    });
                }
            },
            _other: () => {
                // Fallback constructor for unknown variant shapes
                const baseParams = this.getBasePropertyParams();
                const allParams = ["data: serde_json::Value", ...baseParams];
                const baseFields = this.getBasePropertyFieldAssignments();
                const allFields = ["data", ...baseFields];

                writer.writeBlock(`pub fn ${constructorName}(${allParams.join(", ")}) -> Self`, () => {
                    writer.writeLine(`Self::${variantName} { ${allFields.join(", ")} }`);
                });
            }
        });
    }

    /**
     * For inlined union variants with optional fields, generates convenience constructors
     * like `{variant}_with_{field}` that accept the optional field as a required parameter
     * (unwrapped from Option<T> to T), alongside any required fields AND all other optional
     * fields as Option<T> parameters. This gives callers maximum flexibility while making
     * the promoted field required.
     *
     * For example, for an Assistant variant with optional fields `content`, `name`,
     * `reasoning_content`, and `tool_calls`, this generates:
     *   - `assistant_with_content(content: Content, name: Option<String>, ...) -> Self`
     *   - `assistant_with_tool_calls(content: Option<Content>, ..., tool_calls: Vec<ToolCall>) -> Self`
     *   - etc.
     */
    private getConvenienceConstructorsForVariant(
        unionType: FernIr.SingleUnionType
    ): ((writer: rust.Writer) => void)[] {
        const constructors: ((writer: rust.Writer) => void)[] = [];
        const rawVariantName = unionType.discriminantValue.name.pascalCase.unsafeName;
        const variantName = this.context.escapeRustReservedType(rawVariantName);
        const constructorBaseName = unionType.discriminantValue.name.snakeCase.unsafeName;
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        unionType.shape._visit({
            noProperties: () => {},
            singleProperty: () => {},
            samePropertiesAsObject: (declaredTypeName) => {
                const canInline = this.context.inlinedUnionVariantTypeIds.has(declaredTypeName.typeId);
                if (!canInline) {
                    return;
                }

                const referencedType = this.context.ir.types[declaredTypeName.typeId];
                if (referencedType?.shape.type !== "object") {
                    return;
                }

                const properties = referencedType.shape.properties;
                const optionalProperties = properties.filter((p) => isOptionalType(p.valueType));

                // Only generate convenience constructors if there are optional fields
                if (optionalProperties.length === 0) {
                    return;
                }

                for (const optionalProperty of optionalProperties) {
                    const optFieldName = this.context.escapeRustKeyword(optionalProperty.name.name.snakeCase.unsafeName);
                    // Use the raw (unescaped) field name in the method name since r# prefixes
                    // are not valid in function names
                    const optFieldNameRaw = optionalProperty.name.name.snakeCase.unsafeName;
                    const methodName = `${constructorBaseName}_with_${optFieldNameRaw}`;

                    constructors.push((writer: rust.Writer) => {
                        // Build params: required fields + promoted optional field (unwrapped) +
                        // other optional fields as Option<T>
                        const params: string[] = [];
                        const fieldAssignments: string[] = [];

                        properties.forEach((property) => {
                            const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);
                            const isRecursive = typeId ? isFieldRecursive(typeId, property.valueType, this.context.ir) : false;
                            const isOptional = isOptionalType(property.valueType);

                            if (property === optionalProperty) {
                                // This is the target optional field: unwrap it from Option<T> to T.
                                // We must strip ALL optional/nullable layers because the IR may have
                                // nested wrappers (e.g. optional<nullable<string>> from OpenAPI) that
                                // the AST deduplicates into a single Option<T> at the field level.
                                let bareTypeRef = property.valueType;
                                while (isOptionalType(bareTypeRef)) {
                                    bareTypeRef = getInnerTypeFromOptional(bareTypeRef);
                                }
                                const innerType = generateRustTypeForTypeReference(
                                    bareTypeRef,
                                    this.context,
                                    isRecursive
                                );
                                params.push(`${fieldName}: ${innerType.toString()}`);
                                fieldAssignments.push(`${fieldName}: Some(${fieldName})`);
                            } else if (isOptional) {
                                // Other optional fields are passed as Option<T> parameters
                                const fieldType = generateRustTypeForTypeReference(property.valueType, this.context, isRecursive);
                                params.push(`${fieldName}: ${fieldType.toString()}`);
                                fieldAssignments.push(fieldName);
                            } else {
                                // Required fields are passed as parameters
                                const fieldType = generateRustTypeForTypeReference(property.valueType, this.context, isRecursive);
                                params.push(`${fieldName}: ${fieldType.toString()}`);
                                fieldAssignments.push(fieldName);
                            }
                        });

                        const baseParams = this.getBasePropertyParams();
                        const allParams = [...params, ...baseParams];
                        const baseFields = this.getBasePropertyFieldAssignments();
                        const allFields = [...fieldAssignments, ...baseFields];

                        writer.writeBlock(`pub fn ${methodName}(${allParams.join(", ")}) -> Self`, () => {
                            writer.writeLine(`Self::${variantName} { ${allFields.join(", ")} }`);
                        });
                    });
                }
            },
            _other: () => {}
        });

        return constructors;
    }

    private getBasePropertyParams(): string[] {
        return this.unionTypeDeclaration.baseProperties.map((property) => {
            const fieldName = property.name.name.snakeCase.unsafeName;
            const fieldType = generateRustTypeForTypeReference(property.valueType, this.context);
            const isOptional = isOptionalType(property.valueType);
            const fieldTypeStr = isOptional
                ? `Option<${generateRustTypeForTypeReference(getInnerTypeFromOptional(property.valueType), this.context).toString()}>`
                : fieldType.toString();
            return `${fieldName}: ${fieldTypeStr}`;
        });
    }

    private getBasePropertyFieldAssignments(): string[] {
        return this.unionTypeDeclaration.baseProperties.map((property) => {
            return property.name.name.snakeCase.unsafeName;
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

    private hasFieldsOfType(predicate: (typeRef: FernIr.TypeReference) => boolean): boolean {
        // Check base properties
        if (this.unionTypeDeclaration.baseProperties.some((prop) => predicate(prop.valueType))) {
            return true;
        }

        // Check variant properties
        return this.unionTypeDeclaration.types.some((unionType) => {
            return unionType.shape._visit({
                singleProperty: (singleProperty) => predicate(singleProperty.type),
                samePropertiesAsObject: (declaredTypeName) => {
                    // For inlined types, check the object's properties directly
                    if (this.context.inlinedUnionVariantTypeIds.has(declaredTypeName.typeId)) {
                        const referencedType = this.context.ir.types[declaredTypeName.typeId];
                        if (referencedType?.shape.type === "object") {
                            return referencedType.shape.properties.some((prop) => predicate(prop.valueType));
                        }
                    }
                    return false;
                },
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
                    // For inlined types, collect the named types from the inlined properties
                    // instead of the wrapper type (which no longer exists as a separate struct)
                    if (this.context.inlinedUnionVariantTypeIds.has(declaredTypeName.typeId)) {
                        const referencedType = this.context.ir.types[declaredTypeName.typeId];
                        if (referencedType?.shape.type === "object") {
                            for (const prop of referencedType.shape.properties) {
                                this.collectNamedTypesFromTypeRef(prop.valueType, variantTypeNames, visited);
                            }
                        }
                        return;
                    }

                    // Non-inlined: import the wrapper type as before
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

    private collectNamedTypesFromTypeRef(
        typeRef: FernIr.TypeReference,
        result: { snakeCase: { unsafeName: string }; pascalCase: { unsafeName: string } }[],
        visited: Set<string>
    ): void {
        if (typeRef.type === "named") {
            const typeName = typeRef.name.originalName;
            if (!visited.has(typeName)) {
                visited.add(typeName);
                result.push({
                    snakeCase: { unsafeName: typeRef.name.snakeCase.unsafeName },
                    pascalCase: { unsafeName: typeRef.name.pascalCase.unsafeName }
                });
            }
        } else if (typeRef.type === "container") {
            typeRef.container._visit({
                optional: (inner) => this.collectNamedTypesFromTypeRef(inner, result, visited),
                nullable: (inner) => this.collectNamedTypesFromTypeRef(inner, result, visited),
                list: (inner) => this.collectNamedTypesFromTypeRef(inner, result, visited),
                set: (inner) => this.collectNamedTypesFromTypeRef(inner, result, visited),
                map: (mapType) => {
                    this.collectNamedTypesFromTypeRef(mapType.keyType, result, visited);
                    this.collectNamedTypesFromTypeRef(mapType.valueType, result, visited);
                },
                literal: () => {},
                _other: () => {}
            });
        }
    }
}
