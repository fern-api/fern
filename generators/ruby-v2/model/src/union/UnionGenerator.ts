import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { ExampleUnionType, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateFields } from "../generateFields";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ObjectGenerator } from "../object/ObjectGenerator";

// import { ExampleGenerator } from "../snippets/ExampleGenerator";

const basePropertiesClassName = "BaseProperties";

export class UnionGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ruby.ClassReference;
    // private readonly exampleGenerator: ExampleGenerator;
    private readonly discriminantPropertyName: string;
    private readonly valuePropertyName: string = "Value";
    private readonly unionMemberTypeMap: Map<FernIr.SingleUnionType, ruby.Type>;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.discriminantPropertyName = unionDeclaration.discriminant.name.snakeCase.safeName;
        const basePropNames = unionDeclaration.baseProperties.map((p) => p.name.name.snakeCase.safeName);

        if (basePropNames.includes(this.valuePropertyName)) {
            this.valuePropertyName = `${this.valuePropertyName}_`;
        }

        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.typeMapper.convertToClassReference(this.typeDeclaration.name);

        if (
            basePropNames.includes(this.discriminantPropertyName) ||
            this.classReference.name === this.discriminantPropertyName
        ) {
            this.discriminantPropertyName = `${this.discriminantPropertyName}_`;
        }

        // this.exampleGenerator = new ExampleGenerator(context);
        this.unionMemberTypeMap = new Map(
            unionDeclaration.types.map((type) => this.getRubyTypeMapEntry(type, context))
        );
    }

    public doGenerate(): RubyFile {
        const rootModule = this.context.getRootModule();
        const class_ = ruby.class_({
            ...this.classReference,
            superclass: ruby.classReference({
                name: "Object",
                modules: ["Internal", "Types"]
            }),
            docstring: this.typeDeclaration.docs ?? undefined
        });

        class_.addField(
            ruby.field({
                docs: "Discriminant value",
                type: ruby.Type.string(),
                name: this.discriminantPropertyName
            })
        );

        class_.addField(
            ruby.field({
                docs: "Discriminated union value",
                // TODO: probably wrong type
                type: ruby.Type.object(this.classReference.name),
                name: this.valuePropertyName
            })
        );

        //         const baseProperties =
        //             this.unionDeclaration.baseProperties.length > 0
        //                 ? generateFields({
        //                       properties: this.unionDeclaration.baseProperties,
        //                       className: this.classReference.name,
        //                       context: this.context
        //                   })
        //                 : [];

        //         if (baseProperties.length > 0) {
        //             const baseProperties = generateFields({
        //                 properties: this.unionDeclaration.baseProperties,
        //                 className: this.classReference.name,
        //                 context: this.context
        //             });
        //             class_.addFields(baseProperties);

        //             const basePropertiesClass = ruby.class_({
        //                 name: basePropertiesClassName,
        //                 superclass: ruby.classReference({
        //                     name: "Model",
        //                     modules: ["Internal", "Types"]
        //                 }),
        //                 docstring: "Base properties for the discriminated union"
        //             });
        //             basePropertiesClass.addFields(baseProperties);
        //             class_.addNestedClass(basePropertiesClass);
        //         }

        //         class_.addConstructor({
        //             kind: "instance",
        //             name: "initialize",
        //             parameters: [
        //                 ruby.positionalParameter({
        //                     name: "type",
        //                     type: ruby.Type.string()
        //                 }),
        //                 ruby.positionalParameter({
        //                     name: "value",
        //                     // TODO: probably wrong type
        //                     type: ruby.Type.object(this.classReference.name)
        //                 })
        //             ],
        //             body: ruby.codeblock((writer) => {
        //                 writer.writeTextStatement(`${this.discriminantPropertyName} = type`);
        //                 writer.writeTextStatement(`${this.valuePropertyName} = value`);
        //             })
        //         });
        //         class_.addConstructors(
        //             this.unionDeclaration.types.map((type) => {
        //                 const innerClassType = this.getUnionTypeClassReferenceType(type);
        //                 const ctor: ruby.Class.Constructor = {
        //                     doc: {
        //                         summary: (writer) => {
        //                             writer.write(`Create an instance of ${this.classReference.name} with <see cref="`);
        //                             writer.writeNode(innerClassType);
        //                             writer.write('"/>.');
        //                         }
        //                     },
        //                     access: ruby.Access.Public,
        //                     parameters: [
        //                         ruby.parameter({
        //                             name: "value",
        //                             type: innerClassType
        //                         })
        //                     ],
        //                     body: ruby.codeblock((writer) => {
        //                         writer.writeTextStatement(
        //                             `${this.discriminantPropertyName} = "${type.discriminantValue.wireValue}"`
        //                         );
        //                         writer.writeTextStatement("Value = value.Value");
        //                     })
        //                 };
        //                 return ctor;
        //             })
        //         );

        //         // add IsFoo properties
        //         class_.addFields(
        //             this.unionDeclaration.types.map((type) => {
        //                 return ruby.field({
        //                     doc: {
        //                         summary: (writer) =>
        //                             writer.write(
        //                                 `Returns true if <see cref="${this.discriminantPropertyName}"/> is "${type.discriminantValue.wireValue}"`
        //                             )
        //                     },
        //                     access: ruby.Access.Public,
        //                     type: ruby.Type.boolean(),
        //                     name: `Is${type.discriminantValue.name.pascalCase.unsafeName}`,
        //                     get: true,
        //                     initializer: ruby.codeblock(
        //                         `${this.discriminantPropertyName} == "${type.discriminantValue.wireValue}"`
        //                     )
        //                 });
        //             })
        //         );

        //         // add AsFoo methods
        //         class_.addMethods(
        //             this.unionDeclaration.types.map((type) => {
        //                 const memberType = this.getRubyType(type);
        //                 return ruby.method({
        //                     doc: {
        //                         summary: (writer) => {
        //                             writer.write('Returns the value as a <see cref="');
        //                             writer.writeNode(memberType);
        //                             writer.write(
        //                                 `"/> if <see cref="${this.discriminantPropertyName}"/> is '${escapeForCSharpString(type.discriminantValue.wireValue)}', otherwise throws an exception.`
        //                             );
        //                         },
        //                         exceptions: new Map([
        //                             [
        //                                 "Exception",
        //                                 (writer) => {
        //                                     writer.write(
        //                                         `Thrown when <see cref="${this.discriminantPropertyName}"/> is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'.`
        //                                     );
        //                                 }
        //                             ]
        //                         ])
        //                     },
        //                     access: ruby.Access.Public,
        //                     return_: memberType,
        //                     name: `As${type.discriminantValue.name.pascalCase.unsafeName}`,
        //                     bodyType: ruby.Method.BodyType.Expression,
        //                     body: ruby.codeblock((writer) => {
        //                         writer.write(`Is${type.discriminantValue.name.pascalCase.unsafeName} ? `);
        //                         if (memberType.unwrapIfOptional().internalType.type !== "object") {
        //                             writer.write("(");
        //                             writer.writeNode(memberType);
        //                             writer.write(")");
        //                         }
        //                         writer.write(`${this.valuePropertyName}! : throw new Exception("`);
        //                         writer.writeNode(this.classReference);
        //                         writer.write(
        //                             `.${this.discriminantPropertyName} is not '${escapeForCSharpString(type.discriminantValue.wireValue)}'")`
        //                         );
        //                     }),
        //                     parameters: []
        //                 });
        //             })
        //         );

        //         const tTypeParameter = ruby.typeParameter("T");
        //         class_.addMethod(
        //             ruby.method({
        //                 access: ruby.Access.Public,
        //                 name: "Match",
        //                 return_: tTypeParameter,
        //                 typeParameters: [tTypeParameter],
        //                 parameters: [
        //                     ...this.unionDeclaration.types.map((type) => {
        //                         const memberType = this.getRubyType(type);
        //                         return ruby.parameter({
        //                             name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
        //                             type: ruby.Type.func({
        //                                 typeParameters: [memberType],
        //                                 returnType: tTypeParameter
        //                             })
        //                         });
        //                     }),
        //                     ruby.parameter({
        //                         name: "onUnknown_",
        //                         type: ruby.Type.func({
        //                             typeParameters: [ruby.Type.string(), ruby.Type.object().toOptionalIfNotAlready()],
        //                             returnType: tTypeParameter
        //                         })
        //                     })
        //                 ],
        //                 body: ruby.codeblock((writer) => {
        //                     writer.writeLine(`return ${this.discriminantPropertyName} switch`);
        //                     writer.writeLine("{");
        //                     writer.indent();
        //                     this.unionDeclaration.types.forEach((type) => {
        //                         writer.writeNode(ruby.string_({ string: type.discriminantValue.wireValue }));
        //                         writer.write(" => ");
        //                         writer.writeLine(
        //                             `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}()),`
        //                         );
        //                     });
        //                     writer.writeLine(`_ => onUnknown_(${this.discriminantPropertyName}, ${this.valuePropertyName})`);
        //                     writer.dedent();
        //                     writer.writeTextStatement("}");
        //                 })
        //             })
        //         );

        //         class_.addMethod(
        //             ruby.method({
        //                 access: ruby.Access.Public,
        //                 name: "Visit",
        //                 parameters: [
        //                     ...this.unionDeclaration.types.map((type) => {
        //                         const memberType = this.getRubyType(type);
        //                         return ruby.parameter({
        //                             name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
        //                             type: ruby.Type.action({
        //                                 typeParameters: [memberType]
        //                             })
        //                         });
        //                     }),
        //                     ruby.parameter({
        //                         name: "onUnknown_",
        //                         type: ruby.Type.action({
        //                             typeParameters: [ruby.Type.string(), ruby.Type.object().toOptionalIfNotAlready()]
        //                         })
        //                     })
        //                 ],
        //                 body: ruby.codeblock((writer) => {
        //                     writer.writeLine(`switch (${this.discriminantPropertyName})`);
        //                     writer.writeLine("{");
        //                     writer.indent();
        //                     this.unionDeclaration.types.forEach((type) => {
        //                         writer.writeLine(`case "${type.discriminantValue.wireValue}":`);
        //                         writer.indent();
        //                         writer.writeTextStatement(
        //                             `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}())`
        //                         );
        //                         writer.writeTextStatement("break");
        //                         writer.dedent();
        //                     });
        //                     writer.writeLine("default:");
        //                     writer.indent();
        //                     writer.writeTextStatement(
        //                         `onUnknown_(${this.discriminantPropertyName}, ${this.valuePropertyName})`
        //                     );
        //                     writer.writeTextStatement("break");
        //                     writer.dedent();
        //                     writer.writeLine("}");
        //                 })
        //             })
        //         );

        //         class_.addMethod(
        //             ruby.method({
        //                 access: ruby.Access.Public,
        //                 override: true,
        //                 return_: ruby.Type.string(),
        //                 name: "ToString",
        //                 parameters: [],
        //                 bodyType: ruby.Method.BodyType.Expression,
        //                 body: ruby.codeblock((writer) => {
        //                     writer.writeNode(
        //                         ruby.invokeMethod({
        //                             on: this.context.getJsonUtilsClassReference(),
        //                             method: "Serialize",
        //                             arguments_: [ruby.codeblock("this")]
        //                         })
        //                     );
        //                 })
        //             })
        //         );

        //         // add TryAsFoo methods
        //         class_.addMethods(
        //             this.unionDeclaration.types.map((type) => {
        //                 const memberType = this.getRubyType(type);
        //                 return ruby.method({
        //                     doc: {
        //                         summary: (writer) => {
        //                             writer.write('Attempts to cast the value to a <see cref="');
        //                             writer.writeNode(memberType);
        //                             writer.write('"/> and returns true if successful.');
        //                         }
        //                     },
        //                     access: ruby.Access.Public,
        //                     return_: ruby.Type.boolean(),
        //                     name: `TryAs${type.discriminantValue.name.pascalCase.unsafeName}`,
        //                     body: ruby.codeblock((writer) => {
        //                         writer.writeLine(
        //                             `if(${this.discriminantPropertyName} == "${type.discriminantValue.wireValue}")`
        //                         );
        //                         writer.writeLine("{");
        //                         writer.indent();
        //                         writer.write("value = ");
        //                         if (memberType.unwrapIfOptional().internalType.type !== "object") {
        //                             writer.write("(");
        //                             writer.writeNode(memberType);
        //                             writer.write(")");
        //                         }
        //                         writer.writeTextStatement(`${this.valuePropertyName}!`);
        //                         writer.writeTextStatement("return true");
        //                         writer.dedent();
        //                         writer.writeLine("}");
        //                         writer.writeTextStatement("value = null");
        //                         writer.writeTextStatement("return false");
        //                     }),
        //                     parameters: [
        //                         ruby.parameter({
        //                             name: "value",
        //                             type: memberType.toOptionalIfNotAlready(),
        //                             out: true
        //                         })
        //                     ]
        //                 });
        //             })
        //         );

        //         // add implicit conversion operators
        //         if (!baseProperties.some((p) => p.isRequired)) {
        //             class_.addOperators(
        //                 this.unionDeclaration.types
        //                     .map((type) => {
        //                         const memberType = this.getRubyType(type);
        //                         if (memberType.unwrapIfOptional().internalType.type === "object") {
        //                             // we can't have an implicit cast from object
        //                             return undefined;
        //                         }
        //                         const operator: ruby.Class.CastOperator = {
        //                             type: ruby.Class.CastOperator.Type.Implicit,
        //                             parameter: ruby.parameter({
        //                                 name: "value",
        //                                 type: this.getUnionTypeClassReferenceType(type)
        //                             }),
        //                             useExpressionBody: true,
        //                             body: ruby.codeblock("new (value)")
        //                         };
        //                         return operator;
        //                     })
        //                     .filter((x) => x !== undefined)
        //             );
        //         }

        //         class_.addNestedClasses(
        //             this.unionDeclaration.types.map((type) => {
        //                 const isNoProperties = type.shape.propertiesType === "noProperties";
        //                 const memberType = this.getRubyType(type);
        //                 const unionTypeClass = ruby.class_({
        //                     summary: `Discriminated union type for ${type.discriminantValue.name.originalName}`,
        //                     name: this.getUnionTypeClassName(type),
        //                     namespace: this.classReference.namespace,
        //                     access: ruby.Access.Public,
        //                     isNestedClass: true,
        //                     type: memberType.isReferenceType() ? ruby.Class.ClassType.Record : ruby.Class.ClassType.Struct,
        //                     annotations: [this.context.getSerializableAttribute()]
        //                 });
        //                 if (isNoProperties) {
        //                     unionTypeClass.addField(
        //                         ruby.field({
        //                             access: ruby.Access.Internal,
        //                             type: memberType,
        //                             name: "Value",
        //                             get: true,
        //                             set: false,
        //                             initializer: ruby.codeblock("new {}")
        //                         })
        //                     );
        //                 } else {
        //                     unionTypeClass.addConstructor({
        //                         access: ruby.Access.Public,
        //                         parameters: [
        //                             ruby.parameter({
        //                                 name: "value",
        //                                 type: memberType
        //                             })
        //                         ],
        //                         body: ruby.codeblock("Value = value;\n")
        //                     });
        //                     unionTypeClass.addField(
        //                         ruby.field({
        //                             access: ruby.Access.Internal,
        //                             type: memberType,
        //                             name: "Value",
        //                             get: true,
        //                             set: true
        //                         })
        //                     );
        //                 }
        //                 unionTypeClass.addMethod(
        //                     ruby.method({
        //                         access: ruby.Access.Public,
        //                         override: true,
        //                         return_: ruby.Type.string(),
        //                         name: "ToString",
        //                         parameters: [],
        //                         bodyType: ruby.Method.BodyType.Expression,
        //                         body: ruby.codeblock(
        //                             memberType.isOptional()
        //                                 ? "Value?.ToString()"
        //                                 : memberType.internalType.type !== "string"
        //                                   ? "Value.ToString()"
        //                                   : "Value"
        //                         )
        //                     })
        //                 );
        //                 // we can't have an implicit cast from object or (IEnumerable<T>)
        //                 if (!["object", "list"].includes(memberType.unwrapIfOptional().internalType.type)) {
        //                     unionTypeClass.addOperator({
        //                         type: ruby.Class.CastOperator.Type.Implicit,
        //                         parameter: ruby.parameter({
        //                             name: "value",
        //                             type: memberType
        //                         }),
        //                         useExpressionBody: true,
        //                         body: ruby.codeblock("new (value)")
        //                     });
        //                 }
        //                 return unionTypeClass;
        //             })
        //         );

        //         class_.addNestedClass(this.generateJsonConverter(baseProperties));

        rootModule.addStatement(class_);
        return new RubyFile({
            node: ruby.withComments(rootModule, [ruby.frozenStringLiteral]),
            directory: this.getFilepath(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    // private getUnionTypeClassReferenceType(type: FernIr.SingleUnionType): ruby.Type {
    //     return ruby.Type.reference(this.getUnionTypeClassReference(type));
    // }

    // private getUnionTypeClassReferenceTypeByTypeName(typeName: string): ruby.Type {
    //     return ruby.Type.reference(this.getUnionTypeClassReferenceByTypeName(typeName));
    // }

    // private getUnionTypeClassReference(type: FernIr.SingleUnionType): ruby.ClassReference {
    //     return ruby.classReference({
    //         namespace: this.classReference.namespace,
    //         name: `${this.classReference.name}.${this.getUnionTypeClassName(type)}`
    //     });
    // }

    // private getUnionTypeClassReferenceByTypeName(type: string): ruby.ClassReference {
    //     return ruby.classReference({
    //         namespace: this.classReference.namespace,
    //         name: `${this.classReference.name}.${this.getUnionTypeClassNameByTypeName(type)}`
    //     });
    // }

    // private getUnionTypeClassName(type: FernIr.SingleUnionType): string {
    //     return this.getUnionTypeClassNameByTypeName(type.discriminantValue.name.pascalCase.safeName);
    // }

    // private getUnionTypeClassNameByTypeName(typeName: string): string {
    //     if (["Value", "Type"].includes(typeName)) {
    //         return `${typeName}Inner`;
    //     }
    //     return typeName;
    // }

    // private getRubyType(type: FernIr.SingleUnionType): ruby.Type {
    //     const rubyType = this.unionMemberTypeMap.get(type);
    //     if (rubyType === undefined) {
    //         throw new Error("Could not find Ruby type for SingleUnionType");
    //     }
    //     return rubyType;
    // }

    private getRubyTypeMapEntry(
        type: FernIr.SingleUnionType,
        context: ModelGeneratorContext
    ): [FernIr.SingleUnionType, ruby.Type] {
        switch (type.shape.propertiesType) {
            case "noProperties":
                return [type, ruby.Type.object("TODO")];
            case "samePropertiesAsObject":
                return [
                    type,
                    ruby.Type.reference(
                        context.typeMapper.convertToClassReference(type.shape, { fullyQualified: true })
                    )
                ];
            case "singleProperty":
                return [
                    type,
                    context.typeMapper.convert({
                        reference: type.shape.type,
                        fullyQualified: true
                    })
                ];
            default:
                assertNever(type.shape);
        }
    }

    // private generateInnerUnionClassSnippet({
    //     exampleUnion,
    //     innerValue
    // }: {
    //     exampleUnion: ExampleUnionType;
    //     innerValue: ruby.AstNode;
    // }): ruby.AstNode {
    //     return ruby.instantiateClass({
    //         classReference: this.getUnionTypeClassReferenceByTypeName(
    //             exampleUnion.singleUnionType.wireDiscriminantValue.name.pascalCase.safeName
    //         ),
    //         arguments_: [innerValue]
    //     });
    // }

    // private generateInnerValueSnippet({
    //     unionType,
    //     parseDatetimes
    // }: {
    //     unionType: FernIr.ExampleSingleUnionType;
    //     parseDatetimes: boolean;
    // }): ruby.AstNode {
    //     switch (unionType.shape.type) {
    //         case "samePropertiesAsObject": {
    //             const typeDeclaration = this.context.getTypeDeclarationOrThrow(unionType.shape.typeId);
    //             const objectGenerator = new ObjectGenerator(
    //                 this.context,
    //                 typeDeclaration,
    //                 typeDeclaration.shape as FernIr.ObjectTypeDeclaration
    //             );
    //             return objectGenerator.doGenerateSnippet({ exampleObject: unionType.shape.object, parseDatetimes });
    //         }
    //         case "singleProperty":
    //             return this.exampleGenerator.getSnippetForTypeReference({
    //                 exampleTypeReference: unionType.shape,
    //                 parseDatetimes
    //             });
    //         case "noProperties":
    //             // no params into inner union class
    //             return ruby.codeblock("");
    //         default:
    //             assertNever(unionType.shape);
    //     }
    // }
    // public shouldGenerateSnippet(): boolean {
    //     if (this.unionDeclaration.baseProperties.length > 0) {
    //         // example union types don't come with base properties,
    //         // so there's no way to generate snippets for them
    //         return false;
    //     }
    //     return true;
    // }

    // public doGenerateSnippet({
    //     exampleUnion,
    //     parseDatetimes
    // }: {
    //     exampleUnion: ExampleUnionType;
    //     parseDatetimes: boolean;
    // }): ruby.CodeBlock {
    //     if (this.shouldGenerateSnippet() === false) {
    //         this.context.logger.warn(
    //             `Generating snippet for union type ${this.classReference.name} but it has base properties, which is not supported.`
    //         );
    //     }
    //     const innerValue = this.generateInnerValueSnippet({ unionType: exampleUnion.singleUnionType, parseDatetimes });
    //     const innerObjectInstantiation = this.generateInnerUnionClassSnippet({ exampleUnion, innerValue });
    //     const instantiateClass = ruby.instantiateClass({
    //         classReference: this.classReference,
    //         arguments_: [innerObjectInstantiation]
    //     });
    //     return ruby.codeblock((writer) => writer.writeNode(instantiateClass));
    // }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    private getFilename(): string {
        return `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`;
    }
}
