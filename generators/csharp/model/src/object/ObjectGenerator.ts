import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleObjectType = FernIr.ExampleObjectType;
type NameAndWireValue = FernIr.NameAndWireValue;
type ObjectProperty = FernIr.ObjectProperty;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;

import { generateFields } from "../generateFields.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { ExampleGenerator } from "../snippets/ExampleGenerator.js";

export class ObjectGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ast.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
        this.exampleGenerator = new ExampleGenerator(context);
    }

    public doGenerate(): CSharpFile {
        const interfaces = [this.System.Text.Json.Serialization.IJsonOnDeserialized];
        if (this.objectDeclaration.extraProperties) {
            interfaces.push(this.System.Text.Json.Serialization.IJsonOnSerializing);
        }

        const properties = [...this.objectDeclaration.properties, ...(this.objectDeclaration.extendedProperties ?? [])];

        // Determine if we need a custom JsonConverter for literal properties
        const enableReadonlyConstants = this.context.generation.settings.enableReadonlyConstants;
        const literalProperties = enableReadonlyConstants
            ? properties.filter((property) => {
                  const literalValue = this.context.getLiteralValue(property.valueType);
                  return literalValue !== undefined;
              })
            : [];
        const needsJsonConverter = literalProperties.length > 0;

        const annotations: (ast.Annotation | ast.ClassReference)[] = [];
        if (needsJsonConverter) {
            annotations.push(
                this.csharp.annotation({
                    reference: this.System.Text.Json.Serialization.JsonConverter(),
                    argument: this.csharp.codeblock((writer: Writer) => {
                        writer.write("typeof(");
                        writer.writeNode(this.classReference);
                        writer.write(".JsonConverter)");
                    })
                })
            );
        }
        annotations.push(this.System.Serializable);

        const class_ = this.csharp.class_({
            reference: this.classReference,
            summary: this.typeDeclaration.docs,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
            interfaceReferences: interfaces,
            annotations
        });
        generateFields(class_, { properties, className: this.classReference.name, context: this.context });

        this.addExtensionDataField(class_);
        const additionalProperties = this.addAdditionalPropertiesProperty(class_);
        this.addOnDeserialized(class_, additionalProperties);
        this.addOnSerializing(class_, additionalProperties);
        this.context.getToStringMethod(class_);

        if (this.shouldAddProtobufMappers(this.typeDeclaration)) {
            this.addProtobufMappers({
                class_,
                properties
            });
        }

        if (needsJsonConverter) {
            this.addJsonConverterNestedClass(class_, literalProperties);
        }

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private addJsonConverterNestedClass(enclosingClass: ast.Class, literalProperties: FernIr.ObjectProperty[]): void {
        const unionReference = this.classReference;
        const converterClass = this.csharp.class_({
            origin: enclosingClass.explicit("JsonConverter"),
            access: ast.Access.Internal,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            sealed: true,
            parentClassReference: this.System.Text.Json.Serialization.JsonConverter(unionReference)
        });

        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: unionReference.asOptional(),
            name: "Read",
            parameters: [
                this.csharp.parameter({
                    ref: true,
                    name: "reader",
                    type: this.System.Text.Json.Utf8JsonReader
                }),
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.System.Type
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeTextStatement("var document = JsonDocument.ParseValue(ref reader)");
                for (const property of literalProperties) {
                    const wireValue = property.name.wireValue;
                    const literalValue = this.context.getLiteralValue(property.valueType);
                    if (typeof literalValue === "string") {
                        writer.writeLine(
                            `if (document.RootElement.TryGetProperty("${wireValue}", out var ${this.toLocalVarName(wireValue)}Element)`
                        );
                        writer.writeLine(
                            `    && ${this.toLocalVarName(wireValue)}Element.GetString() != "${literalValue}")`
                        );
                        writer.pushScope();
                        writer.writeTextStatement(
                            `throw new JsonException($"Expected literal '${wireValue}' to be '${literalValue}', got '{${this.toLocalVarName(wireValue)}Element.GetString()}'")`
                        );
                        writer.popScope();
                    }
                }
                writer.write("return document.Deserialize<");
                writer.writeNode(unionReference);
                writer.write(">(");
                writer.writeNode(this.Types.JsonOptions);
                writer.writeTextStatement(".JsonSerializerOptions)");
            })
        });

        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            name: "Write",
            parameters: [
                this.csharp.parameter({
                    name: "writer",
                    type: this.System.Text.Json.Utf8JsonWriter
                }),
                this.csharp.parameter({
                    name: "value",
                    type: unionReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.write("JsonSerializer.Serialize(writer, value, ");
                writer.writeNode(this.Types.JsonOptions);
                writer.writeTextStatement(".JsonSerializerOptions)");
            })
        });

        enclosingClass.addNestedClass(converterClass);
    }

    /**
     * Converts a wire value (e.g. "myProp") to a camelCase local variable name (e.g. "myProp").
     * Strips non-alphanumeric characters and lowercases the first letter for valid C# identifiers.
     */
    private toLocalVarName(wireValue: string): string {
        // Replace non-identifier characters, ensure camelCase start
        const cleaned = wireValue.replace(/[^a-zA-Z0-9]/g, "_");
        if (cleaned.length === 0) {
            return "value";
        }
        return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    }

    private addExtensionDataField(class_: ast.Class): void {
        class_.addField({
            origin: class_.explicit("_extensionData"),
            annotations: [this.System.Text.Json.Serialization.JsonExtensionData],
            access: ast.Access.Private,
            readonly: true,
            type: this.Collection.idictionary(
                this.Primitive.string,
                this.objectDeclaration.extraProperties
                    ? this.Primitive.object.asOptional()
                    : this.System.Text.Json.JsonElement,
                {
                    dontSimplify: true
                }
            ),
            initializer: this.objectDeclaration.extraProperties
                ? this.System.Collections.Generic.Dictionary(
                      this.Primitive.string,
                      this.Primitive.object.asOptional()
                  ).new()
                : this.System.Collections.Generic.Dictionary(
                      this.Primitive.string,
                      this.System.Text.Json.JsonElement
                  ).new()
        });
    }

    private addAdditionalPropertiesProperty(class_: ast.Class) {
        return class_.addField({
            origin: class_.explicit("AdditionalProperties"),
            annotations: [this.System.Text.Json.Serialization.JsonIgnore],
            access: ast.Access.Public,
            type: this.objectDeclaration.extraProperties
                ? this.Types.AdditionalProperties()
                : this.Types.ReadOnlyAdditionalProperties(),

            get: true,
            set: this.objectDeclaration.extraProperties ? true : ast.Access.Private,
            initializer: this.csharp.codeblock("new()")
        });
    }

    private addOnSerializing(class_: ast.Class, additionalProperties: ast.Field): void {
        if (this.objectDeclaration.extraProperties) {
            class_.addMethod({
                name: "OnSerializing",
                interfaceReference: this.System.Text.Json.Serialization.IJsonOnSerializing,
                parameters: [],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`${additionalProperties.name}.CopyToExtensionData(_extensionData)`)
            });
        }
    }

    private addOnDeserialized(class_: ast.Class, additionalProperties: ast.Field): void {
        class_.addMethod({
            name: "OnDeserialized",
            interfaceReference: this.System.Text.Json.Serialization.IJsonOnDeserialized,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock(`${additionalProperties.name}.CopyFromExtensionData(_extensionData)`)
        });
    }

    public doGenerateSnippet({
        exampleObject,
        parseDatetimes
    }: {
        exampleObject: ExampleObjectType;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        const args = exampleObject.properties.map((exampleProperty) => {
            const propertyName = this.getPropertyName({
                className: this.classReference.name,
                objectProperty: exampleProperty.name
            });
            const assignment = this.exampleGenerator.getSnippetForTypeReference({
                exampleTypeReference: exampleProperty.value,
                parseDatetimes
            });
            // todo: considering filtering out "assignments" are are actually just null so that null properties
            // are completely excluded from object initializers
            return { name: propertyName, assignment };
        });

        if (
            this.objectDeclaration.extraProperties &&
            exampleObject.extraProperties != null &&
            exampleObject.extraProperties.length > 0
        ) {
            const extraPropertiesSnippet = this.generateExtraPropertiesSnippet({
                extraProperties: exampleObject.extraProperties,
                parseDatetimes
            });
            args.push({
                name: "AdditionalProperties",
                assignment: extraPropertiesSnippet
            });
        }

        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return this.csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    private generateExtraPropertiesSnippet({
        extraProperties,
        parseDatetimes
    }: {
        extraProperties: { name: NameAndWireValue; value: FernIr.ExampleTypeReference }[];
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.writeLine("new AdditionalProperties");
            writer.pushScope();
            for (const extraProperty of extraProperties) {
                const valueSnippet = this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: extraProperty.value,
                    parseDatetimes
                });
                writer.write(`["${extraProperty.name.wireValue}"] = `);
                writer.writeNode(valueSnippet);
                writer.writeLine(",");
            }
            writer.popScope();
        });
    }

    private addProtobufMappers({ class_, properties }: { class_: ast.Class; properties: ObjectProperty[] }): void {
        const protobufClassReference = this.context.protobufResolver.getProtobufClassReference(
            this.typeDeclaration.name.typeId
        );
        const protoProperties = properties.map((property) => {
            return {
                propertyName: this.getPropertyName({
                    className: this.classReference.name,
                    objectProperty: property.name
                }),
                typeReference: property.valueType
            };
        });

        this.context.csharpProtobufTypeMapper.toProtoMethod(class_, {
            classReference: this.classReference,
            protobufClassReference,
            properties: protoProperties
        });

        this.context.csharpProtobufTypeMapper.fromProtoMethod(class_, {
            classReference: this.classReference,
            protobufClassReference,
            properties: protoProperties
        });
    }

    /**
     * Class Names and Property Names cannot overlap in C# otherwise there are compilation errors.
     */
    private getPropertyName({
        className,
        objectProperty
    }: {
        className: string;
        objectProperty: NameAndWireValue;
    }): string {
        const propertyName = objectProperty.name.pascalCase.safeName;
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }

    private shouldAddProtobufMappers(typeDeclaration: TypeDeclaration): boolean {
        return typeDeclaration.encoding?.proto != null;
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
