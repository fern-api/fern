import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, is, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleObjectType = FernIr.ExampleObjectType;
type NameAndWireValue = FernIr.NameAndWireValue;
type ObjectProperty = FernIr.ObjectProperty;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;

import { analyzeTypeReference, generateFields } from "../generateFields.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { ExampleGenerator } from "../snippets/ExampleGenerator.js";

/**
 * Metadata collected for each property to drive JsonConverter generation.
 */
interface PropertyConverterInfo {
    /** The PascalCase property name used in C# */
    propertyName: string;
    /** The JSON wire name */
    wireValue: string;
    /** The C# type of the property */
    csharpType: ast.Type;
    /** Whether the C# type uses the OptionalWrapper (renders as Optional<T>) vs Optional (renders as T?) */
    isOptionalWrapper: boolean;
    /** Whether the property has [NullableAttribute] semantics */
    isNullable: boolean;
    /** Whether the property is read-only (should not be serialized) */
    isReadOnly: boolean;
    /** Whether the property is write-only (should not be deserialized) */
    isWriteOnly: boolean;
    /** Whether this is a literal property (has a fixed initializer value) */
    isLiteral: boolean;
}

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
        const class_ = this.csharp.class_({
            reference: this.classReference,
            summary: this.typeDeclaration.docs,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record,
            annotations: [
                this.csharp.annotation({
                    reference: this.System.Text.Json.Serialization.JsonConverter(),
                    argument: this.csharp.codeblock((writer: Writer) => {
                        writer.write("typeof(");
                        writer.writeNode(this.classReference);
                        writer.write(".JsonConverter");
                        writer.write(")");
                    })
                }),
                this.System.Serializable
            ]
        });
        const properties = [...this.objectDeclaration.properties, ...(this.objectDeclaration.extendedProperties ?? [])];
        generateFields(class_, {
            properties,
            className: this.classReference.name,
            context: this.context
        });

        this.addAdditionalPropertiesProperty(class_);
        this.context.getToStringMethod(class_);

        // Collect property metadata for the converter
        const propertyInfos = this.collectPropertyInfos(properties);

        // Generate the nested JsonConverter class
        this.generateJsonConverter(class_, propertyInfos);

        if (this.shouldAddProtobufMappers(this.typeDeclaration)) {
            this.addProtobufMappers({
                class_,
                properties
            });
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

    /**
     * Collects converter metadata for each property.
     */
    private collectPropertyInfos(
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[]
    ): PropertyConverterInfo[] {
        return properties.map((property) => {
            const typeInfo = analyzeTypeReference(property.valueType, this.context);
            const csharpType = this.context.csharpTypeMapper.convert({ reference: property.valueType });
            const propertyName = this.getPropertyName({
                className: this.classReference.name,
                objectProperty: property.name
            });
            const isLiteral =
                this.context.getLiteralInitializerFromTypeReference({ typeReference: property.valueType }) != null;

            let isReadOnly = false;
            let isWriteOnly = false;
            if ("propertyAccess" in property && property.propertyAccess) {
                isReadOnly = property.propertyAccess === "READ_ONLY";
                isWriteOnly = property.propertyAccess === "WRITE_ONLY";
            }

            return {
                propertyName,
                wireValue: property.name.wireValue,
                csharpType,
                isOptionalWrapper: is.OptionalWrapper(csharpType),
                isNullable: typeInfo.isNullable,
                isReadOnly,
                isWriteOnly,
                isLiteral
            };
        });
    }

    /**
     * Generates a nested JsonConverter<T> class inside the object class.
     */
    private generateJsonConverter(enclosingClass: ast.Class, propertyInfos: PropertyConverterInfo[]): void {
        const objectReference = this.classReference;
        const converterClass = this.csharp.class_({
            origin: enclosingClass.explicit("JsonConverter"),
            access: ast.Access.Internal,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            sealed: true,
            parentClassReference: this.System.Text.Json.Serialization.JsonConverter(objectReference),
            annotations: [this.System.Serializable]
        });

        // CanConvert method
        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.Primitive.boolean,
            name: "CanConvert",
            parameters: [
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.System.Type
                })
            ],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer: Writer) => {
                writer.write("typeof(");
                writer.writeNode(this.classReference);
                writer.write(").IsAssignableFrom(typeToConvert)");
            })
        });

        // Read method
        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: objectReference.asOptional(),
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
                this.writeReadMethodBody(writer, propertyInfos);
            })
        });

        // Write method
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
                    type: objectReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                this.writeWriteMethodBody(writer, propertyInfos);
            })
        });

        // ReadAsPropertyName method - for dictionary key deserialization
        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: objectReference,
            name: "ReadAsPropertyName",
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
                writer.writeTextStatement("var json = reader.GetString()");
                writer.write("return JsonSerializer.Deserialize<");
                writer.writeNode(objectReference);
                writer.writeTextStatement(">(json, options)");
            })
        });

        // WriteAsPropertyName method - for dictionary key serialization
        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            name: "WriteAsPropertyName",
            parameters: [
                this.csharp.parameter({
                    name: "writer",
                    type: this.System.Text.Json.Utf8JsonWriter
                }),
                this.csharp.parameter({
                    name: "value",
                    type: objectReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.write("var json = JsonSerializer.Serialize(value, options)");
                writer.writeLine(";");
                writer.writeTextStatement("writer.WritePropertyName(json)");
            })
        });

        enclosingClass.addNestedClass(converterClass);
    }

    /**
     * Generates the Read method body for the JsonConverter.
     */
    private writeReadMethodBody(writer: Writer, propertyInfos: PropertyConverterInfo[]): void {
        // Handle null token
        writer.writeLine("if (reader.TokenType == JsonTokenType.Null)");
        writer.pushScope();
        writer.writeTextStatement("return null");
        writer.popScope();
        writer.writeLine();

        // Declare local variables for each property
        for (const prop of propertyInfos) {
            if (prop.isWriteOnly || prop.isLiteral) {
                // WriteOnly properties are not deserialized;
                // Literal properties use their default initializer (= new())
                continue;
            }
            if (prop.isOptionalWrapper) {
                writer.write("var ");
                writer.write(this.getLocalVarName(prop.propertyName));
                writer.write(" = ");
                // For Optional<T>, initialize as undefined
                this.writeOptionalTypePrefix(writer, prop);
                writer.writeTextStatement(".Undefined");
            } else {
                writer.writeNode(prop.csharpType);
                writer.write(` ${this.getLocalVarName(prop.propertyName)} = default`);
                writer.writeTextStatement("");
            }
        }

        // Extension data dictionary
        if (this.objectDeclaration.extraProperties) {
            writer.writeTextStatement("var extensionData = new Dictionary<string, object?>()");
        } else {
            writer.writeTextStatement("var extensionData = new Dictionary<string, JsonElement>()");
        }
        writer.writeLine();

        // Check for StartObject
        writer.writeLine("if (reader.TokenType != JsonTokenType.StartObject)");
        writer.pushScope();
        writer.writeTextStatement('throw new JsonException("Expected StartObject")');
        writer.popScope();
        writer.writeLine();

        // Main read loop
        writer.writeLine("while (reader.Read() && reader.TokenType != JsonTokenType.EndObject)");
        writer.pushScope();
        writer.writeTextStatement("var propertyName = reader.GetString()");
        writer.writeTextStatement("reader.Read()");
        writer.writeLine();
        writer.writeLine("switch (propertyName)");
        writer.pushScope();

        for (const prop of propertyInfos) {
            if (prop.isWriteOnly || prop.isLiteral) {
                // WriteOnly = don't deserialize, skip the value
                // Literal = fixed value, skip (the default initializer handles it)
                writer.writeLine(`case "${prop.wireValue}":`);
                writer.indent();
                writer.writeTextStatement("reader.Skip()");
                writer.writeTextStatement("break");
                writer.dedent();
                continue;
            }

            writer.writeLine(`case "${prop.wireValue}":`);
            writer.indent();

            if (prop.isOptionalWrapper) {
                // Wrap in Optional<T>.Of(...)
                writer.write(`${this.getLocalVarName(prop.propertyName)} = `);
                this.writeOptionalTypePrefix(writer, prop);
                writer.write(".Of(");
                writer.write("JsonSerializer.Deserialize<");
                this.writeOptionalInnerType(writer, prop);
                writer.write(">(ref reader, options)");
                writer.writeTextStatement(")");
            } else {
                writer.write(`${this.getLocalVarName(prop.propertyName)} = `);
                writer.write("JsonSerializer.Deserialize<");
                writer.writeNode(prop.csharpType);
                writer.writeTextStatement(">(ref reader, options)");
            }
            writer.writeTextStatement("break");
            writer.dedent();
        }

        // Default case: capture unknown properties
        writer.writeLine("default:");
        writer.indent();
        if (this.objectDeclaration.extraProperties) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.Null)");
            writer.pushScope();
            writer.writeTextStatement("extensionData[propertyName!] = null");
            writer.popScope();
            writer.writeLine("else");
            writer.pushScope();
            writer.writeTextStatement(
                "extensionData[propertyName!] = JsonSerializer.Deserialize<object>(ref reader, options)"
            );
            writer.popScope();
        } else {
            writer.writeTextStatement("extensionData[propertyName!] = JsonElement.ParseValue(ref reader)");
        }
        writer.writeTextStatement("break");
        writer.dedent();

        writer.popScope(); // end switch
        writer.popScope(); // end while
        writer.writeLine();

        // Construct the return object
        writer.write("return new ");
        writer.writeNode(this.classReference);
        writer.writeLine();
        writer.pushScope();
        for (const prop of propertyInfos) {
            if (prop.isLiteral) {
                // Literal properties use their default initializer (= new()), skip
                continue;
            }
            if (prop.isWriteOnly) {
                // WriteOnly properties are not deserialized but required members must be set
                writer.writeLine(`${prop.propertyName} = default!,`);
                continue;
            }
            writer.writeLine(`${prop.propertyName} = ${this.getLocalVarName(prop.propertyName)},`);
        }
        if (this.objectDeclaration.extraProperties) {
            writer.writeLine("AdditionalProperties = new AdditionalProperties(extensionData),");
        } else {
            writer.writeLine("AdditionalProperties = new ReadOnlyAdditionalProperties(extensionData),");
        }
        writer.popScope();
        writer.writeSemicolonIfLastCharacterIsNot();
        writer.writeLine();
    }

    /**
     * Generates the Write method body for the JsonConverter.
     */
    private writeWriteMethodBody(writer: Writer, propertyInfos: PropertyConverterInfo[]): void {
        writer.writeTextStatement("writer.WriteStartObject()");

        const enableExplicitNullableOptional = this.context.generation.settings.enableExplicitNullableOptional;

        for (const prop of propertyInfos) {
            // ReadOnly properties should not be serialized
            if (prop.isReadOnly) {
                continue;
            }

            if (prop.isWriteOnly) {
                // WriteOnly properties are not deserialized and receive default! in Read.
                // Must null-check to avoid writing null for reference types after round-trip.
                writer.writeLine(`if (value.${prop.propertyName} != null)`);
                writer.pushScope();
                writer.writeTextStatement(`writer.WritePropertyName("${prop.wireValue}")`);
                writer.write("JsonSerializer.Serialize(writer, value.");
                writer.writeTextStatement(`${prop.propertyName}, options)`);
                writer.popScope();
            } else if (prop.isOptionalWrapper) {
                // Optional<T> properties: write only if IsDefined
                writer.writeLine(`if (value.${prop.propertyName}.IsDefined)`);
                writer.pushScope();
                writer.writeTextStatement(`writer.WritePropertyName("${prop.wireValue}")`);
                writer.write("JsonSerializer.Serialize(writer, value.");
                writer.writeTextStatement(`${prop.propertyName}.Value, options)`);
                writer.popScope();
            } else if (prop.isNullable && enableExplicitNullableOptional) {
                // Nullable with [NullableAttribute]: always write, even if null
                writer.writeTextStatement(`writer.WritePropertyName("${prop.wireValue}")`);
                writer.write("JsonSerializer.Serialize(writer, value.");
                writer.writeTextStatement(`${prop.propertyName}, options)`);
            } else if (prop.csharpType.isOptional && !prop.isLiteral) {
                // Standard nullable property (no explicit nullable/optional attributes):
                // skip if null (equivalent to DefaultIgnoreCondition.WhenWritingNull)
                writer.writeLine(`if (value.${prop.propertyName} != null)`);
                writer.pushScope();
                writer.writeTextStatement(`writer.WritePropertyName("${prop.wireValue}")`);
                writer.write("JsonSerializer.Serialize(writer, value.");
                writer.writeTextStatement(`${prop.propertyName}, options)`);
                writer.popScope();
            } else {
                // Required/non-nullable properties and literal properties: always write
                writer.writeTextStatement(`writer.WritePropertyName("${prop.wireValue}")`);
                writer.write("JsonSerializer.Serialize(writer, value.");
                writer.writeTextStatement(`${prop.propertyName}, options)`);
            }
        }

        // Write additional properties / extension data
        writer.writeLine("if (value.AdditionalProperties != null)");
        writer.pushScope();
        writer.writeLine("foreach (var kvp in value.AdditionalProperties)");
        writer.pushScope();
        writer.writeTextStatement("writer.WritePropertyName(kvp.Key)");
        if (this.objectDeclaration.extraProperties) {
            writer.writeTextStatement("JsonSerializer.Serialize(writer, kvp.Value, options)");
        } else {
            writer.writeTextStatement("kvp.Value.WriteTo(writer)");
        }
        writer.popScope(); // end foreach
        writer.popScope(); // end if

        writer.writeTextStatement("writer.WriteEndObject()");
    }

    /**
     * Writes the full Optional<T> type prefix (e.g., "Optional<Metadata?>")
     * Used for variable declarations and type references.
     */
    private writeOptionalTypePrefix(writer: Writer, prop: PropertyConverterInfo): void {
        writer.writeNode(prop.csharpType);
    }

    /**
     * Writes the inner type of an Optional<T> property (the T part).
     * For Optional<Metadata?>, this writes "Metadata?".
     * For Optional<string>, this writes "string".
     */
    private writeOptionalInnerType(writer: Writer, prop: PropertyConverterInfo): void {
        // asNonOptional() unwraps OptionalWrapper to get the inner type.
        // For Optional<Metadata?>, this returns Nullable(Metadata) which writes as "Metadata?".
        // For Optional<string>, this returns string.
        writer.writeNode(prop.csharpType.asNonOptional());
    }

    /**
     * Gets a local variable name for use in the Read method.
     * Uses camelCase with leading underscore to avoid conflicts.
     */
    private getLocalVarName(propertyName: string): string {
        return `_${propertyName.charAt(0).toLowerCase()}${propertyName.slice(1)}`;
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
