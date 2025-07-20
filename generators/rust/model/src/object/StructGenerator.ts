import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, Attribute, PUBLIC } from "@fern-api/rust-codegen";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

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

    private generateStructForTypeDeclaration(): rust.Struct {
        return rust.struct({
            name: this.typeDeclaration.name.name.pascalCase.unsafeName,
            visibility: PUBLIC,
            attributes: this.generateStructAttributes(),
            fields: this.objectTypeDeclaration.properties.map((property) => this.generateRustFieldForProperty(property))
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

        return rust.field({
            name: property.name.name.snakeCase.unsafeName,
            type: fieldType,
            visibility: PUBLIC,
            attributes: fieldAttributes
        });
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
}
