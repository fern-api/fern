import { FernIr } from "@fern-fern/ir-sdk";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { namedTypeSupportsHashAndEq, namedTypeSupportsPartialEq } from "../utils/primitiveTypeUtils.js";
import { isFieldRecursive } from "../utils/recursiveTypeUtils.js";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
} from "../utils/structUtils.js";

export class StructGenerator {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly objectTypeDeclaration: FernIr.ObjectTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor(
        typeDeclaration: FernIr.TypeDeclaration,
        objectTypeDeclaration: FernIr.ObjectTypeDeclaration,
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
        writer.writeLine("pub use crate::prelude::*;");
        writer.newLine();

        // Write the struct
        rustStruct.write(writer);

        return writer.toString();
    }

    private generateStructForTypeDeclaration(): rust.Struct {
        const fields: rust.Field[] = [];

        // Add inheritance fields first (with serde flatten)
        fields.push(...this.generateInheritanceFields());

        // Determine if this type is a WebSocket server message body type.
        // If so, skip the `type` property because the parent enum uses
        // #[serde(tag = "type")] which consumes that field for dispatch.
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];
        const skipTypeField = typeId != null && this.context.websocketServerMessageTypeIds.has(typeId);

        // Add regular properties
        const properties = skipTypeField
            ? this.objectTypeDeclaration.properties.filter((p) => p.name.wireValue !== "type")
            : this.objectTypeDeclaration.properties;
        fields.push(
            ...properties.map((property) => this.generateRustFieldForProperty(property))
        );

        return rust.struct({
            name: this.context.getUniqueTypeNameForDeclaration(this.typeDeclaration),
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

        // Default - add if all fields support Default
        if (this.canDeriveDefault()) {
            derives.push("Default");
        }

        // PartialEq - for equality comparisons
        if (this.needsPartialEq()) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all field types support them
        if (this.needsDeriveHashAndEq()) {
            derives.push("Eq", "Hash");
        }

        attributes.push(Attribute.derive(derives));

        // Add #[serde(transparent)] for single-property structs used in undiscriminated unions.
        // This makes the struct serialize/deserialize as the inner value directly,
        // which is required for untagged enum variant matching.
        if (this.isSinglePropertyUndiscriminatedUnionMember()) {
            attributes.push(Attribute.serde.transparent());
        }

        return attributes;
    }

    private generateRustFieldForProperty(property: FernIr.ObjectProperty): rust.Field {
        // Find the typeId for this struct to detect recursive fields
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        // Check if this field creates a recursive reference
        const isRecursive = typeId ? isFieldRecursive(typeId, property.valueType, this.context.ir) : false;

        // Generate the field type, wrapping in Box<T> if recursive
        const fieldType = generateFieldType(property, this.context, isRecursive);
        const isTransparent = this.isSinglePropertyUndiscriminatedUnionMember();
        // When struct is transparent, skip field-level serde attributes (rename, default, etc.)
        // as they are incompatible with #[serde(transparent)]
        const fieldAttributes = isTransparent ? [] : generateFieldAttributes(property, this.context);
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
            // Use getUniqueTypeNameForReference to get the correct type name with fernFilepath prefix
            const parentTypeName = this.context.getUniqueTypeNameForReference(parentType);

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

    /**
     * Check if this struct is a single-property wrapper used in an undiscriminated union.
     * Such structs need #[serde(transparent)] so they serialize/deserialize as the
     * inner value directly, enabling correct untagged enum variant matching.
     */
    private isSinglePropertyUndiscriminatedUnionMember(): boolean {
        // Must have exactly one property and no extends (inheritance)
        if (this.objectTypeDeclaration.properties.length !== 1 || this.objectTypeDeclaration.extends.length > 0) {
            return false;
        }
        // Check if this type is referenced by any undiscriminated union
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];
        return typeId != null && this.context.undiscriminatedUnionMemberTypeIds.has(typeId);
    }

    private canDeriveDefault(): boolean {
        // Check if all properties support Default
        const propertiesSupport = this.objectTypeDeclaration.properties.every((property) => {
            return this.typeSupportsDefault(property.valueType, new Set());
        });
        // Check if all inherited types support Default
        const extendsSupport = this.objectTypeDeclaration.extends.every((parentType) => {
            return this.namedTypeSupportsDefault(parentType.typeId, new Set());
        });
        return propertiesSupport && extendsSupport;
    }

    private typeSupportsDefault(typeRef: FernIr.TypeReference, visited: Set<string>): boolean {
        if (typeRef.type === "primitive") {
            return true; // All Rust primitives implement Default
        }
        if (typeRef.type === "container") {
            return typeRef.container._visit({
                list: () => true,
                map: () => true,
                set: () => true,
                optional: () => true,
                nullable: () => true,
                literal: () => false,
                _other: () => false
            });
        }
        if (typeRef.type === "named") {
            return this.namedTypeSupportsDefault(typeRef.typeId, visited);
        }
        if (typeRef.type === "unknown") {
            return true; // serde_json::Value implements Default
        }
        return false;
    }

    private namedTypeSupportsDefault(typeId: string, visited: Set<string>): boolean {
        if (visited.has(typeId)) {
            return false; // Prevent infinite recursion, be conservative
        }
        visited.add(typeId);
        const typeDecl = this.context.ir.types[typeId];
        if (!typeDecl) {
            return false;
        }
        if (typeDecl.shape.type === "object") {
            // Object supports Default if all its fields support Default
            return typeDecl.shape.properties.every((prop) =>
                this.typeSupportsDefault(prop.valueType, visited)
            );
        }
        if (typeDecl.shape.type === "enum") {
            return false; // Enums don't derive Default (no #[default] variant)
        }
        if (typeDecl.shape.type === "alias") {
            return this.typeSupportsDefault(typeDecl.shape.aliasOf, visited);
        }
        // Unions don't derive Default
        return false;
    }
}
