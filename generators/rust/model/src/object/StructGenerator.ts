import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, Attribute, PUBLIC } from "@fern-api/rust-codegen";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference";
import {
    isDateTimeType,
    isUuidType,
    isCollectionType,
    isUnknownType,
    isOptionalType,
    getInnerTypeFromOptional
} from "../utils/primitiveTypeUtils";

export class StructGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly objectTypeDeclaration: ObjectTypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration, objectTypeDeclaration: ObjectTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.objectTypeDeclaration = objectTypeDeclaration;
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
        return this.typeDeclaration.name.name.snakeCase.unsafeName + ".rs";
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
            const moduleNameEscaped = this.escapeRustKeyword(typeName.snakeCase.unsafeName);
            writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
        });

        // Add imports for parent types
        if (this.objectTypeDeclaration.extends.length > 0) {
            this.objectTypeDeclaration.extends.forEach((parentType) => {
                const parentTypeName = parentType.name.pascalCase.unsafeName;
                const moduleNameEscaped = this.escapeRustKeyword(parentType.name.snakeCase.unsafeName);
                writer.writeLine(`use crate::${moduleNameEscaped}::${parentTypeName};`);
            });
        }

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

        // Always add basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];
        attributes.push(Attribute.derive(derives));

        return attributes;
    }

    private generateRustFieldForProperty(property: ObjectProperty): rust.Field {
        const fieldType = this.getFieldType(property);
        const fieldAttributes = this.generateFieldAttributes(property);
        const fieldName = this.escapeRustKeyword(property.name.name.snakeCase.unsafeName);

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

        // Add special serde handling for datetime fields
        if (this.isDateTimeProperty(property)) {
            attributes.push(Attribute.serde.with("chrono::serde::ts_seconds"));
        }

        // Add skip_serializing_if for optional fields to omit null values
        if (isOptionalType(property.valueType)) {
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

    private getCustomTypesUsedInFields(): { snakeCase: { unsafeName: string }; pascalCase: { unsafeName: string } }[] {
        const customTypeNames: { snakeCase: { unsafeName: string }; pascalCase: { unsafeName: string } }[] = [];
        const visited = new Set<string>();

        const extractNamedTypesRecursively = (typeRef: TypeReference) => {
            if (typeRef.type === "named") {
                const typeName = typeRef.name.originalName;
                if (!visited.has(typeName)) {
                    visited.add(typeName);
                    customTypeNames.push({
                        snakeCase: { unsafeName: typeRef.name.snakeCase.unsafeName },
                        pascalCase: { unsafeName: typeRef.name.pascalCase.unsafeName }
                    });
                }
            } else if (typeRef.type === "container") {
                typeRef.container._visit({
                    list: (listType) => extractNamedTypesRecursively(listType),
                    set: (setType) => extractNamedTypesRecursively(setType),
                    optional: (optionalType) => extractNamedTypesRecursively(optionalType),
                    nullable: (nullableType) => extractNamedTypesRecursively(nullableType),
                    map: (mapType) => {
                        extractNamedTypesRecursively(mapType.keyType);
                        extractNamedTypesRecursively(mapType.valueType);
                    },
                    literal: () => {
                        // No named types in literals
                    },
                    _other: () => {
                        // Unknown container type
                    }
                });
            }
        };

        this.objectTypeDeclaration.properties.forEach((property) => {
            extractNamedTypesRecursively(property.valueType);
        });

        return customTypeNames;
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
