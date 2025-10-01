import { Attribute, PUBLIC, rust } from "@fern-api/rust-codegen";
import { InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { isOptionalType } from "../utils/primitiveTypeUtils";
import {
    canDeriveHashAndEq,
    canDerivePartialEq,
    generateFieldAttributes,
    generateFieldType,
    writeStructUseStatements
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

        return rust.struct({
            name: this.name,
            visibility: PUBLIC,
            attributes: this.generateStructAttributes(),
            fields
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
        if (canDerivePartialEq(this.properties, this.context)) {
            derives.push("PartialEq");
        }

        // Only add Hash and Eq if all field types support them
        if (canDeriveHashAndEq(this.properties, this.context)) {
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

    private generateRustFieldForProperty(property: ObjectProperty | InlinedRequestBodyProperty): rust.Field {
        const fieldType = generateFieldType(property);
        const fieldAttributes = generateFieldAttributes(property);
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
        this.extendedProperties.forEach((property) => {
            // For extended properties, we need to check if they are named types
            if (property.valueType.type === "named") {
                const parentTypeName = property.valueType.name.pascalCase.unsafeName;

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
        writeStructUseStatements(writer, this.properties, this.context, this.name);
        writer.newLine();

        // Write the struct
        const rustStruct = this.generateStructForTypeDeclaration();
        rustStruct.write(writer);

        return writer.toString();
    }
}
