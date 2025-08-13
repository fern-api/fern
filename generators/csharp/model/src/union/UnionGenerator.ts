import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { csharp, escapeForCSharpString } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";
import { ExampleUnionType, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { generateFields } from "../generateFields";
import { ObjectGenerator } from "../object/ObjectGenerator";
import { ExampleGenerator } from "../snippets/ExampleGenerator";

const basePropertiesClassName = "BaseProperties";

export class UnionGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: csharp.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    private readonly discriminantPropertyName: string;
    private readonly valuePropertyName: string = "Value";
    private readonly unionMemberTypeMap: Map<FernIr.SingleUnionType, csharp.Type>;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.discriminantPropertyName = unionDeclaration.discriminant.name.pascalCase.safeName;
        const basePropNames = unionDeclaration.baseProperties.map((p) => p.name.name.pascalCase.safeName);

        if (basePropNames.includes(this.valuePropertyName)) {
            this.valuePropertyName = `${this.valuePropertyName}_`;
        }
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);

        if (
            basePropNames.includes(this.discriminantPropertyName) ||
            this.classReference.name === this.discriminantPropertyName
        ) {
            this.discriminantPropertyName = `${this.discriminantPropertyName}_`;
        }

        this.exampleGenerator = new ExampleGenerator(context);
        this.unionMemberTypeMap = new Map(
            unionDeclaration.types.map((type) => this.getCsharpTypeMapEntry(type, context))
        );
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            annotations: [
                csharp.annotation({
                    reference: this.context.getJsonConverterAttributeReference(),
                    argument: csharp.codeblock((writer) => {
                        writer.write("typeof(");
                        writer.writeNode(this.classReference);
                        writer.write(".JsonConverter");
                        writer.write(")");
                    })
                }),
                this.context.getSerializableAttribute()
            ],
            summary: this.typeDeclaration.docs,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record
        });

        this.discriminantPropertyName;

        class_.addField(
            csharp.field({
                summary: "Discriminant value",
                jsonPropertyName: this.unionDeclaration.discriminant.name.originalName,
                access: csharp.Access.Public,
                type: csharp.Type.string(),
                name: this.discriminantPropertyName,
                get: "public",
                set: "internal"
            })
        );

        class_.addField(
            csharp.field({
                summary: "Discriminated union value",
                access: csharp.Access.Public,
                type: csharp.Type.object().toOptionalIfNotAlready(),
                name: this.valuePropertyName,
                get: "public",
                set: "internal"
            })
        );

        const baseProperties =
            this.unionDeclaration.baseProperties.length > 0
                ? generateFields({
                      properties: this.unionDeclaration.baseProperties,
                      className: this.classReference.name,
                      context: this.context
                  })
                : [];
        if (baseProperties.length > 0) {
            const baseProperties = generateFields({
                properties: this.unionDeclaration.baseProperties,
                className: this.classReference.name,
                context: this.context
            });
            class_.addFields(baseProperties);

            const basePropertiesClass = csharp.class_({
                summary: "Base properties for the discriminated union",
                name: basePropertiesClassName,
                access: csharp.Access.Internal,
                type: csharp.Class.ClassType.Record,
                isNestedClass: true,
                namespace: this.classReference.namespace,
                annotations: [this.context.getSerializableAttribute()]
            });
            basePropertiesClass.addFields(baseProperties);
            class_.addNestedClass(basePropertiesClass);
        }

        class_.addConstructor({
            access: csharp.Access.Internal,
            parameters: [
                csharp.parameter({
                    name: "type",
                    type: csharp.Type.string()
                }),
                csharp.parameter({
                    name: "value",
                    type: csharp.Type.object().toOptionalIfNotAlready()
                })
            ],
            body: csharp.codeblock((writer) => {
                writer.writeTextStatement(`${this.discriminantPropertyName} = type`);
                writer.writeTextStatement(`${this.valuePropertyName} = value`);
            })
        });
        class_.addConstructors(
            this.unionDeclaration.types.map((type) => {
                const innerClassType = this.getUnionTypeClassReferenceType(type);
                const ctor: csharp.Class.Constructor = {
                    doc: {
                        summary: (writer) => {
                            writer.write(`Create an instance of ${this.classReference.name} with <see cref="`);
                            writer.writeNode(innerClassType);
                            writer.write('"/>.');
                        }
                    },
                    access: csharp.Access.Public,
                    parameters: [
                        csharp.parameter({
                            name: "value",
                            type: innerClassType
                        })
                    ],
                    body: csharp.codeblock((writer) => {
                        writer.writeTextStatement(
                            `${this.discriminantPropertyName} = "${type.discriminantValue.wireValue}"`
                        );
                        writer.writeTextStatement("Value = value.Value");
                    })
                };
                return ctor;
            })
        );

        // add IsFoo properties
        class_.addFields(
            this.unionDeclaration.types.map((type) => {
                return csharp.field({
                    doc: {
                        summary: (writer) =>
                            writer.write(
                                `Returns true if <see cref="${this.discriminantPropertyName}"/> is "${type.discriminantValue.wireValue}"`
                            )
                    },
                    access: csharp.Access.Public,
                    type: csharp.Type.boolean(),
                    name: `Is${type.discriminantValue.name.pascalCase.unsafeName}`,
                    get: true,
                    initializer: csharp.codeblock(
                        `${this.discriminantPropertyName} == "${type.discriminantValue.wireValue}"`
                    )
                });
            })
        );

        // add AsFoo methods
        class_.addMethods(
            this.unionDeclaration.types.map((type) => {
                const memberType = this.getCsharpType(type);
                return csharp.method({
                    doc: {
                        summary: (writer) => {
                            writer.write('Returns the value as a <see cref="');
                            writer.writeNode(memberType);
                            writer.write(
                                `"/> if <see cref="${this.discriminantPropertyName}"/> is '${escapeForCSharpString(type.discriminantValue.wireValue)}', otherwise throws an exception.`
                            );
                        },
                        exceptions: new Map([
                            [
                                "Exception",
                                (writer) => {
                                    writer.write(
                                        `Thrown when <see cref="${this.discriminantPropertyName}"/> is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'.`
                                    );
                                }
                            ]
                        ])
                    },
                    access: csharp.Access.Public,
                    return_: memberType,
                    name: `As${type.discriminantValue.name.pascalCase.unsafeName}`,
                    bodyType: csharp.Method.BodyType.Expression,
                    body: csharp.codeblock((writer) => {
                        writer.write(`Is${type.discriminantValue.name.pascalCase.unsafeName} ? `);
                        if (memberType.unwrapIfOptional().internalType.type !== "object") {
                            writer.write("(");
                            writer.writeNode(memberType);
                            writer.write(")");
                        }
                        writer.write(`${this.valuePropertyName}! : throw new Exception("`);
                        writer.writeNode(this.classReference);
                        writer.write(
                            `.${this.discriminantPropertyName} is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'")`
                        );
                    }),
                    parameters: []
                });
            })
        );

        const tTypeParameter = csharp.typeParameter("T");
        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Match",
                return_: tTypeParameter,
                typeParameters: [tTypeParameter],
                parameters: [
                    ...this.unionDeclaration.types.map((type) => {
                        const memberType = this.getCsharpType(type);
                        return csharp.parameter({
                            name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                            type: csharp.Type.func({
                                typeParameters: [memberType],
                                returnType: tTypeParameter
                            })
                        });
                    }),
                    csharp.parameter({
                        name: "onUnknown_",
                        type: csharp.Type.func({
                            typeParameters: [csharp.Type.string(), csharp.Type.object().toOptionalIfNotAlready()],
                            returnType: tTypeParameter
                        })
                    })
                ],
                body: csharp.codeblock((writer) => {
                    writer.writeLine(`return ${this.discriminantPropertyName} switch`);
                    writer.writeLine("{");
                    writer.indent();
                    this.unionDeclaration.types.forEach((type) => {
                        writer.writeNode(csharp.string_({ string: type.discriminantValue.wireValue }));
                        writer.write(" => ");
                        writer.writeLine(
                            `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}()),`
                        );
                    });
                    writer.writeLine(`_ => onUnknown_(${this.discriminantPropertyName}, ${this.valuePropertyName})`);
                    writer.dedent();
                    writer.writeTextStatement("}");
                })
            })
        );

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Visit",
                parameters: [
                    ...this.unionDeclaration.types.map((type) => {
                        const memberType = this.getCsharpType(type);
                        return csharp.parameter({
                            name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                            type: csharp.Type.action({
                                typeParameters: [memberType]
                            })
                        });
                    }),
                    csharp.parameter({
                        name: "onUnknown_",
                        type: csharp.Type.action({
                            typeParameters: [csharp.Type.string(), csharp.Type.object().toOptionalIfNotAlready()]
                        })
                    })
                ],
                body: csharp.codeblock((writer) => {
                    writer.writeLine(`switch (${this.discriminantPropertyName})`);
                    writer.writeLine("{");
                    writer.indent();
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
                    writer.writeTextStatement(
                        `onUnknown_(${this.discriminantPropertyName}, ${this.valuePropertyName})`
                    );
                    writer.writeTextStatement("break");
                    writer.dedent();
                    writer.writeLine("}");
                })
            })
        );

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                override: true,
                return_: csharp.Type.string(),
                name: "ToString",
                parameters: [],
                bodyType: csharp.Method.BodyType.Expression,
                body: csharp.codeblock((writer) => {
                    writer.writeNode(
                        csharp.invokeMethod({
                            on: this.context.getJsonUtilsClassReference(),
                            method: "Serialize",
                            arguments_: [csharp.codeblock("this")]
                        })
                    );
                })
            })
        );

        // add TryAsFoo methods
        class_.addMethods(
            this.unionDeclaration.types.map((type) => {
                const memberType = this.getCsharpType(type);
                return csharp.method({
                    doc: {
                        summary: (writer) => {
                            writer.write('Attempts to cast the value to a <see cref="');
                            writer.writeNode(memberType);
                            writer.write('"/> and returns true if successful.');
                        }
                    },
                    access: csharp.Access.Public,
                    return_: csharp.Type.boolean(),
                    name: `TryAs${type.discriminantValue.name.pascalCase.unsafeName}`,
                    body: csharp.codeblock((writer) => {
                        writer.writeLine(
                            `if(${this.discriminantPropertyName} == "${type.discriminantValue.wireValue}")`
                        );
                        writer.writeLine("{");
                        writer.indent();
                        writer.write("value = ");
                        if (memberType.unwrapIfOptional().internalType.type !== "object") {
                            writer.write("(");
                            writer.writeNode(memberType);
                            writer.write(")");
                        }
                        writer.writeTextStatement(`${this.valuePropertyName}!`);
                        writer.writeTextStatement("return true");
                        writer.dedent();
                        writer.writeLine("}");
                        writer.writeTextStatement("value = null");
                        writer.writeTextStatement("return false");
                    }),
                    parameters: [
                        csharp.parameter({
                            name: "value",
                            type: memberType.toOptionalIfNotAlready(),
                            out: true
                        })
                    ]
                });
            })
        );

        // add implicit conversion operators
        if (!baseProperties.some((p) => p.isRequired)) {
            class_.addOperators(
                this.unionDeclaration.types
                    .map((type) => {
                        const memberType = this.getCsharpType(type);
                        if (memberType.unwrapIfOptional().internalType.type === "object") {
                            // we can't have an implicit cast from object
                            return undefined;
                        }
                        const operator: csharp.Class.CastOperator = {
                            type: csharp.Class.CastOperator.Type.Implicit,
                            parameter: csharp.parameter({
                                name: "value",
                                type: this.getUnionTypeClassReferenceType(type)
                            }),
                            useExpressionBody: true,
                            body: csharp.codeblock("new (value)")
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
                const unionTypeClass = csharp.class_({
                    summary: `Discriminated union type for ${type.discriminantValue.name.originalName}`,
                    name: this.getUnionTypeClassName(type),
                    namespace: this.classReference.namespace,
                    access: csharp.Access.Public,
                    isNestedClass: true,
                    type: memberType.isReferenceType() ? csharp.Class.ClassType.Record : csharp.Class.ClassType.Struct,
                    annotations: [this.context.getSerializableAttribute()]
                });
                if (isNoProperties) {
                    unionTypeClass.addField(
                        csharp.field({
                            access: csharp.Access.Internal,
                            type: memberType,
                            name: "Value",
                            get: true,
                            set: false,
                            initializer: csharp.codeblock("new {}")
                        })
                    );
                } else {
                    unionTypeClass.addConstructor({
                        access: csharp.Access.Public,
                        parameters: [
                            csharp.parameter({
                                name: "value",
                                type: memberType
                            })
                        ],
                        body: csharp.codeblock("Value = value;\n")
                    });
                    unionTypeClass.addField(
                        csharp.field({
                            access: csharp.Access.Internal,
                            type: memberType,
                            name: "Value",
                            get: true,
                            set: true
                        })
                    );
                }
                unionTypeClass.addMethod(
                    csharp.method({
                        access: csharp.Access.Public,
                        override: true,
                        return_: csharp.Type.string(),
                        name: "ToString",
                        parameters: [],
                        bodyType: csharp.Method.BodyType.Expression,
                        body: csharp.codeblock(
                            memberType.isOptional()
                                ? "Value?.ToString()"
                                : memberType.internalType.type !== "string"
                                  ? "Value.ToString()"
                                  : "Value"
                        )
                    })
                );
                // we can't have an implicit cast from object or (IEnumerable<T>)
                if (!["object", "list"].includes(memberType.unwrapIfOptional().internalType.type)) {
                    unionTypeClass.addOperator({
                        type: csharp.Class.CastOperator.Type.Implicit,
                        parameter: csharp.parameter({
                            name: "value",
                            type: memberType
                        }),
                        useExpressionBody: true,
                        body: csharp.codeblock("new (value)")
                    });
                }
                return unionTypeClass;
            })
        );

        class_.addNestedClass(this.generateJsonConverter(baseProperties));

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig,
            fileHeader: `// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming`
        });
    }

    private getUnionTypeClassReferenceType(type: FernIr.SingleUnionType): csharp.Type {
        return csharp.Type.reference(this.getUnionTypeClassReference(type));
    }

    private getUnionTypeClassReferenceTypeByTypeName(typeName: string): csharp.Type {
        return csharp.Type.reference(this.getUnionTypeClassReferenceByTypeName(typeName));
    }

    private getUnionTypeClassReference(type: FernIr.SingleUnionType): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.classReference.namespace,
            name: `${this.classReference.name}.${this.getUnionTypeClassName(type)}`
        });
    }

    private getUnionTypeClassReferenceByTypeName(type: string): csharp.ClassReference {
        return csharp.classReference({
            namespace: this.classReference.namespace,
            name: `${this.classReference.name}.${this.getUnionTypeClassNameByTypeName(type)}`
        });
    }

    private getUnionTypeClassName(type: FernIr.SingleUnionType): string {
        return this.getUnionTypeClassNameByTypeName(type.discriminantValue.name.pascalCase.safeName);
    }

    private getUnionTypeClassNameByTypeName(typeName: string): string {
        if (["Value", "Type"].includes(typeName)) {
            return `${typeName}Inner`;
        }
        return typeName;
    }

    private generateJsonConverter(baseProperties: csharp.Field[]): csharp.Class {
        const unionReference = csharp.Type.reference(this.classReference);
        const class_ = csharp.class_({
            name: "JsonConverter",
            access: csharp.Access.Internal,
            namespace: this.classReference.namespace,
            isNestedClass: true,
            sealed: true,
            parentClassReference: this.context.getJsonConverterClassReference(unionReference),
            annotations: [this.context.getSerializableAttribute()]
        });

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                override: true,
                return_: csharp.Type.boolean(),
                name: "CanConvert",
                parameters: [
                    csharp.parameter({
                        name: "typeToConvert",
                        type: csharp.Type.csharpType()
                    })
                ],
                bodyType: csharp.Method.BodyType.Expression,
                body: csharp.codeblock((writer) => {
                    writer.write("typeof(");
                    writer.writeNode(this.classReference);
                    writer.write(").IsAssignableFrom(typeToConvert)");
                })
            })
        );

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                override: true,
                return_: unionReference,
                name: "Read",
                parameters: [
                    csharp.parameter({
                        ref: true,
                        name: "reader",
                        type: csharp.Type.reference(
                            csharp.classReference({
                                name: "Utf8JsonReader",
                                namespace: "System.Text.Json"
                            })
                        )
                    }),
                    csharp.parameter({
                        name: "typeToConvert",
                        type: csharp.Type.csharpType()
                    }),
                    csharp.parameter({
                        name: "options",
                        type: csharp.Type.reference(
                            csharp.classReference({
                                name: "JsonSerializerOptions",
                                namespace: "System.Text.Json"
                            })
                        )
                    })
                ],
                body: csharp.codeblock((writer) => {
                    const discriminatorPropName = this.unionDeclaration.discriminant.wireValue;
                    writer.writeTextStatement("var json = JsonElement.ParseValue(ref reader)");
                    writer.writeLine(
                        `if (!json.TryGetProperty("${discriminatorPropName}", out var discriminatorElement))`
                    );
                    writer.writeLine("{");
                    writer.indent();
                    writer.writeTextStatement(
                        `throw new JsonException("Missing discriminator property '${discriminatorPropName}'")`
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    writer.writeLine("if (discriminatorElement.ValueKind != JsonValueKind.String)");
                    writer.writeLine("{");
                    writer.indent();
                    writer.writeLine("if (discriminatorElement.ValueKind == JsonValueKind.Null)");
                    writer.writeLine("{");
                    writer.indent();
                    writer.writeTextStatement(
                        `throw new JsonException("Discriminator property '${discriminatorPropName}' is null")`
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    writer.writeLine();
                    writer.writeTextStatement(
                        `throw new JsonException($"Discriminator property '${discriminatorPropName}' is not a string, instead is {discriminatorElement.ToString()}")`
                    );
                    writer.dedent();
                    writer.writeLine("}");
                    writer.writeLine();
                    writer.writeLine("var discriminator = discriminatorElement.GetString() ?? ");
                    writer.writeTextStatement(
                        `throw new JsonException("Discriminator property '${discriminatorPropName}' is null")`
                    );
                    writer.writeLine();

                    writer.writeLine("var value = discriminator switch");
                    writer.writeLine("{");
                    writer.indent();

                    this.unionDeclaration.types.forEach((type) => {
                        const csharpType = this.getCsharpType(type);
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
                                    throw new Error(
                                        "Internal Error; noProperties should not be used for deserialization"
                                    );
                                default:
                                    assertNever(type.shape);
                            }
                            writer.write(".Deserialize<");
                            writer.writeNode(csharpType);
                            writer.write(">(options)");
                            if (csharpType.isOptional()) {
                                writer.writeLine(",");
                            } else {
                                const isReferenceType = csharpType.isReferenceType();
                                if (
                                    isReferenceType === true ||
                                    csharpType.internalType.type === "reference" ||
                                    csharpType.internalType.type === "coreReference"
                                ) {
                                    writer.write(' ?? throw new JsonException("Failed to deserialize ');
                                    writer.writeNode(csharpType);
                                    writer.writeLine('"),');
                                } else {
                                    writer.writeLine(",");
                                }
                            }
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
                        writer.writeLine("{");
                        writer.indent();
                        baseProperties.forEach((property) => {
                            writer.writeLine(`${property.name} = baseProperties.${property.name},`);
                        });
                        writer.dedent();
                        writer.write("}");
                    }
                    writer.writeSemicolonIfLastCharacterIsNot();
                    writer.writeLine();
                })
            })
        );

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                override: true,
                name: "Write",
                parameters: [
                    csharp.parameter({
                        name: "writer",
                        type: csharp.Type.reference(
                            csharp.classReference({
                                name: "Utf8JsonWriter",
                                namespace: "System.Text.Json"
                            })
                        )
                    }),
                    csharp.parameter({
                        name: "value",
                        type: unionReference
                    }),
                    csharp.parameter({
                        name: "options",
                        type: csharp.Type.reference(
                            csharp.classReference({
                                name: "JsonSerializerOptions",
                                namespace: "System.Text.Json"
                            })
                        )
                    })
                ],
                body: csharp.codeblock((writer) => {
                    const jsonObjReference = this.context.getJsonObjClassReference();
                    writer.writeNode(this.context.getJsonNodeClassReference());
                    writer.writeLine(` json = value.${this.discriminantPropertyName} switch`);
                    writer.writeLine("{");
                    writer.indent();
                    this.unionDeclaration.types.forEach((type) => {
                        writer.writeNode(csharp.string_({ string: type.discriminantValue.wireValue }));
                        writer.write(" => ");
                        switch (type.shape.propertiesType) {
                            case "samePropertiesAsObject":
                                writer.write("JsonSerializer.SerializeToNode(value.Value, options),");
                                break;
                            case "singleProperty":
                                writer.write("new ");
                                writer.writeNode(jsonObjReference);
                                writer.writeLine();
                                writer.writeLine("{");
                                writer.indent();
                                writer.writeLine(
                                    `["${type.shape.name.wireValue}"] = JsonSerializer.SerializeToNode(value.${this.valuePropertyName}, options)`
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
                    writer.dedent();
                    writer.write("} ?? new ");
                    writer.writeNode(jsonObjReference);
                    writer.writeTextStatement("()");
                    writer.writeTextStatement(
                        `json["${this.unionDeclaration.discriminant.wireValue}"] = value.${this.discriminantPropertyName}`
                    );
                    if (baseProperties.length > 0) {
                        writer.write("var basePropertiesJson = JsonSerializer.SerializeToNode(new ");
                        writer.writeNode(this.classReference);
                        writer.writeLine(".BaseProperties");
                        writer.writeLine("{");
                        writer.indent();
                        baseProperties.forEach((property) => {
                            writer.writeLine(`${property.name} = value.${property.name},`);
                        });
                        writer.dedent();
                        writer.write('}, options) ?? throw new JsonException("Failed to serialize ');
                        writer.writeNode(this.classReference);
                        writer.writeLine('.BaseProperties");');
                        writer.writeLine("foreach (var property in basePropertiesJson.AsObject())");
                        writer.writeLine("{");
                        writer.indent();
                        writer.writeLine("json[property.Key] = property.Value;");
                        writer.dedent();
                        writer.writeLine("}");
                    }
                    writer.writeTextStatement("json.WriteTo(writer, options)");
                })
            })
        );

        return class_;
    }

    private getCsharpType(type: FernIr.SingleUnionType): csharp.Type {
        const csharpType = this.unionMemberTypeMap.get(type);
        if (csharpType === undefined) {
            throw new Error("Could not find C# type for SingleUnionType");
        }
        return csharpType;
    }

    private getCsharpTypeMapEntry(
        type: FernIr.SingleUnionType,
        context: ModelGeneratorContext
    ): [FernIr.SingleUnionType, csharp.Type] {
        switch (type.shape.propertiesType) {
            case "noProperties":
                return [type, csharp.Type.object()];
            case "samePropertiesAsObject":
                return [
                    type,
                    csharp.Type.reference(
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
        innerValue: csharp.AstNode;
    }): csharp.AstNode {
        return csharp.instantiateClass({
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
    }): csharp.AstNode {
        switch (unionType.shape.type) {
            case "samePropertiesAsObject": {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(unionType.shape.typeId);
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
                return csharp.codeblock("");
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
    }): csharp.CodeBlock {
        if (this.shouldGenerateSnippet() === false) {
            this.context.logger.warn(
                `Generating snippet for union type ${this.classReference.name} but it has base properties, which is not supported.`
            );
        }
        const innerValue = this.generateInnerValueSnippet({ unionType: exampleUnion.singleUnionType, parseDatetimes });
        const innerObjectInstantiation = this.generateInnerUnionClassSnippet({ exampleUnion, innerValue });
        const instantiateClass = csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [innerObjectInstantiation]
        });
        return csharp.codeblock((writer) => writer.writeNode(instantiateClass));
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
