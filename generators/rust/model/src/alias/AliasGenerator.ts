import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { AliasTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";
import { generateRustTypeForTypeReference } from "../converters";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { isChronoType, isCollectionType, isDateTimeType, isUnknownType, isUuidType } from "../utils/primitiveTypeUtils";

export class AliasGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly aliasTypeDeclaration: AliasTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: TypeDeclaration,
        aliasTypeDeclaration: AliasTypeDeclaration,
        context: ModelGeneratorContext
    ) {
        this.typeDeclaration = typeDeclaration;
        this.aliasTypeDeclaration = aliasTypeDeclaration;
        this.context = context;
    }

    public generate(): RustFile {
        const rustNewtype = this.generateNewtypeForTypeDeclaration();
        const fileContents = this.generateFileContents(rustNewtype);
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

    private generateFileContents(rustNewtype: rust.NewtypeStruct): string {
        const writer = rust.writer();

        // Add use statements
        this.writeUseStatements(writer);
        writer.newLine();

        // Write the newtype struct
        rustNewtype.write(writer);

        return writer.toString();
    }

    private writeUseStatements(writer: rust.Writer): void {
        writer.writeLine("use serde::{Deserialize, Serialize};");

        // Add additional use statements based on the inner type
        this.writeAdditionalUseStatements(writer);
    }

    private writeAdditionalUseStatements(writer: rust.Writer): void {
        const innerType = this.aliasTypeDeclaration.aliasOf;

        // Add imports for custom named types FIRST
        const customTypes = this.getCustomTypesUsedInAlias();
        customTypes.forEach((typeName) => {
            const moduleNameEscaped = this.context.escapeRustKeyword(typeName.snakeCase.unsafeName);
            writer.writeLine(`use crate::${moduleNameEscaped}::${typeName.pascalCase.unsafeName};`);
        });

        // Add chrono if aliasing a datetime
        if (isChronoType(innerType)) {
            writer.writeLine("use chrono::{DateTime, Utc};");
        }

        // Add uuid if aliasing a UUID
        if (isUuidType(innerType)) {
            writer.writeLine("use uuid::Uuid;");
        }

        // Add collections if aliasing a map or set
        if (isCollectionType(innerType)) {
            writer.writeLine("use std::collections::HashMap;");
        }

        // Add serde_json if aliasing unknown type
        if (isUnknownType(innerType)) {
            writer.writeLine("use serde_json::Value;");
        }
    }

    private generateNewtypeForTypeDeclaration(): rust.NewtypeStruct {
        return rust.newtypeStruct({
            name: this.typeDeclaration.name.name.pascalCase.unsafeName,
            innerType: generateRustTypeForTypeReference(this.aliasTypeDeclaration.aliasOf),
            visibility: PUBLIC,
            innerVisibility: PUBLIC,
            attributes: this.generateNewtypeAttributes()
        });
    }

    private generateNewtypeAttributes(): rust.Attribute[] {
        const attributes: rust.Attribute[] = [];

        // Always add basic derives
        const derives = ["Debug", "Clone", "Serialize", "Deserialize", "PartialEq"];
        attributes.push(Attribute.derive(derives));

        // Add additional serde attributes for special types
        const innerType = this.aliasTypeDeclaration.aliasOf;
        if (isDateTimeType(innerType)) {
            // For datetime newtypes, we might want custom serialization
            attributes.push(Attribute.serde.with("chrono::serde::ts_seconds"));
        }

        return attributes;
    }

    private getCustomTypesUsedInAlias(): {
        snakeCase: { unsafeName: string };
        pascalCase: { unsafeName: string };
    }[] {
        const customTypeNames: {
            snakeCase: { unsafeName: string };
            pascalCase: { unsafeName: string };
        }[] = [];
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
                    list: (listType: TypeReference) => extractNamedTypesRecursively(listType),
                    set: (setType: TypeReference) => extractNamedTypesRecursively(setType),
                    optional: (optionalType: TypeReference) => extractNamedTypesRecursively(optionalType),
                    nullable: (nullableType: TypeReference) => extractNamedTypesRecursively(nullableType),
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

        // Analyze the aliased type
        extractNamedTypesRecursively(this.aliasTypeDeclaration.aliasOf);

        return customTypeNames;
    }
}
