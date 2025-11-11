import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace WellKnownProtoValueGenerator {
    interface Args {
        context: ModelGeneratorContext;
        classReference: ast.ClassReference;
        typeDeclaration: TypeDeclaration;
        protoStructClassReference: ast.ClassReference;
    }
}

interface OperatorSpec {
    parameterType: ast.Type;
    body: ast.CodeBlock;
}

export class WellKnownProtoValueGenerator extends FileGenerator<
    CSharpFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private classReference: ast.ClassReference;
    private typeDeclaration: TypeDeclaration;
    private protoStructClassReference: ast.ClassReference;

    constructor({
        context,
        classReference,
        typeDeclaration,
        protoStructClassReference
    }: WellKnownProtoValueGenerator.Args) {
        super(context);
        this.classReference = classReference;
        this.typeDeclaration = typeDeclaration;
        this.protoStructClassReference = protoStructClassReference;
    }

    public doGenerate(): CSharpFile {
        const oneOfTypes = this.getProtoValueOneOfTypes();
        const class_ = this.csharp.class_({
            name: this.classReference.name,
            namespace: this.classReference.namespace,
            access: ast.Access.Public,
            sealed: true,
            parentClassReference: this.csharp.Type.oneOfBase(oneOfTypes),
            summary: this.typeDeclaration.docs,
            primaryConstructor: {
                parameters: [
                    this.csharp.parameter({
                        name: "value",
                        type: this.csharp.Type.oneOf(oneOfTypes)
                    })
                ],
                superClassArguments: [this.csharp.codeblock("value")]
            },
            annotations: [this.extern.System.Serializable]
        });

        for (const operator of this.getProtoValueOperators()) {
            class_.addOperator(operator);
        }

        this.context.common.getToStringMethod(class_);
        this.getToProtoMethod(class_);
        this.getFromProtoMethod(class_);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    private getToProtoMethod(cls: ast.Class): ast.Method {
        return cls.addMethod({
            name: "ToProto",
            access: ast.Access.Internal,
            isAsync: false,
            parameters: [],
            return_: this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value),
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.invokeMethod({
                        method: "Match",
                        generics: [this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)],
                        arguments_: [
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForString");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForNumber");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(".ForBool");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.write("list => new ");
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(" { ListValue = new ");
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.ListValue);
                                writer.write(" { Values = { list.Select(item => item?.ToProto()) } } }");
                            }),
                            this.csharp.codeblock((writer) => {
                                writer.write("nested => new ");
                                writer.writeNode(this.extern.Google.Protobuf.WellKnownTypes.Value);
                                writer.write(" { StructValue = ");
                                writer.writeNode(
                                    this.csharp.invokeMethod({
                                        on: this.csharp.codeblock("nested"),
                                        method: "ToProto",
                                        arguments_: []
                                    })
                                );
                                writer.write(" }");
                            })
                        ]
                    })
                );
            })
        });
    }

    private getFromProtoMethod(cls: ast.Class): ast.Method {
        return cls.addMethod({
            name: "FromProto",
            access: ast.Access.Internal,
            type: ast.MethodType.STATIC,
            isAsync: false,
            parameters: [
                this.csharp.parameter({
                    name: "value",
                    type: this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                })
            ],
            return_: this.csharp.Type.optional(this.csharp.Type.reference(this.classReference)),
            body: this.csharp.codeblock((writer) => {
                writer.write("return ");
                writer.writeNodeStatement(
                    this.csharp.switch_({
                        condition: this.csharp.codeblock("value.KindCase"),
                        cases: [
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                                    );
                                    writer.write(".KindOneofCase.StringValue");
                                }),
                                value: this.csharp.codeblock("value.StringValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                                    );
                                    writer.write(".KindOneofCase.NumberValue");
                                }),
                                value: this.csharp.codeblock("value.NumberValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                                    );
                                    writer.write(".KindOneofCase.BoolValue");
                                }),
                                value: this.csharp.codeblock("value.BoolValue")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                                    );
                                    writer.write(".KindOneofCase.ListValue");
                                }),
                                value: this.csharp.codeblock("value.ListValue.Values.Select(FromProto).ToList()")
                            },
                            {
                                label: this.csharp.codeblock((writer) => {
                                    writer.writeNode(
                                        this.csharp.Type.reference(this.extern.Google.Protobuf.WellKnownTypes.Value)
                                    );
                                    writer.write(".KindOneofCase.StructValue");
                                }),
                                value: this.csharp.invokeMethod({
                                    on: this.protoStructClassReference,
                                    method: "FromProto",
                                    arguments_: [this.csharp.codeblock("value.StructValue")]
                                })
                            },
                            {
                                label: this.csharp.codeblock("_"),
                                value: this.csharp.codeblock("null")
                            }
                        ]
                    })
                );
            })
        });
    }

    private getProtoValueOneOfTypes(): ast.Type[] {
        return [
            this.csharp.Type.string,
            this.csharp.Type.double,
            this.csharp.Type.boolean,
            this.csharp.Type.list(this.csharp.Type.optional(this.csharp.Type.reference(this.classReference))),
            this.csharp.Type.reference(this.protoStructClassReference)
        ];
    }

    private getProtoValueOperators(): ast.Class.Operator[] {
        const operatorSpecs: OperatorSpec[] = [
            {
                parameterType: this.csharp.Type.string,
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.boolean,
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.double,
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.reference(this.protoStructClassReference),
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.array(
                    this.csharp.Type.optional(this.csharp.Type.reference(this.classReference))
                ),
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.listType(
                    this.csharp.Type.optional(this.csharp.Type.reference(this.classReference))
                ),
                body: this.newValue()
            },
            {
                parameterType: this.csharp.Type.array(this.csharp.Type.string),

                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.array(this.csharp.Type.double),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.array(this.csharp.Type.optional(this.csharp.Type.double)),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.csharp.Type.array(this.csharp.Type.boolean),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.array(this.csharp.Type.optional(this.csharp.Type.boolean)),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.csharp.Type.listType(this.csharp.Type.string),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.listType(this.csharp.Type.double),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.listType(this.csharp.Type.optional(this.csharp.Type.double)),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            },
            {
                parameterType: this.csharp.Type.listType(this.csharp.Type.boolean),
                body: this.linqMap(this.instantiateProtoValue())
            },
            {
                parameterType: this.csharp.Type.listType(this.csharp.Type.optional(this.csharp.Type.boolean)),
                body: this.linqMap(this.wrapTernary(this.instantiateProtoValueWithOptional()))
            }
        ];
        return operatorSpecs.map((operatorSpec) => ({
            type: "implicit",
            parameter: this.csharp.parameter({
                name: "value",
                type: operatorSpec.parameterType
            }),
            body: operatorSpec.body,
            useExpressionBody: true
        }));
    }

    private newValue(): ast.CodeBlock {
        return this.csharp.codeblock("new(value)");
    }

    private linqMap(node: ast.AstNode): ast.CodeBlock {
        return this.csharp.codeblock((writer) => {
            writer.write("new(value.Select(v => ");
            writer.writeNode(node);
            writer.write(").ToList())");
        });
    }

    private wrapTernary(node: ast.AstNode): ast.AstNode {
        return this.csharp.ternary({
            condition: this.csharp.codeblock("v != null"),
            true_: node,
            false_: this.csharp.codeblock("null")
        });
    }

    private instantiateProtoValue(): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [this.csharp.codeblock("v")]
        });
    }

    private instantiateProtoValueWithOptional(): ast.ClassInstantiation {
        return this.csharp.instantiateClass({
            classReference: this.classReference,
            arguments_: [this.csharp.codeblock("v.Value")]
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.sourceFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
