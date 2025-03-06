import { assertNever } from "@fern-api/core-utils";
import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";
import { ExampleObjectType, NameAndWireValue, TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExampleGenerator } from "../snippets/ExampleGenerator";

export class UnionGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: csharp.ClassReference;
    private readonly exampleGenerator: ExampleGenerator;
    private readonly discriminantPropertyName: string;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.csharpTypeMapper.convertToClassReference(this.typeDeclaration.name);
        this.exampleGenerator = new ExampleGenerator(context);
        this.discriminantPropertyName = this.unionDeclaration.discriminant.name.pascalCase.safeName;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: csharp.Access.Public,
            type: csharp.Class.ClassType.Record
        });

        class_.addField(
            csharp.field({
                summary: "Discriminator property name for serialization/deserialization",
                name: "DiscriminatorName",
                type: csharp.Type.string(),
                access: csharp.Access.Internal,
                const_: true,
                initializer: csharp.codeblock(`"${this.unionDeclaration.discriminant.name.originalName}"`)
            })
        );

        class_.addField(
            csharp.field({
                summary: "Discriminant value",
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
                type: csharp.Type.object(),
                name: "Value",
                get: "public",
                set: "internal"
            })
        );

        class_.addConstructors(
            this.unionDeclaration.types
                .map((type) => {
                    const memberType = this.getCsharpType(type);
                    if (!memberType) {
                        return undefined;
                    }
                    const ctor: csharp.Class.Constructor = {
                        doc: {
                            summary: (writer) => {
                                writer.write(`Create an instance of ${this.classReference.name} with <see cref="`);
                                writer.writeNode(memberType);
                                writer.write("\"/>.");
                            }
                        },
                        access: csharp.Access.Public,
                        parameters: [
                            csharp.parameter({
                                name: "value",
                                type: memberType
                            })
                        ],
                        body: csharp.codeblock((writer) => {
                            writer.writeTextStatement(
                                `${this.discriminantPropertyName} = "${type.discriminantValue.wireValue}"`
                            );
                            writer.writeTextStatement("Value = value");
                        })
                    };
                    return ctor;
                })
                .filter((constructor) => constructor !== undefined)
        );

        // add IsFoo properties
        class_.addFields(
            this.unionDeclaration.types
                .map((type) => {
                    const csharpType = this.getCsharpType(type);
                    if (!csharpType) {
                        return undefined;
                    }
                    return csharp.field({
                        doc: {
                            summary: (writer) => {
                                writer.write("Returns true if of type <see cref=\"");
                                writer.writeNode(csharpType);
                                writer.write("\"/>.");
                            }
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
                .filter((field) => field !== undefined)
        );

        // add AsFoo methods
        class_.addMethods(
            this.unionDeclaration.types
                .map((type) => {
                    const memberType = this.getCsharpType(type);
                    if (!memberType) {
                        return undefined;
                    }
                    return csharp.method({
                        doc: {
                            summary: (writer) => {
                                writer.write("Returns the value as a <see cref=\"");
                                writer.writeNode(memberType);
                                writer.write('"/> if it is of that type, otherwise throws an exception.');
                            },
                            exceptions: new Map([
                                [
                                    "InvalidCastException",
                                    (writer) => {
                                        writer.write("Thrown when the value is not an instance of <see cref=\"");
                                        writer.writeNode(memberType);
                                        writer.write('"/>.');
                                    }
                                ]
                            ])
                        },
                        access: csharp.Access.Public,
                        return_: memberType,
                        name: `As${type.discriminantValue.name.pascalCase.unsafeName}`,
                        bodyType: csharp.Method.BodyType.Expression,
                        body: csharp.codeblock((writer) => {
                            writer.write("(");
                            writer.writeNode(memberType);
                            writer.write(") Value");
                        }),
                        parameters: []
                    });
                })
                .filter((method) => method !== undefined)
        );

        const tTypeParameter = csharp.typeParameter("T");
        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Match",
                return_: tTypeParameter,
                typeParameters: [tTypeParameter],
                parameters: this.unionDeclaration.types
                    .map((type) => {
                        const memberType = this.getCsharpType(type);
                        if (!memberType) {
                            return undefined;
                        }
                        return csharp.parameter({
                            name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                            type: csharp.Type.func({
                                typeParameters: [memberType],
                                returnType: tTypeParameter
                            })
                        });
                    })
                    .filter((parameter) => parameter !== undefined),
                body: csharp.codeblock((writer) => {
                    writer.writeLine(`return ${this.discriminantPropertyName} switch`);
                    writer.writeLine("{");
                    writer.indent();
                    this.unionDeclaration.types.forEach((type) => {
                        if (!this.getCsharpType(type)) {
                            return;
                        }
                        writer.write(`"${type.discriminantValue.wireValue}" => `);
                        writer.writeLine(
                            `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}()),`
                        );
                    });
                    writer.writeLine(
                        `_ => throw new Exception($"Unexpected ${this.discriminantPropertyName}: {${this.discriminantPropertyName}}")`
                    );
                    writer.dedent();
                    writer.writeTextStatement("}");
                })
            })
        );

        class_.addMethod(
            csharp.method({
                access: csharp.Access.Public,
                name: "Visit",
                parameters: this.unionDeclaration.types
                    .map((type) => {
                        const memberType = this.getCsharpType(type);
                        if (!memberType) {
                            return undefined;
                        }
                        return csharp.parameter({
                            name: `on${type.discriminantValue.name.pascalCase.unsafeName}`,
                            type: csharp.Type.action({
                                typeParameters: [memberType]
                            })
                        });
                    })
                    .filter((parameter) => parameter !== undefined),
                body: csharp.codeblock((writer) => {
                    writer.writeLine(`switch (${this.discriminantPropertyName})`);
                    writer.writeLine("{");
                    writer.indent();
                    this.unionDeclaration.types.forEach((type) => {
                        if (!this.getCsharpType(type)) {
                            return;
                        }
                        writer.writeLine(`case "${type.discriminantValue.wireValue}":`);
                        writer.indent();
                        writer.writeTextStatement(
                            `on${type.discriminantValue.name.pascalCase.unsafeName}(As${type.discriminantValue.name.pascalCase.unsafeName}())`
                        );
                        writer.writeLine("break;");
                        writer.dedent();
                    });
                    writer.writeLine("default:");
                    writer.indent();
                    writer.writeLine(
                        `throw new Exception($"Unexpected ${this.discriminantPropertyName}: {${this.discriminantPropertyName}}");`
                    );
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
            this.unionDeclaration.types
                .map((type) => {
                    const memberType = this.getCsharpType(type);
                    if (!memberType) {
                        return undefined;
                    }
                    return csharp.method({
                        doc: {
                            summary: (writer) => {
                                writer.write("Attempts to cast the value to a <see cref=\"");
                                writer.writeNode(memberType);
                                writer.write("\"/> and returns true if successful.");
                            }
                        },
                        access: csharp.Access.Public,
                        return_: csharp.Type.boolean(),
                        name: `TryAs${type.discriminantValue.name.pascalCase.unsafeName}`,
                        body: csharp.codeblock((writer) => {
                            writer.write("if(Value is ");
                            writer.writeNode(memberType.unwrapIfOptional());
                            writer.write(" asValue){");
                            writer.indent();
                            writer.writeTextStatement("value = asValue");
                            writer.writeTextStatement("return true");
                            writer.dedent();
                            writer.write("}");
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
                .filter((method) => method !== undefined)
        );

        // add implicit conversion operators
        class_.addOperators(
            this.unionDeclaration.types
                .map((type) => {
                    const memberType = this.getCsharpType(type);
                    if (!memberType) {
                        return undefined;
                    }
                    const operator: csharp.Class.CastOperator = {
                        type: csharp.Class.CastOperator.Type.Implicit,
                        parameter: csharp.parameter({
                            name: "value",
                            type: memberType
                        }),
                        useExpressionBody: true,
                        body: csharp.codeblock("new (value)")
                    };
                    return operator;
                })
                .filter((operator) => operator !== undefined)
        );

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    private getCsharpType(type: FernIr.SingleUnionType): csharp.Type | undefined {
        switch (type.shape.propertiesType) {
            case "noProperties":
                this.context.logger.warn("Union type with no properties is not supported.");
                return undefined;
            case "samePropertiesAsObject":
                return csharp.Type.reference(this.context.csharpTypeMapper.convertToClassReference(type.shape));
            case "singleProperty":
                return this.context.csharpTypeMapper.convert({
                    reference: type.shape.type
                });
            default:
                assertNever(type.shape);
        }
    }

    public doGenerateSnippet({
        exampleObject,
        parseDatetimes
    }: {
        exampleObject: ExampleObjectType;
        parseDatetimes: boolean;
    }): csharp.CodeBlock {
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
        const instantiateClass = csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: args
        });
        return csharp.codeblock((writer) => writer.writeNode(instantiateClass));
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
        const propertyName = this.context.getPascalCaseSafeName(objectProperty.name);
        if (propertyName === className) {
            return `${propertyName}_`;
        }
        return propertyName;
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getSourceFileDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
