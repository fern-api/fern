import { FernIr } from "@fern-fern/ir-sdk";
import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { hasDefaultImpl, isOptionalType, namedTypeSupportsHashAndEq, namedTypeSupportsPartialEq } from "../utils/primitiveTypeUtils.js";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
} from "../utils/structUtils.js";

export declare namespace RequestGenerator {
    interface Args {
        name: string;
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
        extendedProperties?: FernIr.ObjectProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class RequestGenerator {
    private readonly name: string;
    private readonly properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
    private readonly extendedProperties: FernIr.ObjectProperty[];
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, properties, extendedProperties, docsContent, context }: RequestGenerator.Args) {
        this.name = name;
        this.properties = properties;
        this.extendedProperties = extendedProperties ?? [];
        this.docsContent = docsContent;
        this.context = context;
    }

    public generate(): rust.Struct {
        return this.generateStructForTypeDeclaration();
    }

    public generateStructForTypeDeclaration(): rust.Struct {
        const fields: rust.Field[] = [];

        // Add inheritance fields first (with serde flatten)
        fields.push(...this.generateInheritanceFields());

        // Add regular properties (mix of FernIr.ObjectProperty and FernIr.InlinedRequestBodyProperty)
        fields.push(...this.properties.map((property) => this.generateRustFieldForProperty(property)));

        // Build documentation for the request type
        let docs = undefined;
        if (this.docsContent) {
            docs = rust.docComment({
                summary: this.docsContent
            });
        }

        return rust.struct({
            name: this.name,
            visibility: PUBLIC,
            attributes: this.generateStructAttributes(),
            fields,
            docs
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

        return attributes;
    }

    private canDeriveDefault(): boolean {
        // Check if all regular properties have types that implement Default in Rust
        const propertiesSupport = this.properties.every((property) =>
            hasDefaultImpl(property.valueType, this.context)
        );

        // Check if all extended properties (inheritance fields) support Default
        const extendsSupport = this.extendedProperties.every((property) =>
            hasDefaultImpl(property.valueType, this.context)
        );

        return propertiesSupport && extendsSupport;
    }

    private needsPartialEq(): boolean {
        // PartialEq is useful for testing and comparisons
        // Include it unless there are fields that can't support it
        const isTypeSupportsPartialEq = canDerivePartialEq(this.properties, this.context);

        const isNamedTypeSupportsPartialEq = this.extendedProperties.every((property) => {
            if (property.valueType.type === "named") {
                return namedTypeSupportsPartialEq(
                    {
                        name: property.valueType.name,
                        typeId: property.valueType.typeId,
                        default: undefined,
                        inline: undefined,
                        fernFilepath: property.valueType.fernFilepath,
                        displayName: property.valueType.name.originalName
                    },
                    this.context
                );
            }
            return true;
        });
        return isTypeSupportsPartialEq && isNamedTypeSupportsPartialEq;
    }

    private needsDeriveHashAndEq(): boolean {
        // Check if all field types can support Hash and Eq derives
        const isTypeSupportsHashAndEq = canDeriveHashAndEq(this.properties, this.context);
        const isNamedTypeSupportsHashAndEq = this.extendedProperties.every((property) => {
            if (property.valueType.type === "named") {
                return namedTypeSupportsHashAndEq(
                    {
                        name: property.valueType.name,
                        typeId: property.valueType.typeId,
                        default: undefined,
                        inline: undefined,
                        fernFilepath: property.valueType.fernFilepath,
                        displayName: property.valueType.name.originalName
                    },
                    this.context
                );
            }
            return true;
        });
        return isTypeSupportsHashAndEq && isNamedTypeSupportsHashAndEq;
    }

    private generateRustFieldForProperty(property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty): rust.Field {
        const fieldType = generateFieldType(property, this.context);
        const fieldAttributes = generateFieldAttributes(property, this.context);
        const fieldName = this.context.escapeRustKeyword(property.name.name.snakeCase.unsafeName);

        // Add field documentation if available
        let docs = undefined;
        if (property.docs) {
            docs = rust.docComment({
                summary: property.docs
            });
        }

        return rust.field({
            name: fieldName,
            type: fieldType,
            visibility: PUBLIC,
            attributes: fieldAttributes,
            docs
        });
    }

    private generateInheritanceFields(): rust.Field[] {
        const fields: rust.Field[] = [];

        // Generate fields for inherited types using serde flatten
        this.extendedProperties.forEach((property) => {
            // For extended properties, we need to check if they are named types
            if (property.valueType.type === "named") {
                // Use getUniqueTypeNameForReference to get the correct type name with fernFilepath prefix
                const parentTypeName = this.context.getUniqueTypeNameForReference(property.valueType);

                fields.push(
                    rust.field({
                        name: `${property.name.name.snakeCase.unsafeName}_fields`,
                        type: rust.Type.reference(rust.reference({ name: parentTypeName })),
                        visibility: PUBLIC,
                        attributes: [Attribute.serde.flatten()]
                    })
                );
            }
        });

        return fields;
    }

    public generateFileContents(): string {
        const writer = rust.writer();

        // Add use statements
        writer.writeLine(`pub use crate::prelude::*;`);
        writer.newLine();

        // Write the struct
        const rustStruct = this.generateStructForTypeDeclaration();
        rustStruct.write(writer);
        writer.newLine(); // Ensure file ends with newline

        return writer.toString();
    }
}
