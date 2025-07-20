import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { rust, Attribute, PUBLIC } from "@fern-api/rust-codegen";

import { AliasTypeDeclaration, TypeDeclaration, PrimitiveTypeV1 } from "@fern-fern/ir-sdk/api";

import { generateRustTypeForTypeReference } from "../converters";

export class AliasGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly aliasTypeDeclaration: AliasTypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration, aliasTypeDeclaration: AliasTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.aliasTypeDeclaration = aliasTypeDeclaration;
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
        
        // Add chrono if aliasing a datetime
        if (innerType.type === "primitive") {
            const isDateTime = PrimitiveTypeV1._visit(innerType.primitive.v1, {
                string: () => false,
                boolean: () => false,
                integer: () => false,
                uint: () => false,
                uint64: () => false,
                long: () => false,
                float: () => false,
                double: () => false,
                bigInteger: () => false,
                date: () => true,
                dateTime: () => true,
                base64: () => false,
                uuid: () => false,
                _other: () => false
            });
            
            if (isDateTime) {
                writer.writeLine("use chrono::{DateTime, Utc};");
            }
            
            // Add uuid if aliasing a UUID
            const isUuid = PrimitiveTypeV1._visit(innerType.primitive.v1, {
                string: () => false,
                boolean: () => false,
                integer: () => false,
                uint: () => false,
                uint64: () => false,
                long: () => false,
                float: () => false,
                double: () => false,
                bigInteger: () => false,
                date: () => false,
                dateTime: () => false,
                base64: () => false,
                uuid: () => true,
                _other: () => false
            });
            
            if (isUuid) {
                writer.writeLine("use uuid::Uuid;");
            }
        }
        
        // Add collections if aliasing a map or set
        if (innerType.type === "container" && 
            (innerType.container.type === "map" || innerType.container.type === "set")) {
            writer.writeLine("use std::collections::HashMap;");
        }
        
        // Add serde_json if aliasing unknown type
        if (innerType.type === "unknown") {
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
        if (innerType.type === "primitive") {
            const isDateTime = PrimitiveTypeV1._visit(innerType.primitive.v1, {
                string: () => false,
                boolean: () => false,
                integer: () => false,
                uint: () => false,
                uint64: () => false,
                long: () => false,
                float: () => false,
                double: () => false,
                bigInteger: () => false,
                date: () => false,
                dateTime: () => true,
                base64: () => false,
                uuid: () => false,
                _other: () => false
            });
            
            if (isDateTime) {
                // For datetime newtypes, we might want custom serialization
                attributes.push(Attribute.serde.with("chrono::serde::ts_seconds"));
            }
        }
        
        return attributes;
    }
} 