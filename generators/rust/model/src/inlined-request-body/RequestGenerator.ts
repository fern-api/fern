import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { isOptionalType, namedTypeSupportsHashAndEq, namedTypeSupportsPartialEq } from "../utils/primitiveTypeUtils";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType
} from "../utils/structUtils";

export declare namespace RequestGenerator {
    interface Args {
        name: string;
        properties: (ObjectProperty | InlinedRequestBodyProperty)[];
        extendedProperties?: ObjectProperty[];
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class RequestGenerator {
    private readonly name: string;
    private readonly properties: (ObjectProperty | InlinedRequestBodyProperty)[];
    private readonly extendedProperties: ObjectProperty[];
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

        // Add regular properties (mix of ObjectProperty and InlinedRequestBodyProperty)
        fields.push(...this.properties.map((property) => this.generateRustFieldForProperty(property)));

        // Build documentation for the request type
        let docs = undefined;
        if (this.docsContent) {
            docs = rust.docComment({
                summary: this.docsContent,
                description: `Request type for the ${this.name} operation.`
            });
        } else {
            // Fallback documentation
            docs = rust.docComment({
                summary: `Request type for API operation`
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

        // Default - only add if all properties are optional
        if (this.allPropertiesAreOptional()) {
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

    private allPropertiesAreOptional(): boolean {
        // Check if all regular properties are optional
        const allRegularPropsOptional = this.properties.every((property) => isOptionalType(property.valueType));

        // Check if there are any extended properties (inheritance fields)
        // If there are extended properties, we can't derive Default because we can't default the parent type
        const hasExtendedProperties = this.extendedProperties.length > 0;

        return allRegularPropsOptional && !hasExtendedProperties;
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

    private generateRustFieldForProperty(property: ObjectProperty | InlinedRequestBodyProperty): rust.Field {
        const fieldType = generateFieldType(property, this.context);
        const fieldAttributes = generateFieldAttributes(property);
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
