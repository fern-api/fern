import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import {
    extractNamedTypesFromTypeReference,
    getInnerTypeFromOptional,
    isCollectionType,
    isDateTimeType,
    isFloatingPointType,
    isOptionalType,
    isUnknownType,
    isUuidType,
    namedTypeSupportsHashAndEq,
    typeSupportsHashAndEq
} from "../utils/primitiveTypeUtils";

export class StructGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly objectTypeDeclaration: ObjectTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        objectTypeDeclaration: ObjectTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.objectTypeDeclaration = objectTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const rustStruct = this.generateStructForTypeDeclaration();
        const fileContents = this.generateFileContents(rustStruct);
        return new RustFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private getFilename(): string {
        return this.context.getUniqueFilenameForType(this.typeDeclaration);
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of("src");
    }

    private generateFileContents(rustStruct: rust.Struct): string {
        const writer = rust.writer();

        // Add use statements
        this.writeUseStatements(writer);
        writer.newLine();

        // Write the struct
        rustStruct.write(writer);

        return writer.toString();
    }

    private writeUseStatements(writer: rust.Writer): void {
        // Add imports for custom named types referenced in fields FIRST
        const customTypes = this.getCustomTypesUsedInFields();
        customTypes.forEach((typeName) => {
            const modulePath = this.context.getModulePathForType(typeName.snakeCase.unsafeName);
            const moduleNameEscaped = this.context.escapeRustKeyword(modulePath);
            writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
        });

        // Add imports for parent types
        if (this.objectTypeDeclaration.extends.length > 0) {
            this.objectTypeDeclaration.extends.forEach((parentType) => {
                const parentTypeName = parentType.name.pascalCase.unsafeName;
                const modulePath = this.context.getModulePathForType(parentType.name.snakeCase.unsafeName);
                const moduleNameEscaped = this.context.escapeRustKeyword(modulePath);
                writer.writeLine(`use crate::${moduleNameEscaped}::${parentTypeName};`);
            });
        }

        // Add chrono if we have datetime fields
        if (this.hasDateTimeFields()) {
            writer.writeLine("use chrono::{DateTime, NaiveDate, Utc};");
        }

        // Add std::collections if we have maps or sets
        if (this.hasCollectionFields()) {
            writer.writeLine("use std::collections::HashMap;");
        }

        // Add ordered_float if we have floating-point sets
        if (this.hasFloatingPointSets()) {
            writer.writeLine("use ordered_float::OrderedFloat;");
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

    private generateStructForTypeDeclaration(): rust.Struct {
        const fields: rust.Field[] = [];

        // Add inheritance fields first (with serde flatten)
        fields.push(...this.generateInheritanceFields());

        // Add regular properties
        fields.push(
            ...this.objectTypeDeclaration.properties.map((property) => this.generateRustFieldForProperty(property))
        );

        return rust.struct({
            name: this.typeDeclaration.name.name.pascalCase.unsafeName,
            visibility: PUBLIC,
            attributes: this.generateStructAttributes(),
            fields
        });
    }

    private generateStructAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Build derives conditionally based on actual needs
        const derives: string[] = ["Debug", "Clone", "Serialize", "Deserialize"];

        // PartialEq - for equality comparisons
        if (this.needsPartialEq()) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all field types support them
        if (this.canDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        return attributes;
    }

    private generateRustFieldForProperty(property: ObjectProperty): rust.Field {
        const fieldType = this.getFieldType(property);
        const fieldAttributes = this.generateFieldAttributes(property);
        const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);

        return rust.field({
            name: fieldName,
            type: fieldType,
            visibility: PUBLIC,
            attributes: fieldAttributes
        });
    }

    private generateInheritanceFields(): rust.Field[] {
        const fields: rust.Field[] = [];

        // Generate fields for inherited types using serde flatten
        this.objectTypeDeclaration.extends.forEach((parentType) => {
            const parentTypeName = parentType.name.pascalCase.unsafeName;

            fields.push(
                rust.field({
                    name: `${parentType.name.snakeCase.unsafeName}_fields`,
                    type: rust.Type.reference(rust.reference({ name: parentTypeName })),
                    visibility: PUBLIC,
                    attributes: [Attribute.serde.flatten()]
                })
            );
        });

        return fields;
    }

    private getFieldType(property: ObjectProperty): rust.Type {
        if (isOptionalType(property.valueType)) {
            // For optional types, generate Option<T> where T is the inner type
            const innerType = getInnerTypeFromOptional(property.valueType);
            return rust.Type.option(generateRustTypeForTypeReference(innerType));
        } else {
            return generateRustTypeForTypeReference(property.valueType);
        }
    }

    private generateFieldAttributes(property: ObjectProperty): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Add serde rename if the field name differs from wire name
        if (property.name.name.snakeCase.unsafeName !== property.name.wireValue) {
            attributes.push(Attribute.serde.rename(property.name.wireValue));
        }

        // DateTime fields will use default RFC 3339 string serialization
        // No special serde handling needed for datetime fields

        // Add skip_serializing_if for optional fields to omit null values
        const isOptional = isOptionalType(property.valueType);
        if (isOptional) {
            attributes.push(Attribute.serde.skipSerializingIf('"Option::is_none"'));
        }

        return attributes;
    }

    private isDateTimeProperty(property: ObjectProperty): boolean {
        const typeRef = isOptionalType(property.valueType)
            ? getInnerTypeFromOptional(property.valueType)
            : property.valueType;

        return isDateTimeType(typeRef);
    }

    private hasDateTimeFields(): boolean {
        return this.objectTypeDeclaration.properties.some((prop) => this.isDateTimeProperty(prop));
    }

    private hasCollectionFields(): boolean {
        return this.objectTypeDeclaration.properties.some((prop) => {
            const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;

            return isCollectionType(typeRef);
        });
    }

    private hasUuidFields(): boolean {
        return this.objectTypeDeclaration.properties.some((prop) => {
            const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;

            return isUuidType(typeRef);
        });
    }

    private hasJsonValueFields(): boolean {
        return this.objectTypeDeclaration.properties.some((prop) => {
            const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;

            return isUnknownType(typeRef);
        });
    }

    private hasFloatingPointSets(): boolean {
        return this.objectTypeDeclaration.properties.some((prop) => {
            const typeRef = isOptionalType(prop.valueType) ? getInnerTypeFromOptional(prop.valueType) : prop.valueType;

            // Check if this is a set of floating point numbers
            if (typeRef.type === "container" && typeRef.container.type === "set") {
                const setElementType = typeRef.container.set;
                return isFloatingPointType(setElementType);
            }
            return false;
        });
    }

    private getCustomTypesUsedInFields(): {
        snakeCase: { unsafeName: string };
        pascalCase: { unsafeName: string };
    }[] {
        const customTypeNames: {
            snakeCase: { unsafeName: string };
            pascalCase: { unsafeName: string };
        }[] = [];
        const visited = new Set<string>();

        this.objectTypeDeclaration.properties.forEach((property) => {
            extractNamedTypesFromTypeReference(property.valueType, customTypeNames, visited);
        });

        // Filter out the current type itself to prevent self-imports
        const currentTypeName = this.typeDeclaration.name.name.pascalCase.unsafeName;
        return customTypeNames.filter((typeName) => typeName.pascalCase.unsafeName !== currentTypeName);
    }

    private needsPartialEq(): boolean {
        // PartialEq is useful for testing and comparisons
        // Include it unless there are fields that can't support it
        let isTypeSupportsHashAndEq = this.objectTypeDeclaration.properties.every((property) => {
            return typeSupportsHashAndEq(property.valueType, this.context);
        });

        let isNamedTypeSupportsHashAndEq = this.objectTypeDeclaration.extends.every((parentType) => {
            return namedTypeSupportsHashAndEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: parentType.name.originalName
                },
                this.context
            );
        });
        return isTypeSupportsHashAndEq && isNamedTypeSupportsHashAndEq;
    }

    private canDeriveHashAndEq(): boolean {
        // Check if all field types can support Hash and Eq derives
        let isTypeSupportsHashAndEq = this.objectTypeDeclaration.properties.every((property) => {
            return typeSupportsHashAndEq(property.valueType, this.context);
        });
        let isNamedTypeSupportsHashAndEq = this.objectTypeDeclaration.extends.every((parentType) => {
            return namedTypeSupportsHashAndEq(
                {
                    name: parentType.name,
                    typeId: parentType.typeId,
                    default: undefined,
                    inline: undefined,
                    fernFilepath: parentType.fernFilepath,
                    displayName: parentType.name.originalName
                },
                this.context
            );
        });
        return isTypeSupportsHashAndEq && isNamedTypeSupportsHashAndEq;
    }
}
