import { RelativeFilePath } from "@fern-api/fs-utils";
import { RustFile } from "@fern-api/rust-base";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { ObjectProperty, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { namedTypeSupportsHashAndEq, namedTypeSupportsPartialEq } from "../utils/primitiveTypeUtils";
import { isFieldRecursive } from "../utils/recursiveTypeUtils";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
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

        // Add regular properties
        fields.push(
            ...this.objectTypeDeclaration.properties.map((property) => this.generateRustFieldForProperty(property))
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
        // Find the typeId for this struct to detect recursive fields
        const typeId = Object.entries(this.context.ir.types).find(([_, type]) => type === this.typeDeclaration)?.[0];

        // Check if this field creates a recursive reference
        const isRecursive = typeId ? isFieldRecursive(typeId, property.valueType, this.context.ir) : false;

        // Generate the field type, wrapping in Box<T> if recursive
        const fieldType = generateFieldType(property, this.context, isRecursive);
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
}
