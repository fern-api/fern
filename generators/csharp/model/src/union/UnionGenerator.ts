import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString, is } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExampleUnionType, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateFields } from "../generateFields";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object/ObjectGenerator";
import { ExampleGenerator } from "../snippets/ExampleGenerator";

const basePropertiesClassName = "BaseProperties";

export class UnionGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ast.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    private readonly unionMemberTypeMap: Map<FernIr.SingleUnionType, ast.Type>;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        const basePropNames = unionDeclaration.baseProperties.map((p) => p.name.name.pascalCase.safeName);

        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);

        this.exampleGenerator = new ExampleGenerator(context);
        this.unionMemberTypeMap = new Map(
            unionDeclaration.types.map((type) => this.getCsharpTypeMapEntry(type, context))
        );
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            annotations: [
                this.csharp.annotation({
                    reference: this.extern.System.Text.Json.Serialization.JsonConverter(),
                    argument: this.csharp.codeblock((writer) => {
                        writer.write("typeof(");
                        writer.writeNode(this.classReference);
                        writer.write(".JsonConverter");
                        writer.write(")");
                    })
                }),
                this.extern.System.Serializable
            ],
            summary: this.typeDeclaration.docs,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Record
        });

        const discriminant = class_.addField({
            origin: this.unionDeclaration.discriminant,
            enclosingType: class_,
            summary: "Discriminant value",
            jsonPropertyName: this.unionDeclaration.discriminant.name.originalName,
            access: ast.Access.Public,
            type: this.csharp.Type.string,
            get: "public",
            set: "internal"
        });

        const value = class_.addField({
            enclosingType: class_,
            summary: "Discriminated union value",
            access: ast.Access.Public,
            type: this.csharp.Type.object.toOptionalIfNotAlready(),
            origin: class_.explicit("Value"),
            get: "public",
            set: "internal"
        });

        let baseProperties: ast.Field[] = [];

        if (this.unionDeclaration.baseProperties.length > 0) {
            baseProperties = generateFields(class_, {
                properties: this.unionDeclaration.baseProperties,
                className: this.classReference.name,
                context: this.context
            });

            const basePropertiesClass = this.csharp.class_({
                summary: "Base properties for the discriminated union",
                name: basePropertiesClassName,
                access: ast.Access.Internal,
                type: ast.Class.ClassType.Record,
                enclosingType: class_.reference,
                namespace: this.classReference.namespace,
                annotations: [this.extern.System.Serializable]
            });
            generateFields(basePropertiesClass, {
                properties: this.unionDeclaration.baseProperties,
                className: this.classReference.name,
                context: this.context
            });

            class_.addNestedClass(basePropertiesClass);
        }

        class_.addConstructor({
            access: ast.Access.Internal,
            parameters: [
                this.csharp.parameter({
                    name: "type",
                    type: this.csharp.Type.string
                }),
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.object.toOptionalIfNotAlready()
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(`${discriminant.name} = type`);
                writer.writeTextStatement(`${value.name} = value`);
            })
        });
        class_.addConstructors(
            this.unionDeclaration.types.map((type) => {
                const innerClassType = this.getUnionTypeClassReferenceByTypeName(
                    type.discriminantValue.name.pascalCase.safeName
                );
                const ctor: ast.Class.Constructor = {
                    doc: {
                        summary: (writer) => {
                            writer.write(`Create an instance of ${this.classReference.name} with <see cref="`);
                            writer.writeNode(innerClassType);
                            writer.write('"/>.');
                        }
                    },
                    access: ast.Access.Public,
                    parameters: [
                        this.csharp.parameter({
                            name: "value",
                            type: innerClassType
                        })
                    ],
                    body: this.csharp.codeblock((writer) => {
                        writer.writeTextStatement(`${discriminant.name} = "${type.discriminantValue.wireValue}"`);
                        writer.writeTextStatement("Value = value.Value");
                    })
                };
                return ctor;
            })
        );

        // add IsFoo properties

        for (const type of this.unionDeclaration.types) {
            class_.addField({
                enclosingType: class_,
                doc: {
                    summary: (writer) =>
                        writer.write(
                            `Returns true if <see cref="${discriminant.name}"/> is "${type.discriminantValue.wireValue}"`
                        )
                },
                access: ast.Access.Public,
                type: this.csharp.Type.boolean,
                origin: class_.explicit(`Is${type.discriminantValue.name.pascalCase.unsafeName}`),
                get: true,
                initializer: this.csharp.codeblock(`${discriminant.name} == "${type.discriminantValue.wireValue}"`)
            });
        }

        // add AsFoo methods

        this.unionDeclaration.types.forEach((type) => {
            const memberType = this.getCsharpType(type);
            return class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write('Returns the value as a <see cref="');
                        writer.writeNode(memberType);
                        writer.write(
                            `"/> if <see cref="${discriminant.name}"/> is '${escapeForCSharpString(type.discriminantValue.wireValue)}', otherwise throws an exception.`
                        );
                    },
                    exceptions: new Map([
                        [
                            "Exception",
                            (writer) => {
                                writer.write(
                                    `Thrown when <see cref="${discriminant.name}"/> is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'.`
                                );
                            }
                        ]
                    ])
                },
                access: ast.Access.Public,
                return_: memberType,
                name: `As${type.discriminantValue.name.pascalCase.unsafeName}`,
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock((writer) => {
                    writer.write(`Is${type.discriminantValue.name.pascalCase.unsafeName} ? `);
                    if (!is.Type.object(memberType.unwrapIfOptional())) {
                        writer.write("(", memberType, ")");
                    }
                    writer.write(`${value.name}! : throw new `);
                    writer.writeNode(this.extern.System.Exception.asFullyQualified());
                    writer.write('("');
                    writer.writeNode(this.classReference);
                    writer.write(
                        `.${discriminant.name} is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'")`
                    );
                }),
                parameters: []
            });
        });

        const tTypeParameter = this.csharp.typeParameter("T");
        class_.addMethod({
            access: ast.Access.Public,
            name: "Match",
            return_: tTypeParameter,
            typeParameters: [tTypeParameter],
            parameters: [
                ...this.unionDeclaration.types.map((type) => {
                    const memberType = this.getCsharpType(type);
                    return this.csharp.parameter({
                        name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                        type: this.csharp.Type.func({
                            typeParameters: [memberType],
                            returnType: tTypeParameter
                        })
                    });
                }),
                this.csharp.parameter({
                    name: "onUnknown_",
                    type: this.csharp.Type.func({
                        typeParameters: [this.csharp.Type.string, this.csharp.Type.object.toOptionalIfNotAlready()],
                        returnType: tTypeParameter
                    })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`return ${discriminant.name} switch`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeNode(this.csharp.string_({ string: type.discriminantValue.wireValue }));
                    writer.write(" => ");
                    writer.writeLine(
                        `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}()),`
                    );
                });
                writer.writeLine(`_ => onUnknown_(${discriminant.name}, ${value.name})`);
                writer.dedent();
                writer.writeTextStatement("}");
            })
        });

        class_.addMethod({
            access: ast.Access.Public,
            name: "Visit",
            parameters: [
                ...this.unionDeclaration.types.map((type) => {
                    const memberType = this.getCsharpType(type);
                    return this.csharp.parameter({
                        name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                        type: this.csharp.Type.action({
                            typeParameters: [memberType]
                        })
                    });
                }),
                this.csharp.parameter({
                    name: "onUnknown_",
                    type: this.csharp.Type.action({
                        typeParameters: [this.csharp.Type.string, this.csharp.Type.object.toOptionalIfNotAlready()]
                    })
                })
            ],
            body: this.csharp.codeblock((writer) => {
                writer.writeLine(`switch (${discriminant.name})`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeLine(`case "${type.discriminantValue.wireValue}":`);
                    writer.indent();
                    writer.writeTextStatement(
                        `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}())`
                    );
                    writer.writeTextStatement("break");
                    writer.dedent();
                });
                writer.writeLine("default:");
                writer.indent();
                writer.writeTextStatement(`onUnknown_(${discriminant.name}, ${value.name})`);
                writer.writeTextStatement("break");
                writer.popScope();
            })
        });

        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.csharp.Type.string,
            name: "ToString",
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.writeNode(
                    this.csharp.invokeMethod({
                        on: this.types.JsonUtils,
                        method: "Serialize",
                        arguments_: [this.csharp.codeblock("this")]
                    })
                );
            })
        });

        // add TryAsFoo methods

        this.unionDeclaration.types.forEach((type) => {
            const memberType = this.getCsharpType(type);
            return class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write('Attempts to cast the value to a <see cref="');
                        writer.writeNode(memberType);
                        writer.write('"/> and returns true if successful.');
                    }
                },
                access: ast.Access.Public,
                return_: this.csharp.Type.boolean,
                name: `TryAs${type.discriminantValue.name.pascalCase.unsafeName}`,
                body: this.csharp.codeblock((writer) => {
                    writer.writeLine(`if(${discriminant.name} == "${type.discriminantValue.wireValue}")`);
                    writer.pushScope();
                    writer.write("value = ");
                    if (!is.Type.object(memberType.unwrapIfOptional())) {
                        writer.write("(", memberType, ")");
                    }
                    writer.writeTextStatement(`${value.name}!`);
                    writer.writeTextStatement("return true");
                    writer.popScope();
                    writer.writeTextStatement("value = null");
                    writer.writeTextStatement("return false");
                }),
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: memberType.toOptionalIfNotAlready(),
                        out: true
                    })
                ]
            });
        });

        // add implicit conversion operators
        if (!baseProperties.some((p) => p.isRequired)) {
            class_.addOperators(
                this.unionDeclaration.types
                    .map((type) => {
                        const memberType = this.getCsharpType(type);
                        if (is.Type.object(memberType.unwrapIfOptional())) {
                            // we can't have an implicit cast from object
                            return undefined;
                        }
                        const operator: ast.Class.CastOperator = {
                            type: ast.Class.CastOperator.Type.Implicit,
                            parameter: this.csharp.parameter({
                                name: "value",
                                type: this.getUnionTypeClassReferenceByTypeName(
                                    type.discriminantValue.name.pascalCase.safeName
                                )
                            }),
                            useExpressionBody: true,
                            body: this.csharp.codeblock("new (value)")
                        };
                        return operator;
                    })
                    .filter((x) => x !== undefined)
            );
        }

        class_.addNestedClasses(
            this.unionDeclaration.types.map((type) => {
                const isNoProperties = type.shape.propertiesType === "noProperties";
                const memberType = this.getCsharpType(type);
                const unionTypeClass = this.csharp.class_({
                    origin: this.model.explicit(type.discriminantValue, "Inner"),
                    reference: this.getUnionTypeClassReferenceByTypeName(
                        type.discriminantValue.name.pascalCase.safeName
                    ),
                    summary: `Discriminated union type for ${type.discriminantValue.name.originalName}`,
                    access: ast.Access.Public,
                    type: memberType.isReferenceType() ? ast.Class.ClassType.Record : ast.Class.ClassType.Struct,
                    annotations: [this.extern.System.Serializable]
                });
                if (isNoProperties) {
                    unionTypeClass.addField({
                        origin: unionTypeClass.explicit("Value"),
                        enclosingType: unionTypeClass,
                        access: ast.Access.Internal,
                        type: memberType,
                        get: true,
                        set: false,
                        initializer: this.csharp.codeblock("new {}")
                    });
                } else {
                    unionTypeClass.addConstructor({
                        access: ast.Access.Public,
                        parameters: [
                            this.csharp.parameter({
                                name: "value",
                                type: memberType
                            })
                        ],
                        body: this.csharp.codeblock("Value = value;\n")
                    });
                    unionTypeClass.addField({
                        origin: unionTypeClass.explicit("Value"),
                        enclosingType: unionTypeClass,
                        access: ast.Access.Internal,
                        type: memberType,
                        get: true,
                        set: true
                    });
                }
                unionTypeClass.addMethod({
                    access: ast.Access.Public,
                    override: true,
                    return_: this.csharp.Type.string,
                    name: "ToString",
                    parameters: [],
                    bodyType: ast.Method.BodyType.Expression,
                    body: this.csharp.codeblock(
                        memberType.isOptional()
                            ? 'Value?.ToString() ?? "null"'
                            : is.Type.string(memberType)
                              ? "Value"
                              : 'Value.ToString() ?? "null"'
                    )
                });
                // we can't have an implicit cast from object or (IEnumerable<T>)
                const underlyingType = memberType.unwrapIfOptional();
                if (!is.Type.object(underlyingType) && !is.Type.list(underlyingType)) {
                    unionTypeClass.addOperator({
                        type: ast.Class.CastOperator.Type.Implicit,
                        parameter: this.csharp.parameter({
                            name: "value",
                            type: memberType
                        }),
                        useExpressionBody: true,
                        body: this.csharp.codeblock("new (value)")
                    });
                }
                return unionTypeClass;
            })
        );

        this.generateJsonConverter(class_, baseProperties, discriminant, value);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation,
            fileHeader: `// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming`
        });
    }
    getUnionType(type: FernIr.NameAndWireValue) {
        return this.csharp.classReference({
            origin: type,
            enclosingType: this.classReference
        });
    }

    private getUnionTypeClassReferenceByTypeName(type: string): ast.ClassReference {
        const name = ["Value", "Type"].includes(type) ? `${type}Inner` : type;
        return this.csharp.classReference({
            enclosingType: this.classReference,
            name
        });
    }

    private generateJsonConverter(
        enclosingClass: ast.Class,
        baseProperties: ast.Field[],
        discriminant: ast.Field,
        value: ast.Field
    ): ast.Class {
        const unionReference = this.csharp.Type.reference(this.classReference);
        const class_ = this.csharp.class_({
            origin: enclosingClass.explicit("JsonConverter"),
            access: ast.Access.Internal,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            sealed: true,
            parentClassReference: this.extern.System.Text.Json.Serialization.JsonConverter(unionReference),
            annotations: [this.extern.System.Serializable]
        });

        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.csharp.Type.boolean,
            name: "CanConvert",
            parameters: [
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.csharp.Type.systemType
                })
            ],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer) => {
                writer.write("typeof(");
                writer.writeNode(this.classReference);
                writer.write(").IsAssignableFrom(typeToConvert)");
            })
        });

        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: unionReference,
            name: "Read",
            parameters: [
                this.csharp.parameter({
                    ref: true,
                    name: "reader",
                    type: this.csharp.Type.reference(this.extern.System.Text.Json.Utf8JsonReader)
                }),
                this.csharp.parameter({
                    name: "typeToConvert",
                    type: this.csharp.Type.systemType
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.Type.reference(this.extern.System.Text.Json.JsonSerializerOptions)
                })
            ],
            body: this.csharp.codeblock((writer) => {
                const discriminatorPropName = this.unionDeclaration.discriminant.wireValue;
                writer.writeTextStatement("var json = JsonElement.ParseValue(ref reader)");
                writer.writeLine(`if (!json.TryGetProperty("${discriminatorPropName}", out var discriminatorElement))`);
                writer.pushScope();
                writer.writeTextStatement(
                    `throw new JsonException("Missing discriminator property '${discriminatorPropName}'")`
                );
                writer.popScope();
                writer.writeLine("if (discriminatorElement.ValueKind != JsonValueKind.String)");
                writer.pushScope();
                writer.writeLine("if (discriminatorElement.ValueKind == JsonValueKind.Null)");
                writer.pushScope();
                writer.writeTextStatement(
                    `throw new JsonException("Discriminator property '${discriminatorPropName}' is null")`
                );
                writer.popScope();
                writer.writeLine();
                writer.writeTextStatement(
                    `throw new JsonException($"Discriminator property '${discriminatorPropName}' is not a string, instead is {discriminatorElement.ToString()}")`
                );
                writer.popScope();
                writer.writeLine();
                writer.writeLine("var discriminator = discriminatorElement.GetString() ?? ");
                writer.writeTextStatement(
                    `throw new JsonException("Discriminator property '${discriminatorPropName}' is null")`
                );
                writer.writeLine();

                writer.writeLine("var value = discriminator switch");
                writer.pushScope();

                this.unionDeclaration.types.forEach((type) => {
                    const csharpType = this.getCsharpType(type);
                    const csharp = this.csharp;
                    function generateSerializeUnionMember(): void {
                        writer.writeNode(csharp.string_({ string: type.discriminantValue.wireValue }));
                        writer.write(" => ");
                        switch (type.shape.propertiesType) {
                            case "samePropertiesAsObject":
                                writer.write("json");
                                break;
                            case "singleProperty":
                                writer.write(`json.GetProperty("${type.shape.name.wireValue}")`);
                                break;
                            case "noProperties":
                                throw new Error("Internal Error; noProperties should not be used for deserialization");
                            default:
                                assertNever(type.shape);
                        }
                        if (csharpType.isReferenceType() === false) {
                            // non-reference types can be always be deserialized directly as is
                            writer.write(".Deserialize<", csharpType, ">(options)");
                        } else {
                            // reference types need to always be deserialized to an optional type
                            // and if it is not optional, then we can tack on the throw condition
                            // (this ensures that the code is valid regardless if it is a record struct or class types)
                            writer.write(".Deserialize<", csharpType.toOptionalIfNotAlready(), ">(options)");

                            if (!csharpType.isOptional()) {
                                writer.write(' ?? throw new JsonException("Failed to deserialize ', csharpType, '")');
                            }
                        }
                        writer.writeLine(",");
                    }

                    switch (type.shape.propertiesType) {
                        case "noProperties":
                            writer.writeNode(csharp.string_({ string: type.discriminantValue.wireValue }));
                            writer.writeLine(" => new {},");
                            break;
                        case "samePropertiesAsObject":
                            generateSerializeUnionMember();
                            break;
                        case "singleProperty":
                            generateSerializeUnionMember();
                            break;
                        default:
                            assertNever(type.shape);
                    }
                });
                writer.writeLine("_ => json.Deserialize<object?>(options)");
                writer.dedent();
                writer.writeTextStatement("}");

                if (baseProperties.length > 0) {
                    writer.write("var baseProperties = json.Deserialize<");
                    writer.writeNode(this.classReference);
                    writer.write('.BaseProperties>(options) ?? throw new JsonException("Failed to deserialize ');
                    writer.writeNode(this.classReference);
                    writer.writeLine('.BaseProperties");');
                }
                writer.write("return new ");
                writer.writeNode(unionReference);
                writer.writeLine("(discriminator, value)");
                if (baseProperties.length > 0) {
                    writer.pushScope();
                    baseProperties.forEach((property) => {
                        writer.writeLine(`${property.name} = baseProperties.${property.name},`);
                    });
                    writer.popScope();
                }
                writer.writeSemicolonIfLastCharacterIsNot();
                writer.writeLine();
            })
        });

        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            name: "Write",
            parameters: [
                this.csharp.parameter({
                    name: "writer",
                    type: this.csharp.Type.reference(this.extern.System.Text.Json.Utf8JsonWriter)
                }),
                this.csharp.parameter({
                    name: "value",
                    type: unionReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.csharp.Type.reference(this.extern.System.Text.Json.JsonSerializerOptions)
                })
            ],
            body: this.csharp.codeblock((writer) => {
                const jsonObjReference = this.extern.System.Text.Json.Nodes.JsonObject;
                writer.writeNode(this.extern.System.Text.Json.Nodes.JsonNode);
                writer.writeLine(` json = value.${discriminant.name} switch`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeNode(this.csharp.string_({ string: type.discriminantValue.wireValue }));
                    writer.write(" => ");
                    switch (type.shape.propertiesType) {
                        case "samePropertiesAsObject":
                            writer.write("JsonSerializer.SerializeToNode(value.Value, options),");
                            break;
                        case "singleProperty":
                            writer.write("new ");
                            writer.writeNode(jsonObjReference);
                            writer.writeLine();
                            writer.pushScope();
                            writer.writeLine(
                                `["${type.shape.name.wireValue}"] = JsonSerializer.SerializeToNode(value.${value.name}, options)`
                            );
                            writer.dedent();
                            writer.writeLine("},");
                            break;
                        case "noProperties":
                            writer.writeLine("null,");
                            break;
                    }
                });
                writer.write("_ => JsonSerializer.SerializeToNode(value.Value, options)");
                writer.popScope();
                writer.write(" ?? new ");
                writer.writeNode(jsonObjReference);
                writer.writeTextStatement("()");
                writer.writeTextStatement(
                    `json["${this.unionDeclaration.discriminant.wireValue}"] = value.${discriminant.name}`
                );
                if (baseProperties.length > 0) {
                    writer.write("var basePropertiesJson = JsonSerializer.SerializeToNode(new ");
                    writer.writeNode(this.classReference);
                    writer.writeLine(".BaseProperties");
                    writer.pushScope();
                    baseProperties.forEach((property) => {
                        writer.writeLine(`${property.name} = value.${property.name},`);
                    });
                    writer.popScope();
                    writer.write(', options) ?? throw new JsonException("Failed to serialize ');
                    writer.writeNode(this.classReference);
                    writer.writeLine('.BaseProperties");');
                    writer.writeLine("foreach (var property in basePropertiesJson.AsObject())");
                    writer.pushScope();
                    writer.writeLine("json[property.Key] = property.Value;");
                    writer.popScope();
                }
                writer.writeTextStatement("json.WriteTo(writer, options)");
            })
        });
        enclosingClass.addNestedClass(class_);
        return class_;
    }

    private getCsharpType(type: FernIr.SingleUnionType): ast.Type {
        const csharpType = this.unionMemberTypeMap.get(type);
        if (csharpType === undefined) {
            throw new Error("Could not find C# type for SingleUnionType");
        }
        return csharpType;
    }

    private getCsharpTypeMapEntry(
        type: FernIr.SingleUnionType,
        context: ModelGeneratorContext
    ): [FernIr.SingleUnionType, ast.Type] {
        switch (type.shape.propertiesType) {
            case "noProperties":
                return [type, this.csharp.Type.object];
            case "samePropertiesAsObject":
                return [
                    type,
                    this.csharp.Type.reference(
                        context.csharpTypeMapper.convertToClassReference(type.shape, { fullyQualified: true })
                    )
                ];
            case "singleProperty":
                return [
                    type,
                    context.csharpTypeMapper.convert({
                        reference: type.shape.type,
                        fullyQualified: true
                    })
                ];
            default:
                assertNever(type.shape);
        }
    }

    private generateInnerUnionClassSnippet({
        exampleUnion,
        innerValue
    }: {
        exampleUnion: ExampleUnionType;
        innerValue: ast.AstNode;
    }): ast.AstNode {
        // todo - this should really be dereferencing the type and looking it up...
        return this.csharp.instantiateClass({
            classReference: this.getUnionTypeClassReferenceByTypeName(
                exampleUnion.singleUnionType.wireDiscriminantValue.name.pascalCase.safeName
            ),
            arguments_: [innerValue]
        });
    }

    private generateInnerValueSnippet({
        unionType,
        parseDatetimes
    }: {
        unionType: FernIr.ExampleSingleUnionType;
        parseDatetimes: boolean;
    }): ast.AstNode {
        switch (unionType.shape.type) {
            case "samePropertiesAsObject": {
                const typeDeclaration = this.model.dereferenceType(unionType.shape.typeId).typeDeclaration;
                const objectGenerator = new ObjectGenerator(
                    this.context,
                    typeDeclaration,
                    typeDeclaration.shape as FernIr.ObjectTypeDeclaration
                );
                return objectGenerator.doGenerateSnippet({ exampleObject: unionType.shape.object, parseDatetimes });
            }
            case "singleProperty":
                return this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: unionType.shape,
                    parseDatetimes
                });
            case "noProperties":
                // no params into inner union class
                return this.csharp.codeblock("");
            default:
                assertNever(unionType.shape);
        }
    }
    public shouldGenerateSnippet(): boolean {
        if (this.unionDeclaration.baseProperties.length > 0) {
            // example union types don't come with base properties,
            // so there's no way to generate snippets for them
            return false;
        }
        return true;
    }

    public doGenerateSnippet({
        exampleUnion,
        parseDatetimes
    }: {
        exampleUnion: ExampleUnionType;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        if (this.shouldGenerateSnippet() === false) {
            this.context.logger.warn(
                `Generating snippet for union type ${this.classReference.name} but it has base properties, which is not supported.`
            );
        }
        const innerValue = this.generateInnerValueSnippet({ unionType: exampleUnion.singleUnionType, parseDatetimes });
        const innerObjectInstantiation = this.generateInnerUnionClassSnippet({ exampleUnion, innerValue });
        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [innerObjectInstantiation]
        });
        return this.csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
