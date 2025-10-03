import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";

import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { namedTypeSupportsHashAndEq, namedTypeSupportsPartialEq } from "../utils/primitiveTypeUtils";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType,
    getCustomTypesUsedInFields,
    hasBigIntFields,
    hasDateFields,
    hasDateTimeOnlyFields,
    hasFloatingPointSets,
    hasHashMapFields,
    hasHashSetFields,
    hasUuidFields
} from "../utils/structUtils";

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
        const customTypes = getCustomTypesUsedInFields(
            this.objectTypeDeclaration.properties,
            this.typeDeclaration.name.name.pascalCase.unsafeName
        );
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

        // Add chrono imports based on specific types needed
        const hasDateOnly = hasDateFields(this.objectTypeDeclaration.properties);
        const hasDateTimeOnly = hasDateTimeOnlyFields(this.objectTypeDeclaration.properties);

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
        const needsHashMap = hasHashMapFields(this.objectTypeDeclaration.properties);
        const needsHashSet = hasHashSetFields(this.objectTypeDeclaration.properties);

        if (needsHashMap && needsHashSet) {
            writer.writeLine("use std::collections::{HashMap, HashSet};");
        } else if (needsHashMap) {
            writer.writeLine("use std::collections::HashMap;");
        } else if (needsHashSet) {
            writer.writeLine("use std::collections::HashSet;");
        }

        // Add ordered_float if we have floating-point sets
        if (hasFloatingPointSets(this.objectTypeDeclaration.properties)) {
            writer.writeLine("use ordered_float::OrderedFloat;");
        }

        // Add uuid if we have UUID fields
        if (hasUuidFields(this.objectTypeDeclaration.properties)) {
            writer.writeLine("use uuid::Uuid;");
        }

        // Add num_bigint if we have BigInt fields
        if (hasBigIntFields(this.objectTypeDeclaration.properties)) {
            writer.writeLine("use num_bigint::BigInt;");
        }

        // TODO: @iamnamananand996 build to use serde_json::Value ---> Value directly
        // if (hasJsonValueFields(properties)) {
        //     writer.writeLine("use serde_json::Value;");
        // }

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
            fields,
            docs: this.typeDeclaration.docs
                ? rust.docComment({
                      summary: this.typeDeclaration.docs
                  })
                : undefined
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
        if (this.needsDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        return attributes;
    }

    private generateRustFieldForProperty(property: ObjectProperty): rust.Field {
        const fieldType = generateFieldType(property);
        const fieldAttributes = generateFieldAttributes(property);
        const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);

        return rust.field({
            name: fieldName,
            type: fieldType,
            visibility: PUBLIC,
            attributes: fieldAttributes,
            docs: property.docs
                ? rust.docComment({
                      summary: property.docs
                  })
                : undefined
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

    private needsPartialEq(): boolean {
        // PartialEq is useful for testing and comparisons
        // Include it unless there are fields that can't support it
        const isTypeSupportsPartialEq = canDerivePartialEq(this.objectTypeDeclaration.properties, this.context);

        const isNamedTypeSupportsPartialEq = this.objectTypeDeclaration.extends.every((parentType) => {
            return namedTypeSupportsPartialEq(
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
        return isTypeSupportsPartialEq && isNamedTypeSupportsPartialEq;
    }

    private needsDeriveHashAndEq(): boolean {
        // Check if all field types can support Hash and Eq derives
        const isTypeSupportsHashAndEq = canDeriveHashAndEq(this.objectTypeDeclaration.properties, this.context);
        const isNamedTypeSupportsHashAndEq = this.objectTypeDeclaration.extends.every((parentType) => {
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
