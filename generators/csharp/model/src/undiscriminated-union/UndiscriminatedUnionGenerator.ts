import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString, is, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";
import { PrimitiveTypeV1, TypeDeclaration, UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

interface UnionMemberInfo {
    typeReference: FernIr.TypeReference;
    csharpType: ast.Type;
    csharpTypeForTypeof: ast.Type; // Non-nullable version for typeof expressions
    discriminator: string; // "string", "int", "double", "bool", "dateTime", "guid", "null", etc.
    methodName: string; // "String", "Int", "Double", "Bool", "DateTime", "Guid", "Null", etc.
    isNull: boolean;
    index: number; // Used to disambiguate duplicate types
}

export class UndiscriminatedUnionGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ast.ClassReference;
    private readonly unionDeclaration: UndiscriminatedUnionTypeDeclaration;
    private readonly members: UnionMemberInfo[];

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        unionDeclaration: UndiscriminatedUnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);
        this.unionDeclaration = unionDeclaration;
        this.members = this.processMembers();
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
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
            ],
            summary: this.typeDeclaration.docs,
            access: ast.Access.Public,
            type: ast.Class.ClassType.Class
        });

        // Add private constructor
        const typeField = class_.addField({
            enclosingType: class_,
            summary: "Type discriminator",
            access: ast.Access.Public,
            type: this.Primitive.string,
            origin: class_.explicit("Type"),
            get: "public",
            set: "internal",
            annotations: [this.System.Text.Json.Serialization.JsonIgnore]
        });

        const valueField = class_.addField({
            enclosingType: class_,
            summary: "Union value",
            access: ast.Access.Public,
            type: this.Primitive.object.asOptional(),
            origin: class_.explicit("Value"),
            get: "public",
            set: "internal",
            annotations: [this.System.Text.Json.Serialization.JsonIgnore]
        });

        // Private constructor
        class_.addConstructor({
            access: ast.Access.Private,
            parameters: [
                this.csharp.parameter({
                    name: "type",
                    type: this.Primitive.string
                }),
                this.csharp.parameter({
                    name: "value",
                    type: this.Primitive.object.asOptional()
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeTextStatement(`${typeField.name} = type`);
                writer.writeTextStatement(`${valueField.name} = value`);
            })
        });

        // Generate factory methods
        for (const member of this.members) {
            this.generateFactoryMethod(class_, member);
        }

        // Generate IsX methods
        for (const member of this.members) {
            this.generateIsMethod(class_, member, typeField);
        }

        // Generate AsX methods
        for (const member of this.members) {
            this.generateAsMethod(class_, member, typeField, valueField);
        }

        // Generate TryGetX methods
        for (const member of this.members) {
            this.generateTryGetMethod(class_, member, typeField, valueField);
        }

        // Generate Match method
        this.generateMatchMethod(class_, typeField);

        // Generate Visit method
        this.generateVisitMethod(class_, typeField);

        // Generate ToString override
        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.Primitive.string,
            name: "ToString",
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeNode(
                    this.csharp.invokeMethod({
                        on: this.Types.JsonUtils,
                        method: "Serialize",
                        arguments_: [this.csharp.codeblock("this")]
                    })
                );
            })
        });

        // Generate implicit conversion operators (skip literals - they have fixed values)
        for (const member of this.members) {
            if (!member.isNull && !this.isLiteralType(member.typeReference)) {
                this.generateImplicitOperator(class_, member);
            }
        }

        // Generate equality methods
        this.generateEqualityMethods(class_, typeField, valueField);

        // Generate JSON converter
        this.generateJsonConverter(class_, typeField, valueField);

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

    private generateFactoryMethod(class_: ast.Class, member: UnionMemberInfo): void {
        const uniqueMethodName = this.getUniqueMethodName(member);

        if (member.isNull) {
            class_.addMethod({
                doc: {
                    summary: (writer) => writer.write("Factory method to create a union from a null value.")
                },
                access: ast.Access.Public,
                type: ast.MethodType.STATIC,
                return_: this.classReference,
                name: `From${uniqueMethodName}`,
                parameters: [],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`new("${member.discriminator}", null)`)
            });
        } else if (this.isLiteralType(member.typeReference)) {
            // Literals have a fixed value - no parameters
            const literalValue = this.getLiteralValue(member.typeReference);
            const literalValueString =
                typeof literalValue === "string" ? JSON.stringify(literalValue) : String(literalValue);

            class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write(`Factory method to create a union with the literal value ${literalValueString}.`);
                    }
                },
                access: ast.Access.Public,
                type: ast.MethodType.STATIC,
                return_: this.classReference,
                name: `From${uniqueMethodName}`,
                parameters: [],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`new("${member.discriminator}", ${literalValueString})`)
            });
        } else {
            class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write(`Factory method to create a union from a `);
                        writer.writeNode(member.csharpType);
                        writer.write(" value.");
                    }
                },
                access: ast.Access.Public,
                type: ast.MethodType.STATIC,
                return_: this.classReference,
                name: `From${uniqueMethodName}`,
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: member.csharpType
                    })
                ],
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock(`new("${member.discriminator}", value)`)
            });
        }
    }

    private generateIsMethod(class_: ast.Class, member: UnionMemberInfo, typeField: ast.Field): void {
        const uniqueMethodName = this.getUniqueMethodName(member);

        class_.addMethod({
            doc: {
                summary: (writer) =>
                    writer.write(`Returns true if <see cref="${typeField.name}"/> is "${member.discriminator}"`)
            },
            access: ast.Access.Public,
            return_: this.Primitive.boolean,
            name: `Is${uniqueMethodName}`,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: this.csharp.codeblock(`${typeField.name} == "${member.discriminator}"`)
        });
    }

    private generateAsMethod(
        class_: ast.Class,
        member: UnionMemberInfo,
        typeField: ast.Field,
        valueField: ast.Field
    ): void {
        const uniqueMethodName = this.getUniqueMethodName(member);

        if (member.isNull) {
            class_.addMethod({
                doc: {
                    summary: (writer) =>
                        writer.write(
                            `Returns the value as null if <see cref="${typeField.name}"/> is 'null', otherwise throws an exception.`
                        ),
                    exceptions: new Map([
                        [
                            this.names.classes.baseException,
                            (writer) => writer.write(`Thrown when <see cref="${typeField.name}"/> is not 'null'.`)
                        ]
                    ])
                },
                access: ast.Access.Public,
                return_: this.Primitive.object.asOptional(),
                name: `As${uniqueMethodName}`,
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.write(`Is${uniqueMethodName}() ? null : throw new `);
                    writer.writeNode(this.Types.BaseException);
                    writer.write(`("Union type is not 'null'")`);
                })
            });
        } else {
            class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write(`Returns the value as a <see cref="`);
                        writer.writeNode(member.csharpType);
                        writer.write(
                            `"/> if <see cref="${typeField.name}"/> is '${escapeForCSharpString(member.discriminator)}', otherwise throws an exception.`
                        );
                    },
                    exceptions: new Map([
                        [
                            this.names.classes.baseException,
                            (writer) =>
                                writer.write(
                                    `Thrown when <see cref="${typeField.name}"/> is not '${escapeForCSharpString(member.discriminator)}'.`
                                )
                        ]
                    ])
                },
                access: ast.Access.Public,
                return_: member.csharpType,
                name: `As${uniqueMethodName}`,
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.write(`Is${uniqueMethodName}() ? `);
                    if (!is.Primitive.object(member.csharpType.asNonOptional())) {
                        writer.write("(", member.csharpType, ")");
                    }
                    writer.write(`${valueField.name}! : throw new `);
                    writer.writeNode(this.Types.BaseException);
                    writer.write(`("Union type is not '${escapeForCSharpString(member.discriminator)}'")`);
                })
            });
        }
    }

    private generateTryGetMethod(
        class_: ast.Class,
        member: UnionMemberInfo,
        typeField: ast.Field,
        valueField: ast.Field
    ): void {
        const uniqueMethodName = this.getUniqueMethodName(member);

        if (member.isNull) {
            class_.addMethod({
                doc: {
                    summary: (writer) =>
                        writer.write("Attempts to verify the value is null and returns true if successful.")
                },
                access: ast.Access.Public,
                return_: this.Primitive.boolean,
                name: `TryGet${uniqueMethodName}`,
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: this.Primitive.object.asOptional(),
                        out: true
                    })
                ],
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.writeLine(`if(${typeField.name} == "${member.discriminator}")`);
                    writer.pushScope();
                    writer.writeTextStatement("value = null");
                    writer.writeTextStatement("return true");
                    writer.popScope();
                    writer.writeTextStatement("value = default");
                    writer.writeTextStatement("return false");
                })
            });
        } else {
            class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write(`Attempts to cast the value to a <see cref="`);
                        writer.writeNode(member.csharpType);
                        writer.write(`"/> and returns true if successful.`);
                    }
                },
                access: ast.Access.Public,
                return_: this.Primitive.boolean,
                name: `TryGet${uniqueMethodName}`,
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: member.csharpType.asOptional(),
                        out: true
                    })
                ],
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.writeLine(`if(${typeField.name} == "${member.discriminator}")`);
                    writer.pushScope();
                    writer.write("value = ");
                    if (!is.Primitive.object(member.csharpType.asNonOptional())) {
                        writer.write("(", member.csharpType, ")");
                    }
                    writer.writeTextStatement(`${valueField.name}!`);
                    writer.writeTextStatement("return true");
                    writer.popScope();
                    writer.writeTextStatement("value = null");
                    writer.writeTextStatement("return false");
                })
            });
        }
    }

    private generateMatchMethod(class_: ast.Class, typeField: ast.Field): void {
        const tType = this.Types.Arbitrary("T");
        const parameters = this.members.map((member) => {
            const uniqueParamName = this.getUniqueParameterName(member);
            if (member.isNull) {
                return this.csharp.parameter({
                    name: uniqueParamName,
                    type: this.System.Func([], tType)
                });
            }
            return this.csharp.parameter({
                name: uniqueParamName,
                type: this.System.Func([member.csharpType], tType)
            });
        });

        class_.addMethod({
            access: ast.Access.Public,
            name: "Match",
            return_: tType,
            typeParameters: [tType],
            parameters,
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine(`return ${typeField.name} switch`);
                writer.pushScope();
                this.members.forEach((member) => {
                    const uniqueParamName = this.getUniqueParameterName(member);
                    const uniqueMethodName = this.getUniqueMethodName(member);
                    writer.write(`"${member.discriminator}" => `);
                    if (member.isNull) {
                        writer.writeLine(`${uniqueParamName}(),`);
                    } else {
                        writer.writeLine(`${uniqueParamName}(As${uniqueMethodName}()),`);
                    }
                });
                writer.write(`_ => throw new `);
                writer.writeNode(this.Types.BaseException);
                writer.writeLine(`($"Unknown union type: {${typeField.name}}")`);
                writer.dedent();
                writer.writeTextStatement("}");
            })
        });
    }

    private generateVisitMethod(class_: ast.Class, typeField: ast.Field): void {
        const parameters = this.members.map((member) => {
            const uniqueParamName = this.getUniqueParameterName(member);
            if (member.isNull) {
                return this.csharp.parameter({
                    name: uniqueParamName,
                    type: this.System.Action()
                });
            }
            return this.csharp.parameter({
                name: uniqueParamName,
                type: this.System.Action([member.csharpType])
            });
        });

        class_.addMethod({
            access: ast.Access.Public,
            name: "Visit",
            parameters,
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine(`switch (${typeField.name})`);
                writer.pushScope();
                this.members.forEach((member) => {
                    const uniqueParamName = this.getUniqueParameterName(member);
                    const uniqueMethodName = this.getUniqueMethodName(member);
                    writer.writeLine(`case "${member.discriminator}":`);
                    writer.indent();
                    if (member.isNull) {
                        writer.writeTextStatement(`${uniqueParamName}()`);
                    } else {
                        writer.writeTextStatement(`${uniqueParamName}(As${uniqueMethodName}())`);
                    }
                    writer.writeTextStatement("break");
                    writer.dedent();
                });
                writer.writeLine("default:");
                writer.indent();
                writer.write(`throw new `);
                writer.writeNode(this.Types.BaseException);
                writer.writeTextStatement(`($"Unknown union type: {${typeField.name}}")`);
                writer.popScope();
            })
        });
    }

    private generateEqualityMethods(class_: ast.Class, _typeField: ast.Field, _valueField: ast.Field): void {
        // Override Equals method for value-based equality
        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.Primitive.boolean,
            name: "Equals",
            parameters: [
                this.csharp.parameter({
                    name: "obj",
                    type: this.Primitive.object.asOptional()
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine("if (obj is null) return false;");
                writer.writeLine("if (ReferenceEquals(this, obj)) return true;");
                writer.write("if (obj is not ");
                writer.writeNode(this.classReference);
                writer.writeLine(" other) return false;");
                writer.writeLine();
                writer.writeLine("// Compare type discriminators");
                writer.writeLine("if (Type != other.Type) return false;");
                writer.writeLine();
                writer.writeLine("// Compare values using EqualityComparer for deep comparison");
                writer.writeLine(
                    "return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(Value, other.Value);"
                );
            })
        });

        // Override GetHashCode method
        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: this.Primitive.integer,
            name: "GetHashCode",
            parameters: [],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine("unchecked");
                writer.writeLine("{");
                writer.indent();
                writer.writeLine("var hashCode = Type.GetHashCode();");
                writer.writeLine("if (Value != null)");
                writer.writeLine("{");
                writer.indent();
                writer.writeLine("hashCode = (hashCode * 397) ^ Value.GetHashCode();");
                writer.dedent();
                writer.writeLine("}");
                writer.writeLine("return hashCode;");
                writer.dedent();
                writer.writeLine("}");
            })
        });
    }

    private generateImplicitOperator(class_: ast.Class, member: UnionMemberInfo): void {
        if (is.Primitive.object(member.csharpType.asNonOptional())) {
            // Can't have implicit cast from object
            return;
        }

        if (this.isInterfaceType(member)) {
            // Can't have implicit cast from interface types (IEnumerable, etc.)
            return;
        }

        class_.addOperator({
            type: ast.Class.CastOperator.Type.Implicit,
            parameter: this.csharp.parameter({
                name: "value",
                type: member.csharpType
            }),
            useExpressionBody: true,
            body: this.csharp.codeblock(`new("${member.discriminator}", value)`)
        });
    }

    private generateJsonConverter(class_: ast.Class, typeField: ast.Field, valueField: ast.Field): void {
        const unionReference = this.classReference;
        const converterClass = this.csharp.class_({
            origin: class_.explicit("JsonConverter"),
            access: ast.Access.Internal,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            sealed: true,
            parentClassReference: this.System.Text.Json.Serialization.JsonConverter(unionReference),
            annotations: [this.System.Serializable]
        });

        const hasNullMember = this.members.some((m) => m.isNull);

        // Only override HandleNull if null is a union member
        if (hasNullMember) {
            converterClass.addField({
                enclosingType: converterClass,
                access: ast.Access.Public,
                type: this.Primitive.boolean,
                origin: converterClass.explicit("HandleNull"),
                get: true,
                set: false,
                override: true,
                summary: "Override to handle null tokens in the converter (null is a valid union member)",
                initializer: this.csharp.codeblock("true")
            });
        }

        // Read method
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
                // Handle null
                writer.writeLine("if (reader.TokenType == JsonTokenType.Null)");
                writer.pushScope();
                if (hasNullMember) {
                    writer.writeLine("if (HandleNull)");
                    writer.pushScope();
                    writer.writeNode(unionReference);
                    writer.writeTextStatement(' result = new("null", null)');
                    writer.writeTextStatement("return result");
                    writer.popScope();
                }
                writer.writeTextStatement("return null");
                writer.popScope();
                writer.writeLine();

                // Generate parsing logic
                this.generateParsingLogic(writer, unionReference);

                writer.writeLine();
                writer.write(`throw new JsonException($"Cannot deserialize JSON token {reader.TokenType} into `);
                writer.writeNode(unionReference);
                writer.writeTextStatement('")');
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
                    type: unionReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine("if (value == null)");
                writer.pushScope();
                writer.writeTextStatement("writer.WriteNullValue()");
                writer.writeTextStatement("return");
                writer.popScope();
                writer.writeLine();

                writer.writeLine(`value.Visit(`);
                writer.indent();
                this.members.forEach((member, index) => {
                    const isLast = index === this.members.length - 1;
                    if (member.isNull) {
                        writer.write("() => writer.WriteNullValue()");
                    } else {
                        this.generateWriteCase(writer, member);
                    }
                    if (!isLast) {
                        writer.writeLine(",");
                    } else {
                        writer.writeLine();
                    }
                });
                writer.dedent();
                writer.writeTextStatement(")");
            })
        });

        // ReadAsPropertyName method - for dictionary key deserialization
        converterClass.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: unionReference.asOptional(),
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
                writer.writeTextStatement("var stringValue = reader.GetString()!");
                writer.writeNode(unionReference);
                writer.writeTextStatement(' result = new("string", stringValue)');
                writer.writeTextStatement("return result");
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
                    type: unionReference
                }),
                this.csharp.parameter({
                    name: "options",
                    type: this.System.Text.Json.JsonSerializerOptions
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeTextStatement(`writer.WritePropertyName(value.Value?.ToString() ?? "null")`);
            })
        });

        class_.addNestedClass(converterClass);
    }

    private generateParsingLogic(writer: Writer, unionReference: ast.ClassReference): void {
        // Detect types and organize parsing strategy
        const hasNumber = this.members.some(
            (m) =>
                this.isPrimitiveType(m, ["int", "double", "long", "float"]) ||
                m.discriminator.startsWith("int_") ||
                m.discriminator.startsWith("double_") ||
                m.discriminator.startsWith("long_") ||
                m.discriminator.startsWith("float_")
        );
        const hasString = this.members.some(
            (m) => m.discriminator === "string" || m.discriminator.startsWith("string_")
        );
        const hasDateTime = this.members.some(
            (m) => m.discriminator === "dateTime" || m.discriminator.startsWith("dateTime_")
        );
        const hasGuid = this.members.some((m) => m.discriminator === "guid" || m.discriminator.startsWith("guid_"));
        const hasBool = this.members.some((m) => m.discriminator === "bool" || m.discriminator.startsWith("bool_"));
        const hasLiteral = this.members.some((m) => this.isLiteralType(m.typeReference));
        const hasArray = this.members.some((m) => this.isContainerType(m.typeReference));
        const hasObject = this.members.some((m) => this.isNamedType(m.typeReference));

        // Handle number tokens
        if (hasNumber) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.Number)");
            writer.pushScope();
            this.generateNumberParsing(writer, unionReference);
            writer.popScope();
            writer.writeLine();
        }

        // Handle boolean tokens
        if (hasBool) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.True || reader.TokenType == JsonTokenType.False)");
            writer.pushScope();
            const boolMember = this.members.find(
                (m) => m.discriminator === "bool" || m.discriminator.startsWith("bool_")
            );
            if (boolMember) {
                writer.writeNode(unionReference);
                writer.writeTextStatement(` boolResult = new("${boolMember.discriminator}", reader.GetBoolean())`);
                writer.writeTextStatement("return boolResult");
            }
            writer.popScope();
            writer.writeLine();
        }

        // Handle string tokens (most complex - need to try parsing different types)
        if (hasString || hasDateTime || hasGuid || hasLiteral) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.String)");
            writer.pushScope();
            writer.writeTextStatement("var stringValue = reader.GetString()!");
            writer.writeLine();
            this.generateStringParsing(writer, unionReference, hasGuid, hasDateTime, hasLiteral);
            writer.popScope();
            writer.writeLine();
        }

        // Handle array tokens for collections
        if (hasArray) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.StartArray)");
            writer.pushScope();
            this.generateArrayParsing(writer, unionReference);
            writer.popScope();
            writer.writeLine();
        }

        // Handle object tokens for named types
        if (hasObject) {
            writer.writeLine("if (reader.TokenType == JsonTokenType.StartObject)");
            writer.pushScope();
            this.generateObjectParsing(writer, unionReference);
            writer.popScope();
        }
    }

    private generateNumberParsing(writer: Writer, unionReference: ast.ClassReference): void {
        const numberMembers = this.members.filter(
            (m) =>
                this.isPrimitiveType(m, ["int", "long", "double", "float"]) ||
                m.discriminator.startsWith("int_") ||
                m.discriminator.startsWith("long_") ||
                m.discriminator.startsWith("double_") ||
                m.discriminator.startsWith("float_")
        );

        // Try int first, then long, then double
        const intMember = numberMembers.find((m) => m.discriminator === "int" || m.discriminator.startsWith("int_"));
        const longMember = numberMembers.find((m) => m.discriminator === "long" || m.discriminator.startsWith("long_"));
        const doubleMember = numberMembers.find(
            (m) => m.discriminator === "double" || m.discriminator.startsWith("double_")
        );

        if (intMember) {
            writer.writeLine("if (reader.TryGetInt32(out var intValue))");
            writer.pushScope();
            writer.writeNode(unionReference);
            writer.writeTextStatement(` intResult = new("${intMember.discriminator}", intValue)`);
            writer.writeTextStatement("return intResult");
            writer.popScope();
            writer.writeLine();
        }

        if (longMember) {
            writer.writeLine("if (reader.TryGetInt64(out var longValue))");
            writer.pushScope();
            writer.writeNode(unionReference);
            writer.writeTextStatement(` longResult = new("${longMember.discriminator}", longValue)`);
            writer.writeTextStatement("return longResult");
            writer.popScope();
            writer.writeLine();
        }

        if (doubleMember) {
            writer.writeNode(unionReference);
            writer.writeTextStatement(` doubleResult = new("${doubleMember.discriminator}", reader.GetDouble())`);
            writer.writeTextStatement("return doubleResult");
        }
    }

    private generateStringParsing(
        writer: Writer,
        unionReference: ast.ClassReference,
        hasGuid: boolean,
        hasDateTime: boolean,
        hasLiteral: boolean
    ): void {
        // Try literals first - they're the most specific (exact string match)
        if (hasLiteral) {
            const literalMembers = this.members.filter((m) => this.isLiteralType(m.typeReference));
            for (const literalMember of literalMembers) {
                const literalValue = this.getLiteralValue(literalMember.typeReference);
                if (literalValue !== undefined && typeof literalValue === "string") {
                    writer.writeLine(`if (stringValue == ${JSON.stringify(literalValue)})`);
                    writer.pushScope();
                    writer.writeNode(unionReference);
                    writer.writeTextStatement(` literalResult = new("${literalMember.discriminator}", stringValue)`);
                    writer.writeTextStatement("return literalResult");
                    writer.popScope();
                    writer.writeLine();
                }
            }
        }

        // Try most specific types first
        if (hasGuid) {
            const guidMember = this.members.find(
                (m) => m.discriminator === "guid" || m.discriminator.startsWith("guid_")
            );
            if (guidMember) {
                writer.writeLine("if (Guid.TryParse(stringValue, out var guidValue))");
                writer.pushScope();
                writer.writeNode(unionReference);
                writer.writeTextStatement(` guidResult = new("${guidMember.discriminator}", guidValue)`);
                writer.writeTextStatement("return guidResult");
                writer.popScope();
                writer.writeLine();
            }
        }

        if (hasDateTime) {
            const dateTimeMember = this.members.find(
                (m) => m.discriminator === "dateTime" || m.discriminator.startsWith("dateTime_")
            );
            if (dateTimeMember) {
                writer.writeLine("if (System.DateTime.TryParse(stringValue, out var dateTimeValue))");
                writer.pushScope();
                writer.writeNode(unionReference);
                writer.writeTextStatement(` dateTimeResult = new("${dateTimeMember.discriminator}", dateTimeValue)`);
                writer.writeTextStatement("return dateTimeResult");
                writer.popScope();
                writer.writeLine();
            }
        }

        // Try parsing as int if int is in the union
        const intMember = this.members.find((m) => m.discriminator === "int" || m.discriminator.startsWith("int_"));
        if (intMember) {
            writer.writeLine("if (int.TryParse(stringValue, out var intFromStringValue))");
            writer.pushScope();
            writer.writeNode(unionReference);
            writer.writeTextStatement(` intFromStringResult = new("${intMember.discriminator}", intFromStringValue)`);
            writer.writeTextStatement("return intFromStringResult");
            writer.popScope();
            writer.writeLine();
        }

        // Fall back to string
        const stringMember = this.members.find(
            (m) => m.discriminator === "string" || m.discriminator.startsWith("string_")
        );
        if (stringMember) {
            writer.writeNode(unionReference);
            writer.writeTextStatement(` stringResult = new("${stringMember.discriminator}", stringValue)`);
            writer.writeTextStatement("return stringResult");
        }
    }

    private generateWriteCase(writer: Writer, member: UnionMemberInfo): void {
        switch (member.discriminator) {
            case "string":
                writer.write("str => writer.WriteStringValue(str)");
                break;
            case "int":
                writer.write("num => writer.WriteNumberValue(num)");
                break;
            case "long":
                writer.write("num => writer.WriteNumberValue(num)");
                break;
            case "double":
                writer.write("num => writer.WriteNumberValue(num)");
                break;
            case "float":
                writer.write("num => writer.WriteNumberValue(num)");
                break;
            case "bool":
                writer.write("b => writer.WriteBooleanValue(b)");
                break;
            case "dateTime":
                writer.write('dt => writer.WriteStringValue(dt.ToString("O"))'); // ISO 8601
                break;
            case "guid":
                writer.write("g => writer.WriteStringValue(g.ToString())");
                break;
            default:
                // For complex types, use JsonSerializer
                writer.write("obj => JsonSerializer.Serialize(writer, obj, options)");
                break;
        }
    }

    private processMembers(): UnionMemberInfo[] {
        const memberInfos: UnionMemberInfo[] = [];
        const methodNameCounts = new Map<string, number>();
        const discriminatorCounts = new Map<string, number>();
        const reservedNames = new Set(["Type", "Value"]);

        for (const member of this.unionDeclaration.members) {
            // Unwrap outer nullable/optional before converting to C# type
            const unwrappedType = this.unwrapOuterNullableOptional(member.type);

            const csharpType = this.context.csharpTypeMapper.convert({
                reference: unwrappedType,
                fullyQualified: true
            });

            // For typeof, we need the non-nullable version of the type
            // typeof(Dictionary<string, object?>?) is invalid, must be typeof(Dictionary<string, object?>)
            // Use the ORIGINAL type (before unwrapping) with unboxOptionals=true
            // This ensures named type aliases like OptionalMetadata (which is optional<map<T>>)
            // get converted without the trailing ? for use in typeof expressions
            const csharpTypeForTypeof = this.context.csharpTypeMapper.convert({
                reference: member.type, // Use original type, not unwrapped
                fullyQualified: true,
                unboxOptionals: true
            });

            let { discriminator, methodName, isNull } = this.getTypeInfo(unwrappedType);

            // Check if method name collides with reserved property names
            if (reservedNames.has(methodName)) {
                methodName = `${methodName}Member`;
            }

            // Track discriminator usage to handle duplicates
            const discriminatorCount = discriminatorCounts.get(discriminator) ?? 0;
            discriminatorCounts.set(discriminator, discriminatorCount + 1);

            // Track method name usage to handle duplicates
            const methodNameCount = methodNameCounts.get(methodName) ?? 0;
            methodNameCounts.set(methodName, methodNameCount + 1);

            // Make discriminator unique if there are duplicates
            const uniqueDiscriminator =
                discriminatorCount > 0 ? `${discriminator}_${discriminatorCount}` : discriminator;

            // Generate descriptive method name for container types and duplicates
            let descriptiveMethodName = methodName;
            const isContainer = this.isContainerType(unwrappedType);
            if (methodNameCount > 0 || isContainer) {
                descriptiveMethodName = this.getDescriptiveMethodName(unwrappedType, methodName);
            }

            memberInfos.push({
                typeReference: unwrappedType,
                csharpType,
                csharpTypeForTypeof,
                discriminator: uniqueDiscriminator,
                methodName: descriptiveMethodName,
                isNull,
                index: methodNameCount
            });
        }

        return memberInfos;
    }

    private getTypeInfo(typeReference: FernIr.TypeReference): {
        discriminator: string;
        methodName: string;
        isNull: boolean;
    } {
        return typeReference._visit<{ discriminator: string; methodName: string; isNull: boolean }>({
            container: (container) => {
                return container._visit<{ discriminator: string; methodName: string; isNull: boolean }>({
                    list: () => ({ discriminator: "list", methodName: "List", isNull: false }),
                    set: () => ({ discriminator: "set", methodName: "Set", isNull: false }),
                    map: () => ({ discriminator: "map", methodName: "Map", isNull: false }),
                    optional: () => {
                        throw new Error("Optional should have been unwrapped before calling getTypeInfo");
                    },
                    nullable: () => {
                        throw new Error("Nullable should have been unwrapped before calling getTypeInfo");
                    },
                    literal: (literal) => {
                        // Generate discriminator from the literal value
                        const literalValue = literal._visit<string | boolean>({
                            string: (value) => value,
                            boolean: (value) => value,
                            _other: () => "literal"
                        });

                        // Convert to camelCase discriminator and PascalCase method name
                        const discriminator =
                            typeof literalValue === "string" ? this.toCamelCase(literalValue) : literalValue.toString();
                        const methodName =
                            typeof literalValue === "string"
                                ? literalValue.charAt(0).toUpperCase() + literalValue.slice(1)
                                : literalValue.toString().charAt(0).toUpperCase() + literalValue.toString().slice(1);

                        return { discriminator, methodName, isNull: false };
                    },
                    _other: () => ({ discriminator: "unknown", methodName: "Unknown", isNull: false })
                });
            },
            named: (namedType) => {
                const typeName = namedType.name.pascalCase.safeName;
                return { discriminator: this.toCamelCase(typeName), methodName: typeName, isNull: false };
            },
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => ({ discriminator: "string", methodName: "String", isNull: false }),
                    integer: () => ({ discriminator: "int", methodName: "Int", isNull: false }),
                    long: () => ({ discriminator: "long", methodName: "Long", isNull: false }),
                    double: () => ({ discriminator: "double", methodName: "Double", isNull: false }),
                    boolean: () => ({ discriminator: "bool", methodName: "Bool", isNull: false }),
                    dateTime: () => ({ discriminator: "dateTime", methodName: "DateTime", isNull: false }),
                    uuid: () => ({ discriminator: "guid", methodName: "Guid", isNull: false }),
                    base64: () => ({ discriminator: "string", methodName: "String", isNull: false }),
                    date: () => ({ discriminator: "dateOnly", methodName: "DateOnly", isNull: false }),
                    bigInteger: () => ({ discriminator: "bigInteger", methodName: "BigInteger", isNull: false }),
                    float: () => ({ discriminator: "float", methodName: "Float", isNull: false }),
                    uint: () => ({ discriminator: "uint", methodName: "UInt", isNull: false }),
                    uint64: () => ({ discriminator: "ulong", methodName: "ULong", isNull: false }),
                    _other: () => ({ discriminator: "unknown", methodName: "Unknown", isNull: false })
                });
            },
            unknown: () => ({ discriminator: "unknown", methodName: "Unknown", isNull: false }),
            _other: () => ({ discriminator: "unknown", methodName: "Unknown", isNull: false })
        });
    }

    /**
     * Unwraps only the outermost nullable/optional wrapper from a type reference.
     * Does not recursively unwrap nested nullable/optional wrappers.
     */
    private unwrapOuterNullableOptional(typeReference: FernIr.TypeReference): FernIr.TypeReference {
        return typeReference._visit<FernIr.TypeReference>({
            container: (container) => {
                return container._visit<FernIr.TypeReference>({
                    optional: (innerType) => innerType,
                    nullable: (innerType) => innerType,
                    list: () => typeReference,
                    set: () => typeReference,
                    map: () => typeReference,
                    literal: () => typeReference,
                    _other: () => typeReference
                });
            },
            named: () => typeReference,
            primitive: () => typeReference,
            unknown: () => typeReference,
            _other: () => typeReference
        });
    }

    private isContainerType(typeReference: FernIr.TypeReference): boolean {
        // First unwrap any outermost nullable/optional
        const unwrapped = this.unwrapOuterNullableOptional(typeReference);

        return unwrapped._visit<boolean>({
            container: (container) => {
                return container._visit<boolean>({
                    list: () => true,
                    set: () => true,
                    map: () => true,
                    optional: () => false, // Should not reach here after unwrapping
                    nullable: () => false, // Should not reach here after unwrapping
                    literal: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    private isMapType(typeReference: FernIr.TypeReference): boolean {
        // First unwrap any outermost nullable/optional
        const unwrapped = this.unwrapOuterNullableOptional(typeReference);

        return unwrapped._visit<boolean>({
            container: (container) => {
                return container._visit<boolean>({
                    map: () => true,
                    list: () => false,
                    set: () => false,
                    optional: () => false,
                    nullable: () => false,
                    literal: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    private isLiteralType(typeReference: FernIr.TypeReference): boolean {
        // First unwrap any outermost nullable/optional
        const unwrapped = this.unwrapOuterNullableOptional(typeReference);

        return unwrapped._visit<boolean>({
            container: (container) => {
                return container._visit<boolean>({
                    literal: () => true,
                    list: () => false,
                    set: () => false,
                    map: () => false,
                    optional: () => false,
                    nullable: () => false,
                    _other: () => false
                });
            },
            named: () => false,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    private getLiteralValue(typeReference: FernIr.TypeReference): string | boolean | undefined {
        // First unwrap any outermost nullable/optional
        const unwrapped = this.unwrapOuterNullableOptional(typeReference);

        return unwrapped._visit<string | boolean | undefined>({
            container: (container) => {
                return container._visit<string | boolean | undefined>({
                    literal: (literal) => {
                        return literal._visit<string | boolean | undefined>({
                            string: (value) => value,
                            boolean: (value) => value,
                            _other: () => undefined
                        });
                    },
                    list: () => undefined,
                    set: () => undefined,
                    map: () => undefined,
                    optional: () => undefined,
                    nullable: () => undefined,
                    _other: () => undefined
                });
            },
            named: () => undefined,
            primitive: () => undefined,
            unknown: () => undefined,
            _other: () => undefined
        });
    }

    private isPrimitiveType(member: UnionMemberInfo, types: string[]): boolean {
        return types.includes(member.discriminator);
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    private getDescriptiveMethodName(typeReference: FernIr.TypeReference, baseMethodName: string): string {
        // Generate a descriptive method name based on the actual type
        return typeReference._visit<string>({
            container: (container) => {
                return container._visit<string>({
                    list: (itemType) => {
                        const innerName = this.getInnerTypeName(itemType);
                        return `${baseMethodName}Of${innerName}`;
                    },
                    set: (itemType) => {
                        const innerName = this.getInnerTypeName(itemType);
                        return `${baseMethodName}Of${innerName}`;
                    },
                    map: (mapType) => {
                        const keyName = this.getInnerTypeName(mapType.keyType);
                        const valueName = this.getInnerTypeName(mapType.valueType);
                        return `${baseMethodName}Of${keyName}To${valueName}`;
                    },
                    optional: (innerType) => this.getDescriptiveMethodName(innerType, baseMethodName),
                    nullable: (innerType) => this.getDescriptiveMethodName(innerType, baseMethodName),
                    literal: () => baseMethodName,
                    _other: () => baseMethodName
                });
            },
            named: (namedType) => namedType.name.pascalCase.safeName,
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => "String",
                    integer: () => "Int",
                    long: () => "Long",
                    double: () => "Double",
                    boolean: () => "Bool",
                    dateTime: () => "DateTime",
                    uuid: () => "Guid",
                    base64: () => "String",
                    date: () => "DateOnly",
                    bigInteger: () => "BigInteger",
                    float: () => "Float",
                    uint: () => "UInt",
                    uint64: () => "ULong",
                    _other: () => baseMethodName
                });
            },
            unknown: () => baseMethodName,
            _other: () => baseMethodName
        });
    }

    private getInnerTypeName(typeReference: FernIr.TypeReference): string {
        return typeReference._visit<string>({
            container: (container) => {
                return container._visit<string>({
                    list: (itemType) => `ListOf${this.getInnerTypeName(itemType)}`,
                    set: (itemType) => `SetOf${this.getInnerTypeName(itemType)}`,
                    map: (mapType) =>
                        `MapOf${this.getInnerTypeName(mapType.keyType)}To${this.getInnerTypeName(mapType.valueType)}`,
                    optional: (innerType) => this.getInnerTypeName(innerType),
                    nullable: (innerType) => this.getInnerTypeName(innerType),
                    literal: () => "Literal",
                    _other: () => "Unknown"
                });
            },
            named: (namedType) => namedType.name.pascalCase.safeName,
            primitive: (primitive) => {
                return PrimitiveTypeV1._visit(primitive.v1, {
                    string: () => "String",
                    integer: () => "Int",
                    long: () => "Long",
                    double: () => "Double",
                    boolean: () => "Bool",
                    dateTime: () => "DateTime",
                    uuid: () => "Guid",
                    base64: () => "String",
                    date: () => "DateOnly",
                    bigInteger: () => "BigInteger",
                    float: () => "Float",
                    uint: () => "UInt",
                    uint64: () => "ULong",
                    _other: () => "Unknown"
                });
            },
            unknown: () => "Unknown",
            _other: () => "Unknown"
        });
    }

    private getUniqueMethodName(member: UnionMemberInfo): string {
        // The methodName is already descriptive and unique
        return member.methodName;
    }

    private getUniqueParameterName(member: UnionMemberInfo): string {
        // Use the descriptive method name for parameters
        return `on${member.methodName}`;
    }

    private isInterfaceType(member: UnionMemberInfo): boolean {
        // Check if the type is a container (list, set, map) which would be IEnumerable in C#
        // Interfaces cannot be used in implicit conversion operators in C#
        return (
            member.discriminator === "list" ||
            member.discriminator === "set" ||
            member.discriminator === "map" ||
            member.discriminator.startsWith("list_") ||
            member.discriminator.startsWith("set_") ||
            member.discriminator.startsWith("map_")
        );
    }

    private isNamedType(typeReference: FernIr.TypeReference): boolean {
        return typeReference._visit<boolean>({
            named: () => true,
            container: () => false,
            primitive: () => false,
            unknown: () => false,
            _other: () => false
        });
    }

    /**
     * Compare two union members for specificity ordering.
     * Returns negative if 'a' is more specific than 'b' (should come first),
     * positive if 'a' is less specific (should come after), 0 if equal.
     *
     * Specificity rules (most specific to least specific):
     * 1. Concrete types (HashSet, List) > Interface types (IEnumerable)
     * 2. Nested containers (list<list<int>>) > simple containers (list<int>)
     * 3. Named types with more properties > types with fewer properties (approximated by type name)
     * 4. Specific types (NamedMetadata) > generic types (Dictionary<string, object>)
     * 5. When in doubt, preserve original order (return 0)
     */
    private compareTypeSpecificity(a: UnionMemberInfo, b: UnionMemberInfo): number {
        const specificityA = this.getTypeSpecificityScore(a.typeReference);
        const specificityB = this.getTypeSpecificityScore(b.typeReference);
        // Higher score = more specific, so reverse the comparison for descending order
        return specificityB - specificityA;
    }

    /**
     * Calculate a specificity score for a type reference.
     * Higher scores = more specific types that should be tried first.
     *
     * Scoring rules (most to least specific):
     * - Literals: 10000 (exact value match)
     * - Named types: 8000+ (user-defined types always before generic containers)
     * - Primitives: DateTime (9000) > Guid (8000) > numbers (5500-7000) > bool (5000) > string (4000)
     * - Containers: 1000-3500 (set > map > list, based on inner type specificity)
     * - Unknown: 0 (least specific, matches anything)
     */
    private getTypeSpecificityScore(typeReference: FernIr.TypeReference): number {
        return typeReference._visit<number>({
            container: (container) => {
                return container._visit<number>({
                    list: (itemType) => {
                        // Base score for lists (IEnumerable is generic interface, least specific container)
                        const baseScore = 1000;
                        // Inner type determines specificity
                        return baseScore + this.getTypeSpecificityScore(itemType);
                    },
                    set: (itemType) => {
                        // Sets (HashSet) are more specific than lists due to concrete type
                        const baseScore = 2000;
                        return baseScore + this.getTypeSpecificityScore(itemType);
                    },
                    map: (mapType) => {
                        // Maps have medium specificity
                        const baseScore = 1500;
                        const keyScore = this.getTypeSpecificityScore(mapType.keyType);
                        const valueScore = this.getTypeSpecificityScore(mapType.valueType);
                        return baseScore + keyScore + valueScore;
                    },
                    optional: (innerType) => this.getTypeSpecificityScore(innerType),
                    nullable: (innerType) => this.getTypeSpecificityScore(innerType),
                    literal: () => 10000, // Literals are most specific
                    _other: () => 0
                });
            },
            named: (namedType) => {
                // Resolve the named type to see if it's an alias to a container or an actual object
                const typeDeclaration = this.context.ir.types[namedType.typeId];
                if (typeDeclaration == null) {
                    // Fallback: treat as specific named type
                    const memberIndex = this.members.findIndex((m) => m.typeReference === typeReference);
                    return 8000 - memberIndex;
                }

                // Check what the named type actually is
                return typeDeclaration.shape._visit<number>({
                    alias: (aliasDeclaration) => {
                        // Type alias - score based on what it aliases
                        return this.getTypeSpecificityScore(aliasDeclaration.aliasOf);
                    },
                    object: () => {
                        // Actual object type - these are more specific than containers
                        const baseScore = 8000;
                        const memberIndex = this.members.findIndex((m) => m.typeReference === typeReference);
                        return baseScore - memberIndex;
                    },
                    enum: () => {
                        // Enums are very specific
                        return 9500;
                    },
                    undiscriminatedUnion: () => {
                        // Nested unions - treat as moderately specific
                        return 7000;
                    },
                    union: () => {
                        // Discriminated unions - treat as moderately specific
                        return 7000;
                    },
                    _other: () => {
                        // Fallback
                        const memberIndex = this.members.findIndex((m) => m.typeReference === typeReference);
                        return 8000 - memberIndex;
                    }
                });
            },
            primitive: (primitive) => {
                // Primitive specificity: most specific to least specific
                return PrimitiveTypeV1._visit(primitive.v1, {
                    dateTime: () => 9000, // Most specific parseable from string
                    uuid: () => 8000, // Very specific format (GUID)
                    long: () => 7000, // More specific than double (no decimals)
                    integer: () => 6500, // Similar to long but smaller range
                    double: () => 6000, // Less specific (accepts more values)
                    float: () => 5500, // Similar to double
                    uint: () => 7000, // Specific (unsigned)
                    uint64: () => 7000, // Specific (unsigned long)
                    bigInteger: () => 6000, // Generic big number
                    boolean: () => 5000, // Bool is fairly specific
                    string: () => 4000, // Strings are generic (can parse anything)
                    base64: () => 4000, // Treated as string
                    date: () => 8500, // Specific date format
                    _other: () => 0
                });
            },
            unknown: () => 0, // Unknown/any is least specific
            _other: () => 0
        });
    }

    private generateArrayParsing(writer: Writer, unionReference: ast.ClassReference): void {
        // Get all container types (list, set, map) and sort by specificity (most specific first)
        const containerMembers = this.members
            .filter((m) => this.isContainerType(m.typeReference))
            .sort((a, b) => this.compareTypeSpecificity(a, b));

        if (containerMembers.length === 0) {
            return;
        }

        // Generate dictionary of discriminator -> type mappings (most specific first)
        writer.writeTextStatement("var document = JsonDocument.ParseValue(ref reader)");
        writer.writeLine();
        writer.write("var types = new (string Key, System.Type Type)[] { ");
        containerMembers.forEach((member, index) => {
            const isLast = index === containerMembers.length - 1;
            writer.write(`("${member.discriminator}", typeof(`);
            writer.write(member.csharpTypeForTypeof.asNonOptional());
            writer.write("))");
            if (!isLast) {
                writer.write(", ");
            }
        });
        writer.writeTextStatement(" }");
        writer.writeLine();

        // Iterate through types and try deserializing
        writer.writeLine("foreach (var (key, type) in types)");
        writer.pushScope();
        writer.writeLine("try");
        writer.pushScope();
        writer.writeTextStatement("var value = document.Deserialize(type, options)");
        writer.writeLine("if (value != null)");
        writer.pushScope();
        writer.writeNode(unionReference);
        writer.writeTextStatement(" result = new(key, value)");
        writer.writeTextStatement("return result");
        writer.popScope();
        writer.popScope();
        writer.writeLine("catch (JsonException)");
        writer.pushScope();
        writer.writeTextStatement("// Try next type");
        writer.popScope();
        writer.popScope();
    }

    private generateObjectParsing(writer: Writer, unionReference: ast.ClassReference): void {
        // Get all types that can be deserialized from StartObject (named types + maps)
        // and sort by specificity (most specific first)
        const objectMembers = this.members
            .filter((m) => this.isNamedType(m.typeReference) || this.isMapType(m.typeReference))
            .sort((a, b) => this.compareTypeSpecificity(a, b));

        if (objectMembers.length === 0) {
            return;
        }

        // Generate dictionary of discriminator -> type mappings (most specific first)
        writer.writeTextStatement("var document = JsonDocument.ParseValue(ref reader)");
        writer.writeLine();
        writer.write("var types = new (string Key, System.Type Type)[] { ");
        objectMembers.forEach((member, index) => {
            const isLast = index === objectMembers.length - 1;
            writer.write(`("${member.discriminator}", typeof(`);
            writer.write(member.csharpTypeForTypeof.asNonOptional());
            writer.write("))");
            if (!isLast) {
                writer.write(", ");
            }
        });
        writer.writeTextStatement(" }");
        writer.writeLine();

        // Iterate through types and try deserializing
        writer.writeLine("foreach (var (key, type) in types)");
        writer.pushScope();
        writer.writeLine("try");
        writer.pushScope();
        writer.writeTextStatement("var value = document.Deserialize(type, options)");
        writer.writeLine("if (value != null)");
        writer.pushScope();
        writer.writeNode(unionReference);
        writer.writeTextStatement(" result = new(key, value)");
        writer.writeTextStatement("return result");
        writer.popScope();
        writer.popScope();
        writer.writeLine("catch (JsonException)");
        writer.pushScope();
        writer.writeTextStatement("// Try next type");
        writer.popScope();
        writer.popScope();
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
