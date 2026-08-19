import { getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast, escapeForCSharpString, is, Writer } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type ExampleUnionType = FernIr.ExampleUnionType;
type TypeDeclaration = FernIr.TypeDeclaration;
type UnionTypeDeclaration = FernIr.UnionTypeDeclaration;

import { generateFields, getGeneratedPropertyName } from "../generateFields.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { ObjectGenerator } from "../object/ObjectGenerator.js";
import { ExampleGenerator } from "../snippets/ExampleGenerator.js";
import { planVariantJsonStripping, VariantStripInput } from "./planVariantJsonStripping.js";

const basePropertiesClassName = "BaseProperties";

export class UnionGenerator extends FileGenerator<CSharpFile, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ast.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    private readonly unionMemberTypeMap: Map<FernIr.SingleUnionType, ast.Type>;
    private readonly discriminantPropertyName: string;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        const basePropNames = unionDeclaration.baseProperties.map((p) => this.case.pascalSafe(p.name));

        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration);

        this.exampleGenerator = new ExampleGenerator(context);
        this.unionMemberTypeMap = new Map(
            unionDeclaration.types.map((type) => this.getCsharpTypeMapEntry(type, context))
        );
        // Resolve the discriminant property name the same way the discriminant field does
        // (via getPropertyNameFor). Computed here so it is available on every code path,
        // including doGenerateSnippet, which does not call doGenerate.
        this.discriminantPropertyName = this.model.getPropertyNameFor(
            this.generation.case.resolveNameAndWireValue(this.unionDeclaration.discriminant)
        );
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
            type: ast.Class.ClassType.Record
        });

        const discriminant = class_.addField({
            origin: this.generation.case.resolveNameAndWireValue(this.unionDeclaration.discriminant),
            enclosingType: class_,
            summary: "Discriminant value",
            jsonPropertyName: getWireValue(this.unionDeclaration.discriminant),
            access: ast.Access.Public,
            type: this.Primitive.string,
            get: "public",
            set: "internal"
        });

        const value = class_.addField({
            enclosingType: class_,
            summary: "Discriminated union value",
            access: ast.Access.Public,
            type: this.Primitive.object.asOptional(),
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
                annotations: [this.System.Serializable]
            });
            generateFields(basePropertiesClass, {
                properties: this.unionDeclaration.baseProperties,
                className: this.classReference.name,
                context: this.context
            });

            class_.addNestedClass(basePropertiesClass);
        }

        // When the union has required base properties, the internal constructor is used by
        // ReadAsPropertyName (dictionary-key deserialization) which only has the discriminant
        // available and cannot populate the required base properties. Annotate it with
        // [SetsRequiredMembers] so callers are not forced to set them at that call site.
        const hasRequiredBaseProperties = baseProperties.some((property) => property.isRequired);
        class_.addConstructor({
            access: ast.Access.Internal,
            annotations: hasRequiredBaseProperties
                ? [
                      this.csharp.annotation({
                          reference: this.csharp.classReference({
                              name: "SetsRequiredMembersAttribute",
                              namespace: "System.Diagnostics.CodeAnalysis"
                          })
                      })
                  ]
                : undefined,
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
                writer.writeTextStatement(`${discriminant.name} = type`);
                writer.writeTextStatement(`${value.name} = value`);
            })
        });

        this.unionDeclaration.types.forEach((type) => {
            const innerClassType = this.getUnionTypeClassReferenceByTypeName(
                this.case.pascalSafe(type.discriminantValue)
            );
            class_.addConstructor({
                doc: {
                    summary: (writer) => {
                        writer.write(`Create an instance of ${this.classReference.name} with `);
                        writer.writeSeeType(innerClassType);
                        writer.write(".");
                    }
                },
                access: ast.Access.Public,
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: innerClassType
                    })
                ],
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.writeTextStatement(`${discriminant.name} = "${getWireValue(type.discriminantValue)}"`);
                    writer.writeTextStatement("Value = value.Value");
                })
            });
        });

        // add IsFoo properties

        for (const type of this.unionDeclaration.types) {
            class_.addField({
                enclosingType: class_,
                doc: {
                    summary: (writer) =>
                        writer.write(
                            `Returns true if <see cref="${discriminant.name}"/> is "${getWireValue(type.discriminantValue)}"`
                        )
                },
                access: ast.Access.Public,
                type: this.Primitive.boolean,
                origin: class_.explicit(`Is${this.case.pascalUnsafe(type.discriminantValue)}`),
                get: true,
                initializer: this.csharp.codeblock(`${discriminant.name} == "${getWireValue(type.discriminantValue)}"`)
            });
        }

        // add AsFoo methods

        this.unionDeclaration.types.forEach((type) => {
            const memberType = this.getCsharpType(type);
            return class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write("Returns the value as a ");
                        writer.writeSeeType(memberType);
                        writer.write(
                            ` if <see cref="${discriminant.name}"/> is '${escapeForCSharpString(getWireValue(type.discriminantValue))}', otherwise throws an exception.`
                        );
                    },
                    exceptions: new Map([
                        [
                            "Exception",
                            (writer) => {
                                writer.write(
                                    `Thrown when <see cref="${discriminant.name}"/> is not '${escapeForCSharpString(getWireValue(type.discriminantValue))}'.`
                                );
                            }
                        ]
                    ])
                },
                access: ast.Access.Public,
                return_: memberType,
                name: `As${this.case.pascalUnsafe(type.discriminantValue)}`,
                bodyType: ast.Method.BodyType.Expression,
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.write(`Is${this.case.pascalUnsafe(type.discriminantValue)} ? `);
                    if (!is.Primitive.object(memberType.asNonOptional())) {
                        writer.write("(", memberType, ")");
                    }
                    writer.write(`${value.name}! : throw new `);
                    writer.writeNode(this.System.Exception.asFullyQualified());
                    writer.write('("');
                    writer.writeNode(this.classReference);
                    writer.write(
                        `.${discriminant.name} is not '${escapeForCSharpString(getWireValue(type.discriminantValue))}'")`
                    );
                }),
                parameters: []
            });
        });

        const tType = this.Types.Arbitrary("T");
        class_.addMethod({
            access: ast.Access.Public,
            name: "Match",
            return_: tType,
            typeParameters: [tType],
            parameters: [
                ...this.unionDeclaration.types.map((type) => {
                    const memberType = this.getCsharpType(type);
                    return this.csharp.parameter({
                        name: `on${this.case.pascalUnsafe(type.discriminantValue)}`,
                        type: this.System.Func([memberType], tType)
                    });
                }),
                this.csharp.parameter({
                    name: "onUnknown_",
                    type: this.System.Func([this.Primitive.string, this.Primitive.object.asOptional()], tType)
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine(`return ${discriminant.name} switch`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeNode(this.csharp.string_({ string: getWireValue(type.discriminantValue) }));
                    writer.write(" => ");
                    writer.writeLine(
                        `on${this.case.pascalUnsafe(type.discriminantValue)}(As${this.case.pascalUnsafe(type.discriminantValue)}()),`
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
                        name: `on${this.case.pascalUnsafe(type.discriminantValue)}`,
                        type: this.System.Action([memberType])
                    });
                }),
                this.csharp.parameter({
                    name: "onUnknown_",
                    type: this.System.Action([this.Primitive.string, this.Primitive.object.asOptional()])
                })
            ],
            body: this.csharp.codeblock((writer: Writer) => {
                writer.writeLine(`switch (${discriminant.name})`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeLine(`case "${getWireValue(type.discriminantValue)}":`);
                    writer.indent();
                    writer.writeTextStatement(
                        `on${this.case.pascalUnsafe(type.discriminantValue)}(As${this.case.pascalUnsafe(type.discriminantValue)}())`
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

        // add TryAsFoo methods

        this.unionDeclaration.types.forEach((type) => {
            const memberType = this.getCsharpType(type);
            return class_.addMethod({
                doc: {
                    summary: (writer) => {
                        writer.write("Attempts to cast the value to a ");
                        writer.writeSeeType(memberType);
                        writer.write(" and returns true if successful.");
                    }
                },
                access: ast.Access.Public,
                return_: this.Primitive.boolean,
                name: `TryAs${this.case.pascalUnsafe(type.discriminantValue)}`,
                body: this.csharp.codeblock((writer: Writer) => {
                    writer.writeLine(`if(${discriminant.name} == "${getWireValue(type.discriminantValue)}")`);
                    writer.pushScope();
                    writer.write("value = ");
                    if (!is.Primitive.object(memberType.asNonOptional())) {
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
                        type: memberType.asOptional(),
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
                        if (is.Primitive.object(memberType.asNonOptional())) {
                            // we can't have an implicit cast from object
                            return undefined;
                        }
                        const operator: ast.Class.CastOperator = {
                            type: ast.Class.CastOperator.Type.Implicit,
                            parameter: this.csharp.parameter({
                                name: "value",
                                type: this.getUnionTypeClassReferenceByTypeName(
                                    this.case.pascalSafe(type.discriminantValue)
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
                    origin: this.model.explicit(type, "Inner"),
                    reference: this.getUnionTypeClassReferenceByTypeName(this.case.pascalSafe(type.discriminantValue)),
                    summary: `Discriminated union type for ${getOriginalName(type.discriminantValue)}`,
                    access: ast.Access.Public,
                    type: memberType.isReferenceType ? ast.Class.ClassType.Record : ast.Class.ClassType.Struct,
                    annotations: [this.System.Serializable]
                });
                if (isNoProperties) {
                    unionTypeClass.addField({
                        origin: unionTypeClass.explicit("Value"),
                        enclosingType: unionTypeClass,
                        access: ast.Access.Internal,
                        type: memberType,
                        get: true,
                        set: false,
                        initializer: this.csharp.codeblock("null")
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
                    return_: this.Primitive.string,
                    name: "ToString",
                    parameters: [],
                    bodyType: ast.Method.BodyType.Expression,
                    body: this.csharp.codeblock(
                        memberType.isOptional
                            ? 'Value?.ToString() ?? "null"'
                            : is.Primitive.string(memberType)
                              ? "Value"
                              : 'Value.ToString() ?? "null"'
                    )
                });
                // we can't have an implicit cast from object or (IEnumerable<T>)
                const underlyingType = memberType.asNonOptional();
                // When memberType is optional and the underlying type has the same name as the inner class,
                // the implicit operator would be a self-conversion (CS0555) because within the inner class
                // scope, the unqualified type name refers to the inner class itself.
                // e.g., for `optional<Foo>`, the inner class `Foo` wrapping `Foo?` would generate
                // `implicit operator Foo(Foo? value)` which is a self-conversion.
                const innerClassName = this.getUnionTypeClassReferenceByTypeName(
                    this.case.pascalSafe(type.discriminantValue)
                ).name;
                const isSelfConversion =
                    memberType.isOptional &&
                    is.ClassReference(underlyingType) &&
                    underlyingType.name === innerClassName;
                if (!is.Primitive.object(underlyingType) && !is.Collection.list(underlyingType) && !isSelfConversion) {
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
        // A nested union-type class cannot share a name with a member of the enclosing union
        // (e.g. the discriminant property or the `Value` property), otherwise C# emits CS0102.
        const reservedNames = ["Value", "Type", this.discriminantPropertyName];
        const name = reservedNames.includes(type) ? `${type}Inner` : type;
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
        const unionReference = this.classReference;
        const class_ = this.csharp.class_({
            origin: enclosingClass.explicit("JsonConverter"),
            access: ast.Access.Internal,
            namespace: this.classReference.namespace,
            enclosingType: this.classReference,
            sealed: true,
            parentClassReference: this.System.Text.Json.Serialization.JsonConverter(unionReference),
            annotations: [this.System.Serializable]
        });

        class_.addMethod({
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

        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: unionReference,
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
                const discriminatorPropName = getWireValue(this.unionDeclaration.discriminant);
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

                // For samePropertiesAsObject variants, we strip the properties the union itself
                // owns — the discriminant and any base properties — from the JSON before
                // deserializing the variant, so they do not leak into the variant's
                // AdditionalProperties. The discriminant is preserved for a variant that declares a
                // property with the same wire name; base properties are always suppressed on the
                // variant leaf (see ObjectGenerator), so they are always stripped here.
                const samePropertiesAsObjectTypes = this.unionDeclaration.types.filter(
                    (type): type is FernIr.SingleUnionType & { shape: { propertiesType: "samePropertiesAsObject" } } =>
                        type.shape.propertiesType === "samePropertiesAsObject"
                );
                // Compute, per variant, the inputs the strip planner needs: whether the variant declares
                // the discriminant (so it must be preserved) and the base properties suppressed from
                // *this* variant's leaf (see ObjectGenerator). The strip set is per-variant, never
                // aggregated across variants — a base property a variant keeps on its leaf must not be
                // stripped, or that variant's value would be lost on deserialization.
                const variantStripInputs: VariantStripInput[] = samePropertiesAsObjectTypes.map((type) => {
                    const typeDecl = this.model.dereferenceType(type.shape.typeId).typeDeclaration;
                    const declaresDiscriminant =
                        typeDecl.shape.type === "object" &&
                        [...typeDecl.shape.properties, ...(typeDecl.shape.extendedProperties ?? [])].some(
                            (prop) => getWireValue(prop.name) === discriminatorPropName
                        );
                    return {
                        discriminantValue: getWireValue(type.discriminantValue),
                        declaresDiscriminant,
                        baseWireNamesToOmit: [...this.context.getBasePropertyWireNamesToOmitForType(type.shape.typeId)]
                    };
                });

                // Emit one stripped-JSON local per distinct strip set (variants that strip the same set
                // share it); a variant that strips nothing reads the raw `json`. The legacy variable names
                // are reused for the single-set common cases so unchanged unions keep identical output.
                const { locals: stripLocals, varByDiscriminant: strippedJsonVarByDiscriminant } =
                    planVariantJsonStripping(variantStripInputs, discriminatorPropName);
                for (const local of stripLocals) {
                    writer.writeLine(
                        local.commentKind === "base-properties"
                            ? "// Strip base properties owned by the union to prevent them from leaking into AdditionalProperties"
                            : local.commentKind === "discriminant-and-base-properties"
                              ? "// Strip properties owned by the union (discriminant and base properties) to prevent them from leaking into AdditionalProperties"
                              : "// Strip the discriminant property to prevent it from leaking into AdditionalProperties"
                    );
                    writer.writeLine(`var ${local.objName} = System.Text.Json.Nodes.JsonObject.Create(json);`);
                    for (const wireName of local.wireNames) {
                        writer.writeLine(`${local.objName}?.Remove("${wireName}");`);
                    }
                    writer.writeTextStatement(
                        `var ${local.varName} = ${local.objName} != null ? JsonSerializer.SerializeToElement(${local.objName}, options) : json`
                    );
                    writer.writeLine();
                }

                writer.writeLine("var value = discriminator switch");
                writer.pushScope();

                this.unionDeclaration.types.forEach((type) => {
                    const csharpType = this.getCsharpType(type);
                    const csharp = this.csharp;
                    function generateSerializeUnionMember(): void {
                        writer.writeNode(csharp.string_({ string: getWireValue(type.discriminantValue) }));
                        writer.write(" => ");
                        switch (type.shape.propertiesType) {
                            case "samePropertiesAsObject":
                                // Use the JSON with this variant's own union-owned properties (discriminant
                                // and/or base properties) removed; a variant that owns none reads `json`.
                                writer.write(
                                    strippedJsonVarByDiscriminant.get(getWireValue(type.discriminantValue)) ?? "json"
                                );
                                break;
                            case "singleProperty":
                                writer.write(`json.GetProperty("${getWireValue(type.shape.name)}")`);
                                break;
                            case "noProperties":
                                throw new Error("Internal Error; noProperties should not be used for deserialization");
                            default:
                                assertNever(type.shape);
                        }
                        if (csharpType.isReferenceType === false) {
                            // non-reference types can be always be deserialized directly as is
                            writer.write(".Deserialize<", csharpType, ">(options)");
                        } else {
                            // reference types need to always be deserialized to an optional type
                            // and if it is not optional, then we can tack on the throw condition
                            // (this ensures that the code is valid regardless if it is a record struct or class types)
                            writer.write(".Deserialize<", csharpType.asOptional(), ">(options)");

                            if (!csharpType.isOptional) {
                                writer.write(' ?? throw new JsonException("Failed to deserialize ', csharpType, '")');
                            }
                        }
                        writer.writeLine(",");
                    }

                    switch (type.shape.propertiesType) {
                        case "noProperties":
                            writer.writeNode(csharp.string_({ string: getWireValue(type.discriminantValue) }));
                            writer.writeLine(" => null,");
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
                const jsonObjReference = this.System.Text.Json.Nodes.JsonObject;
                writer.writeNode(this.System.Text.Json.Nodes.JsonNode);
                writer.writeLine(` json = value.${discriminant.name} switch`);
                writer.pushScope();
                this.unionDeclaration.types.forEach((type) => {
                    writer.writeNode(this.csharp.string_({ string: getWireValue(type.discriminantValue) }));
                    writer.write(" => ");
                    switch (type.shape.propertiesType) {
                        case "samePropertiesAsObject":
                            writer.write("JsonSerializer.SerializeToNode(value.Value, options),");
                            break;
                        case "singleProperty":
                            writer.writeNode(
                                jsonObjReference.new({
                                    arguments_: [
                                        {
                                            name: `["${getWireValue(type.shape.name)}"]`,
                                            assignment: this.csharp.codeblock(
                                                `JsonSerializer.SerializeToNode(value.${value.name}, options)`
                                            )
                                        }
                                    ]
                                })
                            );
                            writer.writeLine();
                            // writer.pushScope();
                            // writer.writeLine(
                            // `["${getWireValue(type.shape.name)}"] = JsonSerializer.SerializeToNode(value.${value.name}, options)`
                            //);
                            // writer.dedent();
                            // writer.writeLine("},");
                            writer.writeLine(",");
                            break;
                        case "noProperties":
                            writer.writeLine("null,");
                            break;
                    }
                });
                writer.write("_ => JsonSerializer.SerializeToNode(value.Value, options)");
                writer.popScope();
                writer.writeStatement(" ?? ", jsonObjReference.new());
                writer.writeTextStatement(
                    `json["${getWireValue(this.unionDeclaration.discriminant)}"] = value.${discriminant.name}`
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
        // ReadAsPropertyName method - for dictionary key deserialization
        class_.addMethod({
            access: ast.Access.Public,
            override: true,
            return_: unionReference,
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
                writer.writeTextStatement(
                    `var stringValue = reader.GetString() ?? throw new JsonException("The JSON property name could not be read as a string.")`
                );
                writer.write("return new ");
                writer.writeNode(unionReference);
                writer.writeTextStatement(`(stringValue, stringValue)`);
            })
        });

        // WriteAsPropertyName method - for dictionary key serialization
        class_.addMethod({
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
                writer.writeTextStatement(`writer.WritePropertyName(value.${discriminant.name})`);
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
                // Property-less members carry no value; represent it as a nullable object
                // so it round-trips as null (an empty object cannot be compared structurally).
                return [type, this.Primitive.object.asOptional()];
            case "samePropertiesAsObject":
                return [type, context.csharpTypeMapper.convertToClassReference(type.shape, { fullyQualified: true })];
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
        innerValue: ast.AstNode | undefined;
    }): ast.AstNode {
        // todo - this should really be dereferencing the type and looking it up...
        return this.csharp.instantiateClass({
            classReference: this.getUnionTypeClassReferenceByTypeName(
                this.case.pascalSafe(exampleUnion.singleUnionType.wireDiscriminantValue)
            ),
            // Property-less members have no inner value, so the inner class is
            // constructed with no arguments (e.g. `new Empty()`).
            arguments_: innerValue != null ? [innerValue] : []
        });
    }

    private generateInnerValueSnippet({
        unionType,
        parseDatetimes
    }: {
        unionType: FernIr.ExampleSingleUnionType;
        parseDatetimes: boolean;
    }): ast.AstNode | undefined {
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
                // Property-less members carry no value, so the inner union class
                // is instantiated with no constructor arguments.
                return undefined;
            default:
                assertNever(unionType.shape);
        }
    }
    public shouldGenerateSnippet(): boolean {
        // Serialization-test generation still opts out for unions with base properties; enabling
        // those round-trip tests is tracked separately. Example/snippet generation (doGenerateSnippet)
        // does handle base properties and is called independently of this gate.
        if (this.unionDeclaration.baseProperties.length > 0) {
            return false;
        }
        return true;
    }

    /**
     * Builds object-initializer entries for the base properties that were suppressed from the
     * selected variant leaf. Those fields no longer live on the leaf (see ObjectGenerator), so the
     * envelope snippet must set them — otherwise a required base property like `Name` would be
     * missing and the example would not compile. Base properties that remain on the leaf (e.g. for a
     * variant shared with a union that doesn't own them) are left to the leaf snippet, so the
     * example doesn't set them redundantly.
     */
    private generateBasePropertySnippetProperties({
        exampleUnion,
        parseDatetimes
    }: {
        exampleUnion: ExampleUnionType;
        parseDatetimes: boolean;
    }): { name: string; value: ast.AstNode }[] {
        if (this.unionDeclaration.baseProperties.length === 0) {
            return [];
        }
        const shape = exampleUnion.singleUnionType.shape;
        if (shape.type !== "samePropertiesAsObject") {
            return [];
        }
        const wireNamesToOmit = this.context.getBasePropertyWireNamesToOmitForType(shape.typeId);
        if (wireNamesToOmit.size === 0) {
            return [];
        }
        const exampleByWireValue = new Map(
            (exampleUnion.baseProperties ?? []).map((property) => [getWireValue(property.name), property])
        );

        const properties: { name: string; value: ast.AstNode }[] = [];
        for (const baseProperty of this.unionDeclaration.baseProperties) {
            const wireName = getWireValue(baseProperty.name);
            if (!wireNamesToOmit.has(wireName)) {
                // Still present on the leaf; the leaf snippet sets it.
                continue;
            }
            const exampleProperty = exampleByWireValue.get(wireName);
            if (exampleProperty == null) {
                // Optional base properties absent from the example are simply omitted.
                continue;
            }
            properties.push({
                name: this.getBasePropertyName(baseProperty),
                value: this.exampleGenerator.getSnippetForTypeReference({
                    exampleTypeReference: exampleProperty.value,
                    parseDatetimes
                })
            });
        }
        return properties;
    }

    /**
     * The envelope's C# property name for a base property. Resolves through the shared name registry
     * so the object-initializer name matches the exact field the envelope generates — including any
     * keyword/builtin/collision redirection (e.g. a base property named `getHashCode` becomes
     * `GetHashCode_`, which the naming heuristic alone cannot see).
     *
     * Ordering contract: the registry entry is created by the union envelope's `doGenerate`, where
     * `generateFields` registers each base-property field under its IR node as origin. The generator
     * runs `generateModels()` — which invokes every type's `doGenerate` — before any example/snippet
     * generation, so by the time this is called the lookup hits. If it ever misses (the envelope has
     * not been generated yet) we log a warning and fall back to the naming heuristic; because that
     * heuristic cannot see keyword/collision redirection, a miss signals a real ordering bug rather
     * than something to silently paper over.
     */
    private getBasePropertyName(baseProperty: FernIr.ObjectProperty): string {
        const registeredName = this.model.registry.getFieldNameByOrigin(baseProperty);
        if (registeredName != null) {
            return registeredName;
        }
        this.context.logger.warn(
            `Base property "${getWireValue(baseProperty.name)}" of union ${this.classReference.name} was not ` +
                "registered before its snippet was generated; falling back to the naming heuristic, which cannot " +
                "see keyword/collision redirection. This means the union envelope was generated after its " +
                "example — see the ordering contract on getBasePropertyName."
        );
        return getGeneratedPropertyName({
            caseConverter: this.case,
            className: this.classReference.name,
            name: baseProperty.name
        });
    }

    public doGenerateSnippet({
        exampleUnion,
        parseDatetimes
    }: {
        exampleUnion: ExampleUnionType;
        parseDatetimes: boolean;
    }): ast.CodeBlock {
        const innerValue = this.generateInnerValueSnippet({ unionType: exampleUnion.singleUnionType, parseDatetimes });
        const innerObjectInstantiation = this.generateInnerUnionClassSnippet({ exampleUnion, innerValue });
        const baseProperties = this.generateBasePropertySnippetProperties({ exampleUnion, parseDatetimes });
        const instantiateClass = this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [innerObjectInstantiation],
            properties: baseProperties.length > 0 ? baseProperties : undefined,
            multiline: baseProperties.length > 0
        });
        return this.csharp.codeblock((writer: Writer) => writer.writeNode(instantiateClass));
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
